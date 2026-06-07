import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMarketTargetRequest } from './dto/market-target.dto';
import { MarketTargetsService } from './market-targets.service';
import { MarketTarget } from './models/market-target.model';

@Controller()
@UseGuards(JwtAuthGuard)
export class MarketTargetsController {
  constructor(private readonly marketTargetsService: MarketTargetsService) {}

  @Post('/market-targets')
  async createMarketTarget(
    @Body() request: CreateMarketTargetRequest,
  ): Promise<MarketTarget> {
    return await this.marketTargetsService.createMarketTarget(request);
  }

  @Get('/accounts/:accountId/market-targets')
  async listByAccount(
    @Param('accountId') accountId: string,
  ): Promise<readonly MarketTarget[]> {
    return await this.marketTargetsService.listByAccount(accountId);
  }
}
