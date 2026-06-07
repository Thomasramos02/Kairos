import { Inject, Injectable } from '@nestjs/common';
import { eq, isNull } from 'drizzle-orm';
import { createInMemoryId } from '../common/in-memory-id';
import { DRIZZLE_DATABASE } from '../database/database.tokens';
import { DrizzleDatabase } from '../database/drizzle.provider';
import { outboxEvents } from '../database/schema';
import { DomainEventPayload } from './domain-event';
import { OutboxEventRecord } from './outbox-event-record';

export type PersistedOutboxEvent = {
  readonly id: string;
  readonly eventName: string;
  readonly aggregateId: string;
  readonly payload: DomainEventPayload;
};

@Injectable()
export class OutboxRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly database: DrizzleDatabase,
  ) {}

  async createPending(record: OutboxEventRecord): Promise<PersistedOutboxEvent> {
    const [outboxEvent] = await this.database
      .insert(outboxEvents)
      .values({ ...record, id: createInMemoryId('outbox') })
      .returning();

    return toPersistedOutboxEvent(outboxEvent);
  }

  async listUnpublished(): Promise<readonly PersistedOutboxEvent[]> {
    const rows = await this.database
      .select()
      .from(outboxEvents)
      .where(isNull(outboxEvents.publishedAt));

    return rows.map(toPersistedOutboxEvent);
  }

  async markPublished(outboxEventId: string): Promise<void> {
    await this.database
      .update(outboxEvents)
      .set({ publishedAt: new Date() })
      .where(eq(outboxEvents.id, outboxEventId));
  }
}

function toPersistedOutboxEvent(
  row: typeof outboxEvents.$inferSelect,
): PersistedOutboxEvent {
  return {
    id: row.id,
    eventName: row.eventName,
    aggregateId: row.aggregateId,
    payload: row.payload as DomainEventPayload,
  };
}
