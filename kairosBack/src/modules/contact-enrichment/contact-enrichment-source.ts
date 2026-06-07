import { BusinessContactMethod } from "../digital-signals/models/digital-signal.model";
import { DiscoveredBusiness } from "../businesses/models/business.model";

export type ContactEnrichmentResult = {
  readonly sourceName: string;
  readonly contactMethods: readonly BusinessContactMethod[];
};

export type ContactEnrichmentSource = {
  readonly sourceName: string;
  supports(business: DiscoveredBusiness): boolean;
  enrichBusiness(business: DiscoveredBusiness): Promise<ContactEnrichmentResult | null>;
};
