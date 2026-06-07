import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { createInMemoryId } from "../../common/in-memory-id";
import { DRIZZLE_DATABASE } from "../../database/database.tokens";
import { DrizzleDatabase } from "../../database/drizzle.provider";
import { registrySourceRuns } from "../../database/schema";
import {
  CompleteRegistrySourceRunInput,
  RegistrySourceRun,
  StartRegistrySourceRunInput,
} from "./models/registry-source-run.model";

@Injectable()
export class RegistrySourceRunsRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly database: DrizzleDatabase,
  ) {}

  async startRun(
    input: StartRegistrySourceRunInput,
  ): Promise<RegistrySourceRun> {
    const [run] = await this.database
      .insert(registrySourceRuns)
      .values({
        id: createInMemoryId("run"),
        state: input.state,
        sourceName: input.sourceName,
        status: "running",
      })
      .returning();

    return toRegistrySourceRun(run);
  }

  async completeRun(
    runId: string,
    input: CompleteRegistrySourceRunInput,
  ): Promise<void> {
    await this.database
      .update(registrySourceRuns)
      .set({ ...input, status: "completed", finishedAt: new Date() })
      .where(eq(registrySourceRuns.id, runId));
  }

  async failRun(runId: string, error: unknown): Promise<void> {
    await this.database
      .update(registrySourceRuns)
      .set({
        status: "failed",
        errorMessage: formatRegistrySourceRunError(error),
        finishedAt: new Date(),
      })
      .where(eq(registrySourceRuns.id, runId));
  }
}

export function formatRegistrySourceRunError(error: unknown): string {
  if (error instanceof Error) {
    return error.message.slice(0, 1000);
  }

  return `Unknown registry source run error: received ${JSON.stringify(error)}`;
}

function toRegistrySourceRun(
  row: typeof registrySourceRuns.$inferSelect,
): RegistrySourceRun {
  return {
    id: row.id,
    state: row.state,
    sourceName: row.sourceName,
    sourceCursor: row.sourceCursor,
    status: row.status as RegistrySourceRun["status"],
    recordsFound: row.recordsFound,
    recordsCreated: row.recordsCreated,
    errorMessage: row.errorMessage,
    startedAt: row.startedAt.toISOString(),
    finishedAt: row.finishedAt?.toISOString() ?? null,
  };
}
