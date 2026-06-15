import { Job } from 'bullmq';
import { DiscoveredBusiness } from '../modules/businesses/models/business.model';
import { MarketTarget } from '../modules/market-targets/models/market-target.model';
import { CalculateTimingScoreJobPayload } from '../queue/kairos-job-payload';
import { DigitalSignalProcessor } from './digital-signal.processor';

class FakeBusinessesRepository {
  readonly createdSignals: Array<{
    readonly businessId: string;
    readonly confidenceScore: number;
    readonly signalName: 'website-missing';
    readonly sourceName: string;
  }> = [];

  constructor(private readonly business: DiscoveredBusiness) {}

  async findBusinessById(
    businessId: string,
  ): Promise<DiscoveredBusiness | null> {
    return businessId === this.business.id ? this.business : null;
  }

  async createSignal(signal: {
    readonly businessId: string;
    readonly confidenceScore: number;
    readonly signalName: 'website-missing';
    readonly sourceName: string;
  }): Promise<typeof signal> {
    this.createdSignals.push(signal);
    return signal;
  }
}

class FakeDigitalSignalDetector {
  async detectSignals(): Promise<
    ReadonlyArray<{
      readonly confidenceScore: number;
      readonly signalName: 'website-missing';
      readonly sourceName: string;
    }>
  > {
    return [
      {
        confidenceScore: 90,
        signalName: 'website-missing',
        sourceName: 'Kairos detector',
      },
    ];
  }
}

class FakeMarketTargetsRepository {
  constructor(private readonly marketTargets: readonly MarketTarget[]) {}

  async listMarketTargets(): Promise<readonly MarketTarget[]> {
    return this.marketTargets;
  }
}

class FakeKairosJobDispatcherService {
  readonly timingScoreJobs: CalculateTimingScoreJobPayload[] = [];

  async dispatchTimingScore(
    payload: CalculateTimingScoreJobPayload,
  ): Promise<void> {
    this.timingScoreJobs.push(payload);
  }
}

describe('DigitalSignalProcessor', () => {
  it('dispatches timing scores for matching market target services', async () => {
    const business = createBusiness();
    const businessesRepository = new FakeBusinessesRepository(business);
    const jobDispatcher = new FakeKairosJobDispatcherService();
    const processor = new DigitalSignalProcessor(
      businessesRepository as never,
      new FakeDigitalSignalDetector() as never,
      new FakeMarketTargetsRepository([createMarketTarget('branding')]) as never,
      jobDispatcher as never,
    );

    await processor.process({
      data: { businessId: business.id },
    } as Job<{ readonly businessId: string }>);

    expect(jobDispatcher.timingScoreJobs).toEqual([
      { businessId: 'biz_1', offeredService: 'branding' },
    ]);
    expect(businessesRepository.createdSignals).toHaveLength(1);
  });

  it('dispatches every MVP service when no market target exists yet', async () => {
    const business = createBusiness();
    const jobDispatcher = new FakeKairosJobDispatcherService();
    const processor = new DigitalSignalProcessor(
      new FakeBusinessesRepository(business) as never,
      new FakeDigitalSignalDetector() as never,
      new FakeMarketTargetsRepository([]) as never,
      jobDispatcher as never,
    );

    await processor.process({
      data: { businessId: business.id },
    } as Job<{ readonly businessId: string }>);

    expect(jobDispatcher.timingScoreJobs).toEqual([
      { businessId: 'biz_1', offeredService: 'website-design-development' },
      { businessId: 'biz_1', offeredService: 'landing-page-creation' },
      { businessId: 'biz_1', offeredService: 'branding' },
      { businessId: 'biz_1', offeredService: 'logo-design' },
      { businessId: 'biz_1', offeredService: 'seo-local-seo' },
      { businessId: 'biz_1', offeredService: 'google-business-profile-local-presence' },
    ]);
  });

  it('treats unclassified Florida industry as eligible for matching targets', async () => {
    const business = createBusiness({ industry: 'unclassified' });
    const jobDispatcher = new FakeKairosJobDispatcherService();
    const processor = new DigitalSignalProcessor(
      new FakeBusinessesRepository(business) as never,
      new FakeDigitalSignalDetector() as never,
      new FakeMarketTargetsRepository([createMarketTarget('branding')]) as never,
      jobDispatcher as never,
    );

    await processor.process({
      data: { businessId: business.id },
    } as Job<{ readonly businessId: string }>);

    expect(jobDispatcher.timingScoreJobs).toEqual([
      { businessId: 'biz_1', offeredService: 'branding' },
    ]);
  });
});

function createBusiness(
  overrides: Partial<DiscoveredBusiness> = {},
): DiscoveredBusiness {
  return {
    archivedAt: null,
    city: 'MIAMI',
    id: 'biz_1',
    industry: 'restaurants',
    legalName: 'SUNRISE BAKERY LLC',
    lifecycleStage: 'candidate',
    registeredAt: new Date('2026-06-01T00:00:00.000Z'),
    sourceDocumentNumber: 'L26000000001',
    sourceName: 'Florida Division of Corporations',
    state: 'FL',
    ...overrides,
  };
}

function createMarketTarget(
  offeredService: MarketTarget['offeredService'],
): MarketTarget {
  return {
    accountId: 'acct_1',
    cityOrRegion: 'MIAMI',
    country: 'US',
    desiredCustomerType: 'new restaurants',
    id: 'target_1',
    industry: 'restaurants',
    offeredService,
    state: 'FL',
  };
}
