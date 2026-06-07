import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { accounts } from './accounts';

export const marketTargets = pgTable('market_targets', {
  id: varchar('id', { length: 80 }).primaryKey(),
  accountId: varchar('account_id', { length: 80 })
    .notNull()
    .references(() => accounts.id),
  country: varchar('country', { length: 2 }).notNull(),
  state: varchar('state', { length: 2 }).notNull(),
  cityOrRegion: varchar('city_or_region', { length: 160 }),
  industry: varchar('industry', { length: 160 }).notNull(),
  desiredCustomerType: varchar('desired_customer_type', { length: 240 }).notNull(),
  offeredService: varchar('offered_service', { length: 80 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
