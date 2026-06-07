import { Job } from "bullmq";
import { ContactEnrichmentProcessor } from "./contact-enrichment.processor";
import { DiscoveredBusiness } from "../modules/businesses/models/business.model";

class FakeBusinessesRepository {
  readonly createdSignals: unknown[] = [];

  constructor(private readonly hasExistingSignal: boolean) {}

  async findBusinessById(): Promise<DiscoveredBusiness> {
    return createBusiness();
  }

  async hasSignalByNameAndSource(): Promise<boolean> {
    return this.hasExistingSignal;
  }

  async createSignal(signal: unknown): Promise<void> {
    this.createdSignals.push(signal);
  }
}

class FakeContactEnrichmentService {
  async enrichBusiness(): Promise<readonly [{
    readonly sourceName: "Connecticut Business Registry Official Email";
    readonly contactMethods: readonly [{
      readonly confidenceScore: 90;
      readonly label: "Corporate contact";
      readonly source: "registry";
      readonly type: "email";
      readonly value: "hello@example.com";
    }];
  }]> {
    return [{
      sourceName: "Connecticut Business Registry Official Email",
      contactMethods: [{
        confidenceScore: 90,
        label: "Corporate contact",
        source: "registry",
        type: "email",
        value: "hello@example.com",
      }],
    }];
  }
}

describe("ContactEnrichmentProcessor", () => {
  it("stores contact enrichment results as digital signals", async () => {
    const businessesRepository = new FakeBusinessesRepository(false);
    const processor = new ContactEnrichmentProcessor(
      businessesRepository as never,
      new FakeContactEnrichmentService() as never,
    );

    await processor.process({ data: { businessId: "biz_1" } } as Job<{
      readonly businessId: string;
    }>);

    expect(businessesRepository.createdSignals).toEqual([
      {
        businessId: "biz_1",
        confidenceScore: 92,
        metadata: {
          contactMethods: [{
            confidenceScore: 90,
            label: "Corporate contact",
            source: "registry",
            type: "email",
            value: "hello@example.com",
          }],
        },
        signalName: "business-contact-detected",
        sourceName: "Connecticut Business Registry Official Email",
      },
    ]);
  });

  it("skips duplicate contact enrichment source signals", async () => {
    const businessesRepository = new FakeBusinessesRepository(true);
    const processor = new ContactEnrichmentProcessor(
      businessesRepository as never,
      new FakeContactEnrichmentService() as never,
    );

    await processor.process({ data: { businessId: "biz_1" } } as Job<{
      readonly businessId: string;
    }>);

    expect(businessesRepository.createdSignals).toEqual([]);
  });
});

function createBusiness(): DiscoveredBusiness {
  return {
    archivedAt: null,
    city: "HARTFORD",
    id: "biz_1",
    industry: "Professional Services",
    legalName: "KAIROS CT LLC",
    lifecycleStage: "candidate",
    registeredAt: new Date("2026-06-01T00:00:00.000Z"),
    sourceDocumentNumber: "1234567",
    sourceName: "Connecticut Business Registry Business Master",
    state: "CT",
  };
}
