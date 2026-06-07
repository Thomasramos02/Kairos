import { NotFoundException } from '@nestjs/common';
import { BusinessesRepository } from '../businesses/businesses.repository';
import { BusinessLifecycleStage } from '../businesses/models/business-lifecycle.model';
import { WatchlistItem } from './models/watchlist.model';
import { WatchlistRepository } from './watchlist.repository';
import { WatchlistService } from './watchlist.service';

class FakeWatchlistRepository {
  readonly removedRequests: { accountId: string; businessId: string }[] = [];
  itemToRemove: WatchlistItem | null = {
    accountId: 'account_1',
    businessId: 'biz_1',
    id: 'watch_1',
    savedAt: '2026-06-04T12:00:00.000Z',
  };

  async saveBusiness(
    accountId: string,
    businessId: string,
  ): Promise<WatchlistItem> {
    return {
      accountId,
      businessId,
      id: 'watch_1',
      savedAt: '2026-06-04T12:00:00.000Z',
    };
  }

  async listByAccount(): Promise<readonly WatchlistItem[]> {
    return [];
  }

  async listByBusiness(): Promise<readonly WatchlistItem[]> {
    return [];
  }

  async removeBusiness(
    accountId: string,
    businessId: string,
  ): Promise<WatchlistItem | null> {
    this.removedRequests.push({ accountId, businessId });
    return this.itemToRemove;
  }
}

class FakeBusinessesRepository {
  readonly lifecycleUpdates: {
    businessId: string;
    lifecycleStage: BusinessLifecycleStage;
  }[] = [];

  async updateLifecycleStage(
    businessId: string,
    lifecycleStage: BusinessLifecycleStage,
  ): Promise<null> {
    this.lifecycleUpdates.push({ businessId, lifecycleStage });
    return null;
  }
}

describe('WatchlistService', () => {
  it('removes a saved business from the watchlist', async () => {
    const businessesRepository = new FakeBusinessesRepository();
    const repository = new FakeWatchlistRepository();
    const service = new WatchlistService(
      businessesRepository as unknown as BusinessesRepository,
      repository as unknown as WatchlistRepository,
    );

    const item = await service.removeBusiness({
      accountId: 'account_1',
      businessId: 'biz_1',
    });

    expect(item.id).toBe('watch_1');
    expect(repository.removedRequests).toEqual([
      { accountId: 'account_1', businessId: 'biz_1' },
    ]);
  });

  it('throws an exception with context when the saved business is missing', async () => {
    const businessesRepository = new FakeBusinessesRepository();
    const repository = new FakeWatchlistRepository();
    repository.itemToRemove = null;
    const service = new WatchlistService(
      businessesRepository as unknown as BusinessesRepository,
      repository as unknown as WatchlistRepository,
    );

    await expect(
      service.removeBusiness({ accountId: 'account_1', businessId: 'biz_2' }),
    ).rejects.toThrow(NotFoundException);
    await expect(
      service.removeBusiness({ accountId: 'account_1', businessId: 'biz_2' }),
    ).rejects.toThrow(/expected saved watchlist item/);
  });

  it('marks saved businesses as watched for prioritized monitoring', async () => {
    const businessesRepository = new FakeBusinessesRepository();
    const repository = new FakeWatchlistRepository();
    const service = new WatchlistService(
      businessesRepository as unknown as BusinessesRepository,
      repository as unknown as WatchlistRepository,
    );

    await service.saveBusiness({ accountId: 'account_1', businessId: 'biz_1' });

    expect(businessesRepository.lifecycleUpdates).toEqual([
      { businessId: 'biz_1', lifecycleStage: 'watched' },
    ]);
  });
});
