import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { AuthModule } from "../auth/auth.module";
import { MarketTargetsController } from "./market-targets.controller";
import { MarketTargetsRepository } from "./market-targets.repository";
import { MarketTargetsService } from "./market-targets.service";

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [MarketTargetsController],
  providers: [MarketTargetsRepository, MarketTargetsService],
  exports: [MarketTargetsRepository, MarketTargetsService],
})
export class MarketTargetsModule {}
