import { jsonb, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const accounts = pgTable('accounts', {
  id: varchar('id', { length: 80 }).primaryKey(),
  name: varchar('name', { length: 160 }).notNull(),
  email: varchar('email', { length: 240 }).notNull(),
  companyName: varchar('company_name', { length: 200 }),
  passwordHash: varchar('password_hash', { length: 240 }).notNull(),
  alertPreference: jsonb('alert_preference').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
