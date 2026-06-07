import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BusinessesRepository } from '../businesses/businesses.repository';
import { SaveWatchlistItemRequest } from './dto/watchlist.dto';
import { WatchlistItem } from './models/watchlist.model';
import { WatchlistRepository } from './watchlist.repository';

@Injectable()
export class WatchlistService {
  constructor(
    private readonly businessesRepository: BusinessesRepository,
    private readonly watchlistRepository: WatchlistRepository,
  ) {}

  async saveBusiness(request: SaveWatchlistItemRequest): Promise<WatchlistItem> {
    assertWatchlistRequest(request);

    const watchlistItem = await this.watchlistRepository.saveBusiness(
      request.accountId,
      request.businessId,
    );
    await this.businessesRepository.updateLifecycleStage(
      request.businessId,
      'watched',
    );

    return watchlistItem;
  }

  async listByAccount(accountId: string): Promise<readonly WatchlistItem[]> {
    return await this.watchlistRepository.listByAccount(accountId);
  }

  async removeBusiness(
    request: SaveWatchlistItemRequest,
  ): Promise<WatchlistItem> {
    assertWatchlistRequest(request);

    const watchlistItem = await this.watchlistRepository.removeBusiness(
      request.accountId,
      request.businessId,
    );

    if (watchlistItem === null) {
      throw new NotFoundException(
        `Watchlist item not found: received accountId "${request.accountId}" and businessId "${request.businessId}"; expected saved watchlist item`,
      );
    }

    return watchlistItem;
  }
}

function assertWatchlistRequest(request: SaveWatchlistItemRequest): void {
  if (request.accountId.trim().length === 0 || request.businessId.trim().length === 0) {
    throw new BadRequestException(
      `Invalid watchlist request: received accountId "${request.accountId}" and businessId "${request.businessId}"; expected non-empty ids`,
    );
  }
}
