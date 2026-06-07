import { BusinessesQueryService } from './businesses-query.service';
import { BusinessesRepository, StoredBusinessSignal } from './businesses.repository';
import { TimingScoresRepository, RankedBusinessListRow } from '../timing/timing-scores.repository';
import { OfferedService } from '../../domain/offered-service';

class FakeBusinessesRepository {
  readonly requestedBusinessIds: string[] = [];

  constructor(
    private readonly signalsByBusinessId: Readonly<Record<string, readonly StoredBusinessSignal[]>>,
  ) {}

  async listSignalsByBusinessIds(
    businessIds: readonly string[],
  ): Promise<readonly StoredBusinessSignal[]> {
    this.requestedBusinessIds.push(...businessIds);

    return businessIds.flatMap((businessId) => this.signalsByBusinessId[businessId] ?? []);
  }
}

class FakeTimingScoresRepository {
  readonly queries: Array<Record<string, unknown>> = [];

  constructor(private readonly rows: readonly RankedBusinessListRow[]) {}

  async listRankedBusinessesPage(query: {
    readonly city?: string;
    readonly industry?: string;
    readonly limit?: number;
    readonly minScore?: number;
    readonly offset?: number;
    readonly offeredService: OfferedService;
    readonly search?: string;
    readonly state?: string;
    readonly timingStage?: string;
  }): Promise<{ readonly items: readonly RankedBusinessListRow[]; readonly total: number }> {
    this.queries.push(query);
    return { items: this.rows, total: this.rows.length };
  }
}

describe('BusinessesQueryService', () => {
  it('pages businesses from persisted timing scores and loads only page signals', async () => {
    const timingScoresRepository = new FakeTimingScoresRepository([
      createRankedRow('biz_1', 'Sunrise Clinic LLC', 87, 2),
    ]);
    const businessesRepository = new FakeBusinessesRepository({
      biz_1: [
        {
          businessId: 'biz_1',
          confidenceScore: 90,
          metadata: {},
          serviceImpact: 'No reachable site can support website or branding services.',
          signalName: 'website-missing',
          sourceName: 'Kairos detector',
        },
      ],
    });

    const service = new BusinessesQueryService(
      businessesRepository as unknown as BusinessesRepository,
      timingScoresRepository as unknown as TimingScoresRepository,
    );

    const page = await service.listNewBusinessesPage({
      limit: '1',
      offeredService: 'branding',
      offset: '0',
      state: 'FL',
      timingStage: 'best-window',
    });

    expect(timingScoresRepository.queries[0]).toMatchObject({
      limit: 1,
      offeredService: 'branding',
      offset: 0,
      state: 'FL',
      timingStage: 'best-window',
    });
    expect(businessesRepository.requestedBusinessIds).toEqual(['biz_1']);
    expect(page).toMatchObject({
      hasMore: false,
      limit: 1,
      offset: 0,
      total: 1,
    });
    expect(page.items[0]).toMatchObject({
      id: 'biz_1',
      name: 'Sunrise Clinic LLC',
      signalsCount: 2,
      timingScore: 66,
      timingStage: 'warming-up',
    });
    expect(page.items[0]?.digitalSignals).toHaveLength(1);
  });

  it('falls back to the default service when none is provided', async () => {
    const timingScoresRepository = new FakeTimingScoresRepository([
      createRankedRow('biz_2', 'Launch Studio', 72, 1),
    ]);
    const businessesRepository = new FakeBusinessesRepository({});

    const service = new BusinessesQueryService(
      businessesRepository as unknown as BusinessesRepository,
      timingScoresRepository as unknown as TimingScoresRepository,
    );

    const businesses = await service.listNewBusinesses({
      state: 'FL',
    });

    expect(timingScoresRepository.queries[0]).toMatchObject({
      offeredService: 'website-design-development',
      state: 'FL',
    });
    expect(businesses).toHaveLength(1);
  });
});

function createRankedRow(
  businessId: string,
  name: string,
  timingScore: number,
  signalsCount: number,
): RankedBusinessListRow {
  return {
    businessId,
    city: 'Miami',
    industry: 'healthcare',
    name,
    reason: 'Score derived from timing signals.',
    registeredAt: new Date('2026-05-20T00:00:00.000Z'),
    signalsCount,
    sourceDocumentNumber: 'P26000000001',
    source: 'Florida Division of Corporations',
    state: 'FL',
    timingRank: 0,
    timingScore,
    timingStage: 'best-window',
    total: 1,
  };
}
