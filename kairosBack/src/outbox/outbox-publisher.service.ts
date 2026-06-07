import { Injectable } from '@nestjs/common';
import { DomainEvent } from './domain-event';
import { mapDomainEventToOutboxRecord } from './outbox-event.mapper';
import { OutboxEventRecord } from './outbox-event-record';

@Injectable()
export class OutboxPublisherService {
  createPendingRecord(domainEvent: DomainEvent): OutboxEventRecord {
    return mapDomainEventToOutboxRecord(domainEvent);
  }
}
