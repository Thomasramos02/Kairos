import { NewDiscoveredBusiness } from "../models/business.model";

export type BusinessRegistryDiscoveryRequest = {
  readonly state: string;
  readonly industry: string;
};

export type BusinessRegistryDiscoveryResult = {
  readonly businesses: readonly NewDiscoveredBusiness[];
  readonly sourceCursor: string | null;
  readonly sourceName: string;
};

export type BusinessRegistrySource = {
  readonly sourceName: string;
  discoverBusinesses(
    request: BusinessRegistryDiscoveryRequest,
  ): Promise<BusinessRegistryDiscoveryResult>;
};
