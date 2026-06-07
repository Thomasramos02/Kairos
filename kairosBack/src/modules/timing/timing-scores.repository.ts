import { Inject, Injectable } from '@nestjs/common';
import { SQL, and, asc, desc, eq, gte, ilike, or, sql } from 'drizzle-orm';
import { createInMemoryId } from '../../common/in-memory-id';
import { DRIZZLE_DATABASE } from '../../database/database.tokens';
import { DrizzleDatabase } from '../../database/drizzle.provider';
import { businesses, timingScores } from '../../database/schema';
import { OfferedService } from '../../domain/offered-service';
import { TimingStage } from '../../domain/timing-stage';

const initialFallbackTimingRank = 1;
const initialFallbackTimingScore = 45;
const initialFallbackTimingStage = 'warming-up';
const initialFallbackTimingReason =
  'Initial listing score created while digital signal enrichment is pending.';

export type TimingScoreUpsertInput = {
  readonly businessId: string;
  readonly offeredService: OfferedService;
  readonly timingStage: TimingStage;
  readonly timingRank: number;
  readonly timingScore: number;
  readonly signalsCount: number;
  readonly reason: string;
  readonly calculatedAt: Date;
  readonly nextRefreshAt: Date | null;
  readonly status: 'ready' | 'failed';
  readonly errorMessage: string | null;
  readonly scoreVersion: number;
};

export type RankedBusinessListRow = {
  readonly businessId: string;
  readonly sourceDocumentNumber: string | null;
  readonly name: string;
  readonly registeredAt: Date;
  readonly city: string | null;
  readonly state: string;
  readonly industry: string;
  readonly source: string;
  readonly timingStage: TimingStage;
  readonly timingScore: number;
  readonly timingRank: number;
  readonly signalsCount: number;
  readonly reason: string;
  readonly total: number;
};

export type RankedBusinessesPageQuery = {
  readonly state?: string;
  readonly city?: string;
  readonly industry?: string;
  readonly search?: string;
  readonly timingStage?: TimingStage;
  readonly minScore?: number;
  readonly offeredService: OfferedService;
  readonly limit?: number;
  readonly offset?: number;
};

@Injectable()
export class TimingScoresRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly database: DrizzleDatabase,
  ) {}

  async upsertTimingScore(input: TimingScoreUpsertInput): Promise<void> {
    await this.database
      .insert(timingScores)
      .values({
        id: createInMemoryId('score'),
        ...input,
      })
      .onConflictDoUpdate({
        target: [timingScores.businessId, timingScores.offeredService],
        set: {
          calculatedAt: input.calculatedAt,
          errorMessage: input.errorMessage,
          nextRefreshAt: input.nextRefreshAt,
          reason: input.reason,
          scoreVersion: input.scoreVersion,
          signalsCount: input.signalsCount,
          status: input.status,
          timingRank: input.timingRank,
          timingScore: input.timingScore,
          timingStage: input.timingStage,
          updatedAt: input.calculatedAt,
        },
      });
  }

  async hasAnyTimingScoreForBusiness(businessId: string): Promise<boolean> {
    const [score] = await this.database
      .select({ id: timingScores.id })
      .from(timingScores)
      .where(eq(timingScores.businessId, businessId))
      .limit(1);

    return score !== undefined;
  }

  async listRankedBusinessesPage(
    query: RankedBusinessesPageQuery,
  ): Promise<{ readonly items: readonly RankedBusinessListRow[]; readonly total: number }> {
    const conditions = buildRankedBusinessConditions(query);
    const timingRank = sql<number>`coalesce(${timingScores.timingRank}, ${initialFallbackTimingRank})`;
    const timingScore = sql<number>`coalesce(${timingScores.timingScore}, ${initialFallbackTimingScore})`;
    const signalsCount = sql<number>`coalesce(${timingScores.signalsCount}, 0)`;
    const timingStage = sql<string>`coalesce(${timingScores.timingStage}, ${initialFallbackTimingStage})`;
    const reason = sql<string>`coalesce(${timingScores.reason}, ${initialFallbackTimingReason})`;
    const baseQuery = this.database
      .select({
        businessId: businesses.id,
        city: businesses.city,
        industry: businesses.industry,
        name: businesses.legalName,
        reason,
        registeredAt: businesses.registeredAt,
        signalsCount,
        sourceDocumentNumber: businesses.sourceDocumentNumber,
        source: businesses.sourceName,
        state: businesses.state,
        timingRank,
        timingScore,
        timingStage,
        total: sql<number>`count(*) over()`,
      })
      .from(businesses)
      .leftJoin(
        timingScores,
        and(
          eq(timingScores.businessId, businesses.id),
          eq(timingScores.offeredService, query.offeredService),
        ),
      )
      .where(and(...conditions))
      .orderBy(
        asc(timingRank),
        desc(timingScore),
        desc(signalsCount),
        desc(businesses.registeredAt),
      );

    const limitedQuery =
      query.limit === undefined ? baseQuery : baseQuery.limit(query.limit);
    const pagedQuery =
      query.offset === undefined ? limitedQuery : limitedQuery.offset(query.offset);

    const rows = await pagedQuery;

    return {
      items: rows.map(toRankedBusinessListRow),
      total: rows[0]?.total ?? 0,
    };
  }

  async findRankedBusinessById(
    businessId: string,
    offeredService: OfferedService,
  ): Promise<RankedBusinessListRow | null> {
    const [row] = await this.buildRankedBusinessQuery(offeredService)
      .where(
        and(
          eq(businesses.id, businessId),
          sql<boolean>`${businesses.lifecycleStage} <> 'archived'`,
        ),
      )
      .limit(1);

    return row === undefined ? null : toRankedBusinessListRow(row);
  }

  private buildRankedBusinessQuery(offeredService: OfferedService) {
    const selectFields = buildRankedBusinessSelectFields();

    return this.database
      .select(selectFields)
      .from(businesses)
      .leftJoin(
        timingScores,
        and(
          eq(timingScores.businessId, businesses.id),
          eq(timingScores.offeredService, offeredService),
        ),
      );
  }
}

function buildRankedBusinessSelectFields() {
  return {
    businessId: businesses.id,
    city: businesses.city,
    industry: businesses.industry,
    name: businesses.legalName,
    reason: sql<string>`coalesce(${timingScores.reason}, ${initialFallbackTimingReason})`,
    registeredAt: businesses.registeredAt,
    signalsCount: sql<number>`coalesce(${timingScores.signalsCount}, 0)`,
    sourceDocumentNumber: businesses.sourceDocumentNumber,
    source: businesses.sourceName,
    state: businesses.state,
    timingRank: sql<number>`coalesce(${timingScores.timingRank}, ${initialFallbackTimingRank})`,
    timingScore: sql<number>`coalesce(${timingScores.timingScore}, ${initialFallbackTimingScore})`,
    timingStage: sql<string>`coalesce(${timingScores.timingStage}, ${initialFallbackTimingStage})`,
    total: sql<number>`count(*) over()`,
  };
}

function buildRankedBusinessConditions(query: RankedBusinessesPageQuery) {
  const conditions: SQL[] = [
    sql<boolean>`${businesses.lifecycleStage} <> 'archived'`,
    sql<boolean>`${businesses.registeredAt} <= now()`,
  ];

  if (query.state !== undefined && query.state.trim().length > 0) {
    conditions.push(eq(businesses.state, query.state.trim().toUpperCase()));
  }

  if (query.city !== undefined && query.city.trim().length > 0) {
    conditions.push(
      ilike(businesses.city, `%${query.city.trim()}%`),
    );
  }

  if (query.industry !== undefined && query.industry.trim().length > 0) {
    const industrySearch = `%${query.industry.trim()}%`;

    conditions.push(
      or(
        eq(businesses.industry, query.industry.trim()),
        ilike(businesses.industry, industrySearch),
        eq(businesses.industry, "unclassified"),
      ) ?? sql<boolean>`false`,
    );
  }

  if (query.timingStage !== undefined) {
    conditions.push(
      sql<boolean>`coalesce(${timingScores.timingStage}, ${initialFallbackTimingStage}) = ${query.timingStage}`,
    );
  }

  if (query.minScore !== undefined) {
    conditions.push(
      gte(
        sql<number>`coalesce(${timingScores.timingScore}, ${initialFallbackTimingScore})`,
        query.minScore,
      ),
    );
  }

  if (query.search !== undefined && query.search.trim().length > 0) {
    const search = `%${query.search.trim()}%`;
    conditions.push(
      or(
        ilike(businesses.legalName, search),
        ilike(businesses.city, search),
        ilike(businesses.industry, search),
      ) ?? sql<boolean>`false`,
    );
  }

  return conditions;
}

function toRankedBusinessListRow(
  row: {
    businessId: string;
    city: string | null;
    industry: string;
    name: string;
    reason: string;
    registeredAt: Date;
    signalsCount: number;
    sourceDocumentNumber: string | null;
    source: string;
    state: string;
    timingRank: number;
    timingScore: number;
    timingStage: string;
    total: number;
  },
): RankedBusinessListRow {
  return {
    businessId: row.businessId,
    city: row.city,
    industry: row.industry,
    name: row.name,
    reason: row.reason,
    registeredAt: row.registeredAt,
    signalsCount: row.signalsCount,
    sourceDocumentNumber: row.sourceDocumentNumber,
    source: row.source,
    state: row.state,
    timingRank: row.timingRank,
    timingScore: row.timingScore,
    timingStage: row.timingStage as TimingStage,
    total: row.total,
  };
}
