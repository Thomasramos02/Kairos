import { DiscoveredBusiness } from "../../businesses/models/business.model";
import { MarketTarget } from "../../market-targets/models/market-target.model";
import { TimingRecalculationRequest } from "../models/timing-recalculation.model";

export function buildTimingRecalculationRequests(
  businesses: readonly DiscoveredBusiness[],
  marketTargets: readonly MarketTarget[],
): readonly TimingRecalculationRequest[] {
  const requestKeys = new Set<string>();

  return marketTargets.flatMap((marketTarget) =>
    businesses
      .filter((business) => matchesMarketTarget(business, marketTarget))
      .flatMap((business) =>
        buildUniqueRequest(business, marketTarget, requestKeys),
      ),
  );
}

function matchesMarketTarget(
  business: DiscoveredBusiness,
  marketTarget: MarketTarget,
): boolean {
  const stateMatches = business.state === marketTarget.state.toUpperCase();
  const cityMatches = matchesNullableCity(
    business.city,
    marketTarget.cityOrRegion,
  );
  const industryMatches = matchesSourceIndustry(
    business.industry,
    marketTarget.industry,
  );

  return stateMatches && cityMatches && industryMatches;
}

function matchesSourceIndustry(
  businessIndustry: string,
  marketTargetIndustry: string,
): boolean {
  if (businessIndustry === "unclassified") {
    return true;
  }

  return businessIndustry === marketTargetIndustry;
}

function matchesNullableCity(
  businessCity: string | null,
  cityOrRegion: string | null,
): boolean {
  if (cityOrRegion === null) {
    return true;
  }

  if (businessCity === null) {
    return false;
  }

  return businessCity === cityOrRegion;
}

function buildUniqueRequest(
  business: DiscoveredBusiness,
  marketTarget: MarketTarget,
  requestKeys: Set<string>,
): readonly TimingRecalculationRequest[] {
  const requestKey = `${business.id}:${marketTarget.offeredService}`;

  if (requestKeys.has(requestKey)) {
    return [];
  }

  requestKeys.add(requestKey);

  return [
    { businessId: business.id, offeredService: marketTarget.offeredService },
  ];
}
