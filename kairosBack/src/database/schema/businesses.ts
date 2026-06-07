import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const businesses = pgTable('businesses', {
  id: varchar('id', { length: 80 }).primaryKey(),
  sourceDocumentNumber: varchar('source_document_number', { length: 80 }),
  legalName: varchar('legal_name', { length: 240 }).notNull(),
  state: varchar('state', { length: 32 }).notNull(),
  city: varchar('city', { length: 120 }),
  industry: varchar('industry', { length: 160 }).notNull(),
  lifecycleStage: varchar('lifecycle_stage', { length: 40 })
    .notNull()
    .default('candidate'),
  sourceName: varchar('source_name', { length: 120 }).notNull(),
  registeredAt: timestamp('registered_at', { withTimezone: true }).notNull(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
  discoveredAt: timestamp('discovered_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
