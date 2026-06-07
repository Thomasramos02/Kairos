import { pgTable, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { accounts } from './accounts';
import { businesses } from './businesses';

export const watchlistItems = pgTable(
  'watchlist_items',
  {
    id: varchar('id', { length: 80 }).primaryKey(),
    accountId: varchar('account_id', { length: 80 })
      .notNull()
      .references(() => accounts.id),
    businessId: varchar('business_id', { length: 80 })
      .notNull()
      .references(() => businesses.id),
    savedAt: timestamp('saved_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    accountBusinessUnique: uniqueIndex('watchlist_items_account_business_unique_idx')
      .on(table.accountId, table.businessId),
  }),
);
