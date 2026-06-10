import { DiscoveredBusiness } from "../../businesses/models/business.model";
import { MarketTarget } from "../../market-targets/models/market-target.model";
import { TimingStageHistoryEntry } from "../../timing/models/timing-stage-history.model";
import { WatchlistItem } from "../../watchlist/models/watchlist.model";
import { CreateAlertRequest } from "../dto/alert.dto";

export function buildTimingAlertRequests(
  business: DiscoveredBusiness,
  stageHistoryEntry: TimingStageHistoryEntry | null,
  marketTargets: readonly MarketTarget[],
  watchlistItems: readonly WatchlistItem[],
): readonly CreateAlertRequest[] {
  if (stageHistoryEntry === null) {
    return [];
  }

  if (stageHistoryEntry.previousStage === null) {
    return buildMarketTargetAlerts(business, stageHistoryEntry, marketTargets);
  }

  if (stageHistoryEntry.nextStage === "best-window") {
    return buildWatchlistBestWindowAlerts(business.id, business.legalName, watchlistItems);
  }

  return buildMarketTargetAlerts(business, stageHistoryEntry, marketTargets);
}

function buildMarketTargetAlerts(
  business: DiscoveredBusiness,
  stageHistoryEntry: TimingStageHistoryEntry,
  marketTargets: readonly MarketTarget[],
): readonly CreateAlertRequest[] {
  return marketTargets
    .filter((marketTarget) =>
      matchesMarketTarget(business, stageHistoryEntry, marketTarget),
    )
    .map((marketTarget) => ({
      accountId: marketTarget.accountId,
      businessId: business.id,
      businessName: business.legalName,
      reason:
        stageHistoryEntry.previousStage === null
          ? "new-business"
          : "timing-stage-changed",
    }));
}

function matchesMarketTarget(
  business: DiscoveredBusiness,
  stageHistoryEntry: TimingStageHistoryEntry,
  marketTarget: MarketTarget,
): boolean {
  const stateMatches = business.state === marketTarget.state.toUpperCase();
  const cityMatches = matchesOptionalCity(
    business.city,
    marketTarget.cityOrRegion,
  );
  const industryMatches = business.industry === marketTarget.industry;
  const serviceMatches =
    stageHistoryEntry.offeredService === marketTarget.offeredService;

  return stateMatches && cityMatches && industryMatches && serviceMatches;
}

function matchesOptionalCity(
  businessCity: string | null,
  cityOrRegion: string | null,
): boolean {
  if (cityOrRegion === null) {
    return true;
  }

  return businessCity === cityOrRegion;
}

function buildWatchlistBestWindowAlerts(
  businessId: string,
  businessName: string,
  watchlistItems: readonly WatchlistItem[],
): readonly CreateAlertRequest[] {
  return watchlistItems.map((watchlistItem) => ({
    accountId: watchlistItem.accountId,
    businessId,
    businessName,
    reason: "entered-best-window",
  }));
}
