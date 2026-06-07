import { Queue } from "bullmq";
import { KairosJobDispatcherService } from "./kairos-job-dispatcher.service";
import {
  CalculateTimingScoreJobPayload,
  DetectDigitalSignalsJobPayload,
  DiscoverBusinessesJobPayload,
  EnrichBusinessContactsJobPayload,
  GenerateExportJobPayload,
  RecalculateTimingStagesJobPayload,
  SendAlertJobPayload,
} from "./kairos-job-payload";

type QueueAddRecord = {
  readonly name: string;
  readonly payload: unknown;
  readonly options?: {
    readonly delay: number;
    readonly jobId: string;
    readonly removeOnComplete: boolean;
    readonly removeOnFail: boolean;
  };
};

type FakePendingJob<TPayload> = {
  readonly name: string;
  readonly data: TPayload;
  removed: boolean;
  remove(): Promise<void>;
  getState(): Promise<string>;
};

class FakeQueue<TPayload> {
  readonly addedJobs: QueueAddRecord[] = [];
  readonly pendingJobs: readonly (FakePendingJob<TPayload> | undefined)[];

  constructor(pendingJobs: readonly (TPayload | undefined)[] = []) {
    this.pendingJobs = pendingJobs.map(toFakePendingJob);
  }

  async add(
    name: string,
    payload: TPayload,
    options: QueueAddRecord["options"],
  ): Promise<void> {
    this.addedJobs.push({
      name,
      payload,
      options,
    });
  }

  async getJobs(): Promise<
    Array<{
      readonly name: string;
      readonly data: TPayload;
      remove(): Promise<void>;
    } | undefined>
  > {
    return [...this.pendingJobs];
  }
}

describe("KairosJobDispatcherService", () => {
  it("adds a discovery job when there is no pending one", async () => {
    const businessDiscoveryQueue = new FakeQueue<DiscoverBusinessesJobPayload>();
    const service = new KairosJobDispatcherService(
      businessDiscoveryQueue as unknown as Queue<DiscoverBusinessesJobPayload>,
      createUnusedQueue<DetectDigitalSignalsJobPayload>(),
      createUnusedQueue<EnrichBusinessContactsJobPayload>(),
      createUnusedQueue<RecalculateTimingStagesJobPayload>(),
      createUnusedQueue<CalculateTimingScoreJobPayload>(),
      createUnusedQueue<SendAlertJobPayload>(),
      createUnusedQueue<GenerateExportJobPayload>(),
    );

    await service.dispatchBusinessDiscoveryWithDelay(
      { state: "FL", industry: "restaurants" },
      60 * 60 * 1000,
    );

    expect(businessDiscoveryQueue.addedJobs).toHaveLength(1);
    expect(businessDiscoveryQueue.addedJobs[0]?.payload).toEqual({
      state: "FL",
      industry: "restaurants",
    });
  });

  it("skips discovery scheduling when a matching pending job already exists", async () => {
    const businessDiscoveryQueue = new FakeQueue<DiscoverBusinessesJobPayload>([
      { state: "FL", industry: "restaurants" },
    ]);
    const service = new KairosJobDispatcherService(
      businessDiscoveryQueue as unknown as Queue<DiscoverBusinessesJobPayload>,
      createUnusedQueue<DetectDigitalSignalsJobPayload>(),
      createUnusedQueue<EnrichBusinessContactsJobPayload>(),
      createUnusedQueue<RecalculateTimingStagesJobPayload>(),
      createUnusedQueue<CalculateTimingScoreJobPayload>(),
      createUnusedQueue<SendAlertJobPayload>(),
      createUnusedQueue<GenerateExportJobPayload>(),
    );

    await service.dispatchBusinessDiscoveryWithDelay(
      { state: "fl", industry: "Restaurants" },
      60 * 60 * 1000,
    );

    expect(businessDiscoveryQueue.addedJobs).toHaveLength(0);
  });

  it("replaces pending discovery jobs when dispatching a manual sync", async () => {
    const businessDiscoveryQueue = new FakeQueue<DiscoverBusinessesJobPayload>([
      { state: "WA", industry: "all" },
    ]);
    const service = new KairosJobDispatcherService(
      businessDiscoveryQueue as unknown as Queue<DiscoverBusinessesJobPayload>,
      createUnusedQueue<DetectDigitalSignalsJobPayload>(),
      createUnusedQueue<EnrichBusinessContactsJobPayload>(),
      createUnusedQueue<RecalculateTimingStagesJobPayload>(),
      createUnusedQueue<CalculateTimingScoreJobPayload>(),
      createUnusedQueue<SendAlertJobPayload>(),
      createUnusedQueue<GenerateExportJobPayload>(),
    );

    await service.dispatchBusinessDiscovery({ state: "wa", industry: "all" });

    expect(businessDiscoveryQueue.pendingJobs[0]?.removed).toBe(true);
    expect(businessDiscoveryQueue.addedJobs).toHaveLength(1);
    expect(businessDiscoveryQueue.addedJobs[0]?.options?.delay).toBe(0);
  });

  it("ignores empty pending discovery job slots returned by BullMQ", async () => {
    const businessDiscoveryQueue = new FakeQueue<DiscoverBusinessesJobPayload>([
      undefined,
    ]);
    const service = new KairosJobDispatcherService(
      businessDiscoveryQueue as unknown as Queue<DiscoverBusinessesJobPayload>,
      createUnusedQueue<DetectDigitalSignalsJobPayload>(),
      createUnusedQueue<EnrichBusinessContactsJobPayload>(),
      createUnusedQueue<RecalculateTimingStagesJobPayload>(),
      createUnusedQueue<CalculateTimingScoreJobPayload>(),
      createUnusedQueue<SendAlertJobPayload>(),
      createUnusedQueue<GenerateExportJobPayload>(),
    );

    await service.dispatchBusinessDiscoveryWithDelay(
      { state: "CT", industry: "all" },
      0,
    );

    expect(businessDiscoveryQueue.addedJobs).toHaveLength(1);
  });

  it("dispatches contact enrichment jobs", async () => {
    const contactEnrichmentQueue = new FakeQueue<EnrichBusinessContactsJobPayload>();
    const service = new KairosJobDispatcherService(
      createUnusedQueue<DiscoverBusinessesJobPayload>(),
      createUnusedQueue<DetectDigitalSignalsJobPayload>(),
      contactEnrichmentQueue as unknown as Queue<EnrichBusinessContactsJobPayload>,
      createUnusedQueue<RecalculateTimingStagesJobPayload>(),
      createUnusedQueue<CalculateTimingScoreJobPayload>(),
      createUnusedQueue<SendAlertJobPayload>(),
      createUnusedQueue<GenerateExportJobPayload>(),
    );

    await service.dispatchContactEnrichment({ businessId: "biz_1" });

    expect(contactEnrichmentQueue.addedJobs).toEqual([
      {
        name: "enrich-business-contacts",
        payload: { businessId: "biz_1" },
        options: undefined,
      },
    ]);
  });
});

function createUnusedQueue<TPayload>(): Queue<TPayload> {
  return new FakeQueue<TPayload>() as unknown as Queue<TPayload>;
}

function toFakePendingJob<TPayload>(
  pendingJob: TPayload | undefined,
): FakePendingJob<TPayload> | undefined {
  if (pendingJob === undefined) {
    return undefined;
  }

  return {
    name: "discover-businesses",
    data: pendingJob,
    removed: false,
    async remove(): Promise<void> {
      this.removed = true;
    },
    async getState(): Promise<string> {
      return "waiting";
    },
  };
}
