import { Job } from "bullmq";
import { BusinessDiscoveryProcessor } from "./business-discovery.processor";
import { DiscoveredBusiness, NewDiscoveredBusiness } from "../modules/businesses/models/business.model";

class FakeBusinessesRepository {
  readonly createdSignals: Array<{
    readonly businessId: string;
    readonly signalName: string;
    readonly metadata?: unknown;
  }> = [];

  async createBusinessWithOutboxIfMissing(
    discoveredBusiness: NewDiscoveredBusiness,
  ): Promise<{ readonly business: DiscoveredBusiness; readonly wasCreated: boolean }> {
    return {
      business: {
        archivedAt: null,
        id: "biz_1",
        lifecycleStage: "candidate",
        ...discoveredBusiness,
      },
      wasCreated: true,
    };
  }

  async createSignal(signal: {
    readonly businessId: string;
    readonly signalName: string;
    readonly metadata?: unknown;
  }): Promise<void> {
    this.createdSignals.push(signal);
  }

  async hasSignalByName(): Promise<boolean> {
    return false;
  }
}

class FakeRegistrySourceRunsRepository {
  async startRun(): Promise<{ readonly id: string }> {
    return { id: "run_1" };
  }

  async completeRun(): Promise<void> {}

  async failRun(): Promise<void> {}
}

class FakeBusinessDiscoveryService {
  createDiscoveredEvent(): { readonly eventName: string; readonly aggregateId: string; readonly payload: object } {
    return { aggregateId: "biz_1", eventName: "BusinessDiscovered", payload: {} };
  }
}

class FakeSourceResolver {
  resolveSource(): {
    readonly sourceName: string;
    discoverBusinesses(): Promise<{ readonly businesses: readonly NewDiscoveredBusiness[]; readonly sourceCursor: string; readonly sourceName: string }>;
  } {
    return {
      sourceName: "Seattle Active Business License Tax Certificate",
      async discoverBusinesses() {
        return {
          businesses: [createSeattleBusiness()],
          sourceCursor: "20260601",
          sourceName: "Seattle Active Business License Tax Certificate",
        };
      },
    };
  }
}

class FakeJobDispatcher {
  async dispatchBusinessDiscoveryWithDelay(): Promise<void> {}
}

class FakeTimingScoresRepository {
  async hasAnyTimingScoreForBusiness(): Promise<boolean> {
    return true;
  }

  async upsertTimingScore(): Promise<void> {}
}

describe("BusinessDiscoveryProcessor", () => {
  it("stores registry contact options as digital signals", async () => {
    const businessesRepository = new FakeBusinessesRepository();
    const processor = new BusinessDiscoveryProcessor(
      businessesRepository as never,
      new FakeRegistrySourceRunsRepository() as never,
      new FakeBusinessDiscoveryService() as never,
      new FakeSourceResolver() as never,
      new FakeJobDispatcher() as never,
      new FakeTimingScoresRepository() as never,
    );

    await processor.process({
      data: { industry: "all", state: "WA" },
    } as Job<{ readonly industry: string; readonly state: string }>);

    expect(businessesRepository.createdSignals).toEqual([
      {
        businessId: "biz_1",
        confidenceScore: 82,
        metadata: {
          contactMethods: [{
            confidenceScore: 80,
            source: "registry",
            type: "phone",
            value: "+12065551234",
          }],
        },
        signalName: "business-contact-detected",
        sourceName: "Seattle Active Business License Tax Certificate",
      },
    ]);
  });
});

function createSeattleBusiness(): NewDiscoveredBusiness {
  return {
    city: "SEATTLE",
    contactMethods: [{
      confidenceScore: 80,
      source: "registry",
      type: "phone",
      value: "+12065551234",
    }],
    industry: "Offices of Dentists",
    legalName: "ANNIE KNUDSON DDS PLLC",
    registeredAt: new Date("2026-06-01T00:00:00.000Z"),
    sourceDocumentNumber: "SEA:6062143280010001",
    sourceName: "Seattle Active Business License Tax Certificate",
    state: "WA",
  };
}
