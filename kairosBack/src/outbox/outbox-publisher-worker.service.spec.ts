import { OutboxPublisherWorkerService } from "./outbox-publisher-worker.service";

class FakeOutboxRepository {
  readonly publishedIds: string[] = [];

  async listUnpublished(): Promise<readonly [{
    readonly id: "outbox_1";
    readonly aggregateId: "biz_1";
    readonly eventName: "BusinessDiscovered";
    readonly payload: object;
  }]> {
    return [{
      aggregateId: "biz_1",
      eventName: "BusinessDiscovered",
      id: "outbox_1",
      payload: {},
    }];
  }

  async markPublished(id: string): Promise<void> {
    this.publishedIds.push(id);
  }
}

class FakeJobDispatcher {
  readonly digitalSignals: Array<{ readonly businessId: string }> = [];
  readonly contactEnrichments: Array<{ readonly businessId: string }> = [];

  async dispatchDigitalSignals(payload: { readonly businessId: string }): Promise<void> {
    this.digitalSignals.push(payload);
  }

  async dispatchContactEnrichment(payload: { readonly businessId: string }): Promise<void> {
    this.contactEnrichments.push(payload);
  }
}

describe("OutboxPublisherWorkerService", () => {
  it("dispatches digital and contact enrichment jobs for discovered businesses", async () => {
    const outboxRepository = new FakeOutboxRepository();
    const jobDispatcher = new FakeJobDispatcher();
    const service = new OutboxPublisherWorkerService(
      outboxRepository as never,
      jobDispatcher as never,
    );

    await service.publishPendingEvents();

    expect(jobDispatcher.digitalSignals).toEqual([{ businessId: "biz_1" }]);
    expect(jobDispatcher.contactEnrichments).toEqual([{ businessId: "biz_1" }]);
    expect(outboxRepository.publishedIds).toEqual(["outbox_1"]);
  });
});
