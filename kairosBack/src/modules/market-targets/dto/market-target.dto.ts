import { OfferedService } from '../../../domain/offered-service';

export type CreateMarketTargetRequest = {
  readonly accountId: string;
  readonly country: 'US';
  readonly state: string;
  readonly city?: string;
  readonly region?: string;
  readonly cityOrRegion?: string;
  readonly city_or_region?: string;
  readonly industry: string;
  readonly desiredCustomerType: string;
  readonly offeredService: OfferedService;
};
