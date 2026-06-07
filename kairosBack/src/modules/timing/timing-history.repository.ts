import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { createInMemoryId } from '../../common/in-memory-id';
import { DRIZZLE_DATABASE } from '../../database/database.tokens';
import { DrizzleDatabase } from '../../database/drizzle.provider';
import { timingStageHistory } from '../../database/schema';
import { OfferedService } from '../../domain/offered-service';
import { TimingStage } from '../../domain/timing-stage';
import {
  TimingStageChangeInput,
  TimingStageHistoryEntry,
} from './models/timing-stage-history.model';
import { shouldRecordTimingStageChange } from './services/timing-stage-change.builder';

@Injectable()
export class TimingHistoryRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly database: DrizzleDatabase,
  ) {}

  async recordStageChange(
    timingStageChange: Omit<TimingStageChangeInput, 'previousStage'>,
  ): Promise<TimingStageHistoryEntry | null> {
    const previousStage = await this.findLatestStage(
      timingStageChange.businessId,
      timingStageChange.offeredService,
    );
    const stageChange = { ...timingStageChange, previousStage };

    if (!shouldRecordTimingStageChange(stageChange)) {
      return null;
    }

    return await this.insertStageChange(stageChange);
  }

  async listByBusiness(
    businessId: string,
  ): Promise<readonly TimingStageHistoryEntry[]> {
    const rows = await this.database
      .select()
      .from(timingStageHistory)
      .where(eq(timingStageHistory.businessId, businessId))
      .orderBy(desc(timingStageHistory.changedAt));

    return rows.map(toTimingStageHistoryEntry);
  }

  private async findLatestStage(
    businessId: string,
    offeredService: OfferedService,
  ): Promise<TimingStage | null> {
    const latestEntry = await this.database.query.timingStageHistory.findFirst({
      where: (table, operators) =>
        and(
          operators.eq(table.businessId, businessId),
          operators.eq(table.offeredService, offeredService),
        ),
      orderBy: (table, operators) => [operators.desc(table.changedAt)],
    });

    return latestEntry === undefined ? null : (latestEntry.nextStage as TimingStage);
  }

  private async insertStageChange(
    timingStageChange: TimingStageChangeInput,
  ): Promise<TimingStageHistoryEntry> {
    const [entry] = await this.database
      .insert(timingStageHistory)
      .values({
        ...timingStageChange,
        id: createInMemoryId('stage'),
      })
      .returning();

    return toTimingStageHistoryEntry(entry);
  }
}

function toTimingStageHistoryEntry(
  row: typeof timingStageHistory.$inferSelect,
): TimingStageHistoryEntry {
  return {
    id: row.id,
    businessId: row.businessId,
    offeredService: row.offeredService as OfferedService,
    previousStage: row.previousStage as TimingStage | null,
    nextStage: row.nextStage as TimingStage,
    timingScore: row.timingScore,
    reason: row.reason,
    changedAt: row.changedAt.toISOString(),
  };
}
