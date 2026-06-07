import { jsonb, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { accounts } from './accounts';
import { businesses } from './businesses';

export const alertEvents = pgTable('alert_events', {
  id: varchar('id', { length: 80 }).primaryKey(),
  accountId: varchar('account_id', { length: 80 })
    .notNull()
    .references(() => accounts.id),
  businessId: varchar('business_id', { length: 80 })
    .notNull()
    .references(() => businesses.id),
  reason: varchar('reason', { length: 80 }).notNull(),
  channels: jsonb('channels').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
