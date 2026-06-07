import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const registrySourceRuns = pgTable("registry_source_runs", {
  id: varchar("id", { length: 80 }).primaryKey(),
  state: varchar("state", { length: 32 }).notNull(),
  sourceName: varchar("source_name", { length: 160 }).notNull(),
  sourceCursor: varchar("source_cursor", { length: 120 }),
  status: varchar("status", { length: 40 }).notNull(),
  recordsFound: integer("records_found").notNull().default(0),
  recordsCreated: integer("records_created").notNull().default(0),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
});
