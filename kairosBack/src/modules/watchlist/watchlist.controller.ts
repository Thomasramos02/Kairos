import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SaveWatchlistItemRequest } from './dto/watchlist.dto';
import { WatchlistItem } from './models/watchlist.model';
import { WatchlistService } from './watchlist.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Post('/watchlist')
  async saveBusiness(
    @Body() request: SaveWatchlistItemRequest,
  ): Promise<WatchlistItem> {
    return await this.watchlistService.saveBusiness(request);
  }

  @Post('/accounts/:accountId/watchlist')
  async saveBusinessForAccount(
    @Param('accountId') accountId: string,
    @Body() request: Pick<SaveWatchlistItemRequest, 'businessId'>,
  ): Promise<WatchlistItem> {
    return await this.watchlistService.saveBusiness({
      accountId,
      businessId: request.businessId,
    });
  }

  @Get('/accounts/:accountId/watchlist')
  async listByAccount(
    @Param('accountId') accountId: string,
  ): Promise<readonly WatchlistItem[]> {
    return await this.watchlistService.listByAccount(accountId);
  }

  @Delete('/accounts/:accountId/watchlist/:businessId')
  async removeBusiness(
    @Param('accountId') accountId: string,
    @Param('businessId') businessId: string,
  ): Promise<WatchlistItem> {
    return await this.watchlistService.removeBusiness({ accountId, businessId });
  }
}
