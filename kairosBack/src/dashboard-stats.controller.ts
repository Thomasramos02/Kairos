import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DRIZZLE_DATABASE } from './database/database.tokens';
import { DrizzleDatabase } from './database/drizzle.provider';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';

type DashboardStatsResponse = {
  readonly newToday: number;
  readonly enteringBestWindow: number;
  readonly savedCompanies: number;
  readonly avgReadiness: number;
};

@Controller()
@UseGuards(JwtAuthGuard)
export class DashboardStatsController {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly database: DrizzleDatabase,
  ) {}

  @Get('/dashboard/stats')
  async getStats(): Promise<DashboardStatsResponse> {
    const newTodayResult = await this.database.execute(
      sql`SELECT COUNT(*)::int AS count FROM businesses WHERE discovered_at::date = CURRENT_DATE`,
    );
    const bestWindowResult = await this.database.execute(
      sql`SELECT COUNT(*)::int AS count FROM timing_scores WHERE timing_stage = 'best-window'`,
    );
    const savedResult = await this.database.execute(
      sql`SELECT COUNT(*)::int AS count FROM watchlist_items`,
    );
    const avgResult = await this.database.execute(
      sql`SELECT COALESCE(ROUND(AVG(timing_score))::int, 0) AS avg FROM timing_scores`,
    );

    return {
      newToday: Number(newTodayResult.rows[0].count),
      enteringBestWindow: Number(bestWindowResult.rows[0].count),
      savedCompanies: Number(savedResult.rows[0].count),
      avgReadiness: Number(avgResult.rows[0].avg),
    };
  }
}
