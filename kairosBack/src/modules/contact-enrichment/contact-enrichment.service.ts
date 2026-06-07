import { Injectable } from "@nestjs/common";
import { DiscoveredBusiness } from "../businesses/models/business.model";
import {
  ContactEnrichmentResult,
  ContactEnrichmentSource,
} from "./contact-enrichment-source";
import { ConnecticutRegistryContactClient } from "./sources/connecticut-registry-contact.client";
import { FloridaCountyBtrContactClient } from "./sources/florida-county-btr-contact.client";
import { FloridaDbprLicenseContactClient } from "./sources/florida-dbpr-license-contact.client";
import { FloridaSunbizDetailContactClient } from "./sources/florida-sunbiz-detail-contact.client";

@Injectable()
export class ContactEnrichmentService {
  private readonly sources: readonly ContactEnrichmentSource[];

  constructor(
    connecticutClient: ConnecticutRegistryContactClient,
    floridaCountyBtrClient: FloridaCountyBtrContactClient,
    floridaDbprClient: FloridaDbprLicenseContactClient,
    floridaSunbizClient: FloridaSunbizDetailContactClient,
  ) {
    this.sources = [
      connecticutClient,
      floridaSunbizClient,
      floridaDbprClient,
      floridaCountyBtrClient,
    ];
  }

  async enrichBusiness(
    business: DiscoveredBusiness,
  ): Promise<readonly ContactEnrichmentResult[]> {
    const results: ContactEnrichmentResult[] = [];

    for (const source of this.sources) {
      if (!source.supports(business)) {
        continue;
      }

      const result = await source.enrichBusiness(business);

      if (result !== null && result.contactMethods.length > 0) {
        results.push(result);
      }
    }

    return results;
  }
}
