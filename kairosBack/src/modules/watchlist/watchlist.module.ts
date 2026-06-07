import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { AuthModule } from "../auth/auth.module";
import { BusinessModule } from "../businesses/business.module";
import { WatchlistController } from "./watchlist.controller";
import { WatchlistRepository } from "./watchlist.repository";
import { WatchlistService } from "./watchlist.service";

@Module({
  imports: [AuthModule, BusinessModule, DatabaseModule],
  controllers: [WatchlistController],
  providers: [WatchlistRepository, WatchlistService],
  exports: [WatchlistRepository, WatchlistService],
})
export class WatchlistModule {}
