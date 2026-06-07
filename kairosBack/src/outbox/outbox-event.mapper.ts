import { DomainEvent } from './domain-event';
import { OutboxEventRecord } from './outbox-event-record';

export function mapDomainEventToOutboxRecord(
  domainEvent: DomainEvent,
): OutboxEventRecord {
  if (domainEvent.aggregateId.trim().length === 0) {
    throw new Error(
      `Invalid domain event aggregateId: received "${domainEvent.aggregateId}"; expected a non-empty id`,
    );
  }

  return {
    eventName: domainEvent.name,
    aggregateId: domainEvent.aggregateId,
    payload: domainEvent.payload,
  };
}
