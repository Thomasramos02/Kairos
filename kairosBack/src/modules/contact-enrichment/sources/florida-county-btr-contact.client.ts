import { Injectable } from "@nestjs/common";
import { BusinessContactMethod } from "../../digital-signals/models/digital-signal.model";
import { DiscoveredBusiness } from "../../businesses/models/business.model";
import { ContactEnrichmentResult, ContactEnrichmentSource } from "../contact-enrichment-source";

const countyBtrSourceName = "Florida County Business Tax Receipt Context";

type FloridaCountyBtrSource = {
  readonly countyName: string;
  readonly url: string;
  readonly cityHints: readonly string[];
};

const topFloridaCountyBtrSources: readonly FloridaCountyBtrSource[] = [
  {
    countyName: "Miami-Dade",
    url: "https://www.miamidade.gov/global/service.page?Mduid_service=ser1499797465137835",
    cityHints: ["miami", "hialeah", "doral", "homestead", "coral gables"],
  },
  {
    countyName: "Broward",
    url: "https://www.broward.org/RecordsTaxesTreasury/TaxesFees/Pages/LocalBusinessTaxes.aspx",
    cityHints: ["fort lauderdale", "hollywood", "pompano beach", "sunrise"],
  },
  {
    countyName: "Orange",
    url: "https://www.octaxcol.com/business-tax-receipts/",
    cityHints: ["orlando", "winter park", "apopka"],
  },
  {
    countyName: "Palm Beach",
    url: "https://www.pbctax.com/local-business-tax",
    cityHints: ["west palm beach", "boca raton", "delray beach"],
  },
  {
    countyName: "Hillsborough",
    url: "https://www.hillstax.org/businesses/local-business-tax/",
    cityHints: ["tampa", "brandon", "plant city"],
  },
];

@Injectable()
export class FloridaCountyBtrContactClient implements ContactEnrichmentSource {
  readonly sourceName = countyBtrSourceName;

  supports(business: DiscoveredBusiness): boolean {
    return business.state === "FL" && resolveCountySource(business) !== null;
  }

  async enrichBusiness(
    business: DiscoveredBusiness,
  ): Promise<ContactEnrichmentResult | null> {
    const countySource = resolveCountySource(business);

    if (countySource === null) {
      return null;
    }

    const contactMethods = buildCountyBtrContext(countySource);

    return {
      contactMethods,
      sourceName: `${this.sourceName}: ${countySource.countyName}`,
    };
  }
}

function resolveCountySource(
  business: Pick<DiscoveredBusiness, "city">,
): FloridaCountyBtrSource | null {
  const city = business.city?.trim().toLowerCase();

  if (city === undefined || city.length === 0) {
    return null;
  }

  return topFloridaCountyBtrSources.find((source) =>
    source.cityHints.some((hint) => city.includes(hint)),
  ) ?? null;
}

function buildCountyBtrContext(
  source: FloridaCountyBtrSource,
): readonly BusinessContactMethod[] {
  return [{
    confidenceScore: 60,
    label: "Public county record",
    source: "county-btr",
    type: "license",
    value: `${source.countyName} local business tax receipt lookup: ${source.url}`,
  }];
}
