import { jsonb, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const outboxEvents = pgTable('outbox_events', {
  id: varchar('id', { length: 80 }).primaryKey(),
  eventName: varchar('event_name', { length: 160 }).notNull(),
  aggregateId: varchar('aggregate_id', { length: 80 }).notNull(),
  payload: jsonb('payload').notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
