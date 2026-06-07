import { Injectable } from '@nestjs/common';
import { CreateMarketTargetRequest } from './dto/market-target.dto';
import { MarketTargetsRepository } from './market-targets.repository';
import { MarketTarget } from './models/market-target.model';
import { assertCreateMarketTargetRequest } from './services/market-target.validator';

@Injectable()
export class MarketTargetsService {
  constructor(private readonly marketTargetsRepository: MarketTargetsRepository) {}

  async createMarketTarget(request: CreateMarketTargetRequest): Promise<MarketTarget> {
    assertCreateMarketTargetRequest(request);

    return await this.marketTargetsRepository.createMarketTarget({
      accountId: request.accountId,
      country: request.country,
      state: request.state.toUpperCase(),
      cityOrRegion: resolveCreateMarketTargetCityOrRegion(request),
      industry: request.industry,
      desiredCustomerType: request.desiredCustomerType,
      offeredService: request.offeredService,
    });
  }

  async listByAccount(accountId: string): Promise<readonly MarketTarget[]> {
    return await this.marketTargetsRepository.listByAccount(accountId);
  }
}

type CreateMarketTargetLocationRequest = Pick<
  CreateMarketTargetRequest,
  'cityOrRegion' | 'city' | 'region' | 'city_or_region'
>;

export function resolveCreateMarketTargetCityOrRegion(
  request: CreateMarketTargetLocationRequest,
): string | null {
  const cityOrRegion =
    request.cityOrRegion ??
    request.city ??
    request.region ??
    request.city_or_region;

  if (cityOrRegion === undefined) {
    return null;
  }

  const trimmedCityOrRegion = cityOrRegion.trim();
  return trimmedCityOrRegion.length === 0 ? null : trimmedCityOrRegion;
}
