import { OfferedService } from '../../../domain/offered-service';

export type MarketTarget = {
  readonly id: string;
  readonly accountId: string;
  readonly country: 'US';
  readonly state: string;
  readonly cityOrRegion: string | null;
  readonly industry: string;
  readonly desiredCustomerType: string;
  readonly offeredService: OfferedService;
};
