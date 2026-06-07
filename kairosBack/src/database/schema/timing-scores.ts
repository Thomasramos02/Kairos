import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { businesses } from './businesses';

export const timingScores = pgTable(
  'timing_scores',
  {
    id: varchar('id', { length: 80 }).primaryKey(),
    businessId: varchar('business_id', { length: 80 })
      .notNull()
      .references(() => businesses.id),
    offeredService: varchar('offered_service', { length: 80 }).notNull(),
    timingRank: integer('timing_rank').notNull().default(99),
    timingStage: varchar('timing_stage', { length: 80 }).notNull(),
    timingScore: integer('timing_score').notNull(),
    signalsCount: integer('signals_count').notNull().default(0),
    reason: text('reason').notNull(),
    calculatedAt: timestamp('calculated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    nextRefreshAt: timestamp('next_refresh_at', { withTimezone: true }),
    scoreVersion: integer('score_version').notNull().default(1),
    status: varchar('status', { length: 40 }).notNull().default('ready'),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    businessServiceUnique: uniqueIndex(
      'idx_timing_scores_business_service_unique',
    ).on(table.businessId, table.offeredService),
    serviceRankIndex: index('idx_timing_scores_service_rank').on(
      table.offeredService,
      table.timingRank,
      table.timingScore,
      table.signalsCount,
    ),
  }),
);
