import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { createInMemoryId } from "../../common/in-memory-id";
import { DRIZZLE_DATABASE } from "../../database/database.tokens";
import { DrizzleDatabase } from "../../database/drizzle.provider";
import { watchlistItems } from "../../database/schema";
import { WatchlistItem } from "./models/watchlist.model";

@Injectable()
export class WatchlistRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly database: DrizzleDatabase,
  ) {}

  async saveBusiness(
    accountId: string,
    businessId: string,
  ): Promise<WatchlistItem> {
    const [watchlistItem] = await this.database
      .insert(watchlistItems)
      .values({ id: createInMemoryId("watch"), accountId, businessId })
      .onConflictDoNothing({
        target: [watchlistItems.accountId, watchlistItems.businessId],
      })
      .returning();

    if (watchlistItem !== undefined) {
      return toWatchlistItem(watchlistItem);
    }

    return await this.findExistingWatchlistItem(accountId, businessId);
  }

  private async findExistingWatchlistItem(
    accountId: string,
    businessId: string,
  ): Promise<WatchlistItem> {
    const [existingWatchlistItem] = await this.database
      .select()
      .from(watchlistItems)
      .where(
        and(
          eq(watchlistItems.accountId, accountId),
          eq(watchlistItems.businessId, businessId),
        ),
      );

    if (existingWatchlistItem === undefined) {
      throw new Error(
        `Watchlist save failed: received accountId "${accountId}" and businessId "${businessId}"; expected inserted or existing watchlist item`,
      );
    }

    return toWatchlistItem(existingWatchlistItem);
  }

  async listByAccount(accountId: string): Promise<readonly WatchlistItem[]> {
    const rows = await this.database
      .select()
      .from(watchlistItems)
      .where(eq(watchlistItems.accountId, accountId));

    return rows.map(toWatchlistItem);
  }

  async listByBusiness(businessId: string): Promise<readonly WatchlistItem[]> {
    const rows = await this.database
      .select()
      .from(watchlistItems)
      .where(eq(watchlistItems.businessId, businessId));

    return rows.map(toWatchlistItem);
  }

  async removeBusiness(
    accountId: string,
    businessId: string,
  ): Promise<WatchlistItem | null> {
    const [watchlistItem] = await this.database
      .delete(watchlistItems)
      .where(
        and(
          eq(watchlistItems.accountId, accountId),
          eq(watchlistItems.businessId, businessId),
        ),
      )
      .returning();

    return watchlistItem === undefined ? null : toWatchlistItem(watchlistItem);
  }
}

function toWatchlistItem(
  row: typeof watchlistItems.$inferSelect,
): WatchlistItem {
  return {
    id: row.id,
    accountId: row.accountId,
    businessId: row.businessId,
    savedAt: row.savedAt.toISOString(),
  };
}
