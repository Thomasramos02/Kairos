import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { createInMemoryId } from "../../common/in-memory-id";
import { DRIZZLE_DATABASE } from "../../database/database.tokens";
import { DrizzleDatabase } from "../../database/drizzle.provider";
import { marketTargets } from "../../database/schema";
import { OfferedService } from "../../domain/offered-service";
import { MarketTarget } from "./models/market-target.model";

@Injectable()
export class MarketTargetsRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly database: DrizzleDatabase,
  ) {}

  async createMarketTarget(
    marketTargetInput: Omit<MarketTarget, "id">,
  ): Promise<MarketTarget> {
    const [marketTarget] = await this.database
      .insert(marketTargets)
      .values({ ...marketTargetInput, id: createInMemoryId("target") })
      .returning();

    return toMarketTarget(marketTarget);
  }

  async listByAccount(accountId: string): Promise<readonly MarketTarget[]> {
    const rows = await this.database
      .select()
      .from(marketTargets)
      .where(eq(marketTargets.accountId, accountId));

    return rows.map(toMarketTarget);
  }

  async listMarketTargets(): Promise<readonly MarketTarget[]> {
    const rows = await this.database.select().from(marketTargets);

    return rows.map(toMarketTarget);
  }
}

function toMarketTarget(row: typeof marketTargets.$inferSelect): MarketTarget {
  return {
    id: row.id,
    accountId: row.accountId,
    country: "US",
    state: row.state,
    cityOrRegion: row.cityOrRegion,
    industry: row.industry,
    desiredCustomerType: row.desiredCustomerType,
    offeredService: row.offeredService as OfferedService,
  };
}
