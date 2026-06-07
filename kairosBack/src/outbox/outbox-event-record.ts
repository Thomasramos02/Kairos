import { DomainEventPayload } from './domain-event';

export type OutboxEventRecord = {
  readonly eventName: string;
  readonly aggregateId: string;
  readonly payload: DomainEventPayload;
};
