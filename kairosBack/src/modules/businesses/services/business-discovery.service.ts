import { Injectable } from "@nestjs/common";
import { OutboxEventRecord } from "../../../outbox/outbox-event-record";
import { OutboxPublisherService } from "../../../outbox/outbox-publisher.service";
import { DiscoveredBusiness } from "../models/business.model";

@Injectable()
export class BusinessDiscoveryService {
  constructor(private readonly outboxPublisher: OutboxPublisherService) {}

  createDiscoveredEvent(
    discoveredBusiness: DiscoveredBusiness,
  ): OutboxEventRecord {
    return this.outboxPublisher.createPendingRecord({
      name: "BusinessDiscovered",
      aggregateId: discoveredBusiness.id,
      payload: {
        state: discoveredBusiness.state,
        sourceName: discoveredBusiness.sourceName,
      },
    });
  }
}
