import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { businesses } from './businesses';

export const digitalSignals = pgTable('digital_signals', {
  id: varchar('id', { length: 80 }).primaryKey(),
  businessId: varchar('business_id', { length: 80 })
    .notNull()
    .references(() => businesses.id),
  signalName: varchar('signal_name', { length: 120 }).notNull(),
  sourceName: varchar('source_name', { length: 120 }).notNull(),
  confidenceScore: integer('confidence_score').notNull(),
  serviceImpact: text('service_impact').notNull(),
  metadata: jsonb('metadata').notNull().default({}),
  detectedAt: timestamp('detected_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
