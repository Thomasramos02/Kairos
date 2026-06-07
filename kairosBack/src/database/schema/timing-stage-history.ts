import { integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { businesses } from './businesses';

export const timingStageHistory = pgTable('timing_stage_history', {
  id: varchar('id', { length: 80 }).primaryKey(),
  businessId: varchar('business_id', { length: 80 })
    .notNull()
    .references(() => businesses.id),
  offeredService: varchar('offered_service', { length: 80 }).notNull(),
  previousStage: varchar('previous_stage', { length: 80 }),
  nextStage: varchar('next_stage', { length: 80 }).notNull(),
  timingScore: integer('timing_score').notNull(),
  reason: text('reason').notNull(),
  changedAt: timestamp('changed_at', { withTimezone: true }).notNull().defaultNow(),
});
