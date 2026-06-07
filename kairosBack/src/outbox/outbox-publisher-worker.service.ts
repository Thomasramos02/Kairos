import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { readKairosEnvironment } from "../config/kairos-environment";
import { KairosJobDispatcherService } from "../queue/kairos-job-dispatcher.service";
import { PersistedOutboxEvent, OutboxRepository } from "./outbox.repository";

@Injectable()
export class OutboxPublisherWorkerService
  implements OnModuleInit, OnModuleDestroy
{
  private intervalHandle: NodeJS.Timeout | null = null;

  constructor(
    private readonly outboxRepository: OutboxRepository,
    private readonly jobDispatcher: KairosJobDispatcherService,
  ) {}

  onModuleInit(): void {
    const environment = readKairosEnvironment(process.env);

    this.intervalHandle = setInterval(
      () => void this.publishPendingEvents(),
      environment.outboxPollIntervalMs,
    );
    this.intervalHandle.unref();
  }

  onModuleDestroy(): void {
    if (this.intervalHandle !== null) {
      clearInterval(this.intervalHandle);
    }
  }

  async publishPendingEvents(): Promise<void> {
    const pendingEvents = await this.outboxRepository.listUnpublished();

    for (const pendingEvent of pendingEvents) {
      await this.publishEvent(pendingEvent);
      await this.outboxRepository.markPublished(pendingEvent.id);
    }
  }

  private async publishEvent(outboxEvent: PersistedOutboxEvent): Promise<void> {
    if (outboxEvent.eventName === "BusinessDiscovered") {
      await this.jobDispatcher.dispatchDigitalSignals({
        businessId: outboxEvent.aggregateId,
      });
      await this.jobDispatcher.dispatchContactEnrichment({
        businessId: outboxEvent.aggregateId,
      });
      return;
    }

    throw new Error(
      `Unsupported outbox event: received "${outboxEvent.eventName}"; expected supported domain event`,
    );
  }
}
