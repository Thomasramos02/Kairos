import { OutboxPublisherService } from "../../../outbox/outbox-publisher.service";
import { DiscoveredBusiness } from "../models/business.model";
import { BusinessDiscoveryService } from "./business-discovery.service";

describe("BusinessDiscoveryService", () => {
  it("creates a business discovered outbox record", () => {
    const outboxPublisher = new OutboxPublisherService();
    const service = new BusinessDiscoveryService(outboxPublisher);

    const outboxRecord = service.createDiscoveredEvent(
      createDiscoveredBusiness(),
    );

    expect(outboxRecord).toEqual({
      eventName: "BusinessDiscovered",
      aggregateId: "90d4f160-1f18-4e2c-a578-7c8098f8377d",
      payload: {
        state: "Florida",
        sourceName: "Florida Division of Corporations",
      },
    });
  });
});

function createDiscoveredBusiness(): DiscoveredBusiness {
  return {
    id: "90d4f160-1f18-4e2c-a578-7c8098f8377d",
    sourceDocumentNumber: "L26000000001",
    legalName: "Kairos Test LLC",
    state: "Florida",
    city: "Miami",
    industry: "restaurants",
    archivedAt: null,
    lifecycleStage: "candidate",
    registeredAt: new Date("2026-01-01T00:00:00.000Z"),
    sourceName: "Florida Division of Corporations",
  };
}
