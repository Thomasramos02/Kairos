import { Injectable, NotFoundException } from '@nestjs/common';
import { OfferedService } from '../../domain/offered-service';
import { ListBusinessesPageQuery, ListBusinessesQuery } from './dto/list-businesses.dto';
import {
  BusinessesRepository,
  StoredBusinessSignal,
} from './businesses.repository';
import { BusinessListItem, PaginatedBusinessList } from './models/business-list.model';
import { calculateBusinessAgeDays } from './services/business-age-calculator';
import { TimingScoresRepository, RankedBusinessListRow } from '../timing/timing-scores.repository';
import { calculateTimingScore } from '../timing/services/timing-score-calculator';

@Injectable()
export class BusinessesQueryService {
  constructor(
    private readonly businessesRepository: BusinessesRepository,
    private readonly timingScoresRepository: TimingScoresRepository,
  ) {}

  async listNewBusinesses(
    query: ListBusinessesQuery,
  ): Promise<readonly BusinessListItem[]> {
    const offeredService = resolveOfferedService(query.offeredService);

    const rankedPage = await this.timingScoresRepository.listRankedBusinessesPage(
      {
        city: query.city,
        industry: query.industry,
        minScore: parseMinScore(query.minScore),
        offeredService,
        search: query.search,
        state: query.state,
        timingStage: query.timingStage,
      },
    );

    return await this.buildBusinessListItems(rankedPage.items, offeredService);
  }

  async listNewBusinessesPage(
    query: ListBusinessesPageQuery,
  ): Promise<PaginatedBusinessList> {
    const limit = resolvePageLimit(query.limit);
    const offset = resolvePageOffset(query.offset);
    const offeredService = resolveOfferedService(query.offeredService);

    const rankedPage = await this.timingScoresRepository.listRankedBusinessesPage(
      {
        city: query.city,
        industry: query.industry,
        limit,
        minScore: parseMinScore(query.minScore),
        offset,
        offeredService,
        search: query.search,
        state: query.state,
        timingStage: query.timingStage,
      },
    );

    const items = await this.buildBusinessListItems(rankedPage.items, offeredService);

    return {
      hasMore: rankedPage.total > offset + items.length,
      items,
      limit,
      offset,
      total: rankedPage.total,
    };
  }

  async getBusinessById(
    businessId: string,
    query: Pick<ListBusinessesQuery, 'offeredService'>,
  ): Promise<BusinessListItem> {
    const row = await this.timingScoresRepository.findRankedBusinessById(
      businessId,
      resolveOfferedService(query.offeredService),
    );

    if (row === null) {
      throw new NotFoundException(
        `Business not found: received "${businessId}"; expected existing non-archived business id`,
      );
    }

    return (await this.buildBusinessListItems(
      [row],
      resolveOfferedService(query.offeredService),
    ))[0] as BusinessListItem;
  }

  private async buildBusinessListItems(
    rankedRows: readonly RankedBusinessListRow[],
    offeredService: OfferedService,
  ): Promise<readonly BusinessListItem[]> {
    const signalsByBusinessId = await this.loadSignalsByBusiness(rankedRows);

    return rankedRows.map((row) =>
      toBusinessListItem(
        row,
        offeredService,
        signalsByBusinessId.get(row.businessId) ?? [],
      ),
    );
  }

  private async loadSignalsByBusiness(
    rankedRows: readonly RankedBusinessListRow[],
  ): Promise<Map<string, readonly StoredBusinessSignal[]>> {
    const signals = await this.businessesRepository.listSignalsByBusinessIds(
      rankedRows.map((row) => row.businessId),
    );
    const groupedSignals = new Map<string, StoredBusinessSignal[]>();

    for (const signal of signals) {
      const currentSignals = groupedSignals.get(signal.businessId) ?? [];
      currentSignals.push(signal);
      groupedSignals.set(signal.businessId, currentSignals);
    }

    return groupedSignals;
  }
}

function toBusinessListItem(
  row: RankedBusinessListRow,
  offeredService: OfferedService,
  signals: readonly StoredBusinessSignal[],
): BusinessListItem {
  const registeredAt = row.registeredAt.toISOString();
  const ageDays = calculateBusinessAgeDays(row.registeredAt, new Date());
  const scoreExplanation = calculateTimingScore({
    ageDays,
    city: row.city,
    industry: row.industry,
    offeredService,
    signals,
    sourceName: row.source,
  });

  return {
    ageDays,
    city: row.city,
    digitalSignals: signals.map((signal) => ({
      confidenceScore: signal.confidenceScore,
      metadata: signal.metadata,
      serviceImpact: signal.serviceImpact,
      signalName: signal.signalName,
      sourceName: signal.sourceName,
    })),
    id: row.businessId,
    industry: row.industry,
    name: row.name,
    reason: scoreExplanation.reason,
    recommendationStrength: scoreExplanation.recommendationStrength,
    registeredAt,
    scoreComponents: scoreExplanation.components,
    signalsCount: row.signalsCount,
    sourceDocumentNumber: row.sourceDocumentNumber,
    source: row.source,
    state: row.state,
    timingScore: scoreExplanation.timingScore,
    timingStage: scoreExplanation.timingStage,
  };
}

function parseMinScore(value: string | undefined): number | undefined {
  if (value === undefined || value.trim().length === 0) {
    return undefined;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue)) {
    return undefined;
  }

  return parsedValue;
}

function resolvePageLimit(value: string | undefined): number {
  const parsedValue = Number.parseInt(value ?? '', 10);

  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    return 24;
  }

  return Math.min(parsedValue, 100);
}

function resolvePageOffset(value: string | undefined): number {
  const parsedValue = Number.parseInt(value ?? '', 10);

  if (Number.isNaN(parsedValue) || parsedValue < 0) {
    return 0;
  }

  return parsedValue;
}

function resolveOfferedService(
  value: OfferedService | undefined,
): OfferedService {
  return value ?? 'website-design-development';
}
