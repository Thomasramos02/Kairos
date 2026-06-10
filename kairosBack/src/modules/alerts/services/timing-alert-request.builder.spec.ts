import { DiscoveredBusiness } from "../../businesses/models/business.model";
import { MarketTarget } from "../../market-targets/models/market-target.model";
import { TimingStageHistoryEntry } from "../../timing/models/timing-stage-history.model";
import { WatchlistItem } from "../../watchlist/models/watchlist.model";
import { buildTimingAlertRequests } from "./timing-alert-request.builder";

describe("buildTimingAlertRequests", () => {
  it("alerts matching market targets when a new business gets its first stage", () => {
    const requests = buildTimingAlertRequests(
      createBusiness({}),
      createStageHistoryEntry({ previousStage: null }),
      [createMarketTarget({ accountId: "acct_1" })],
      [],
    );

    expect(requests).toEqual([
      { accountId: "acct_1", businessId: "biz_1", businessName: "Valori Stack LLC", reason: "new-business" },
    ]);
  });

  it("alerts watchlist owners when a saved business enters best window", () => {
    const requests = buildTimingAlertRequests(
      createBusiness({}),
      createStageHistoryEntry({
        previousStage: "warming-up",
        nextStage: "best-window",
      }),
      [],
      [createWatchlistItem({ accountId: "acct_2" })],
    );

    expect(requests).toEqual([
      {
        accountId: "acct_2",
        businessId: "biz_1",
        businessName: "Valori Stack LLC",
        reason: "entered-best-window",
      },
    ]);
  });

  it("alerts matching market targets when a business changes phase", () => {
    const requests = buildTimingAlertRequests(
      createBusiness({ city: null }),
      createStageHistoryEntry({
        previousStage: "warming-up",
        nextStage: "cooling-down",
      }),
      [
        createMarketTarget({ accountId: "acct_1", cityOrRegion: null }),
        createMarketTarget({ accountId: "acct_2", cityOrRegion: "Miami" }),
      ],
      [],
    );

    expect(requests).toEqual([
      {
        accountId: "acct_1",
        businessId: "biz_1",
        businessName: "Valori Stack LLC",
        reason: "timing-stage-changed",
      },
    ]);
  });

  it("skips alerts when no real stage change was recorded", () => {
    const requests = buildTimingAlertRequests(
      createBusiness({}),
      null,
      [createMarketTarget({ accountId: "acct_1" })],
      [createWatchlistItem({ accountId: "acct_2" })],
    );

    expect(requests).toEqual([]);
  });
});

function createBusiness(
  overrides: Partial<DiscoveredBusiness>,
): DiscoveredBusiness {
  return {
    id: "biz_1",
    sourceDocumentNumber: "L26000296170",
    legalName: "Valori Stack LLC",
    state: "FL",
    city: "Miami",
    industry: "restaurants",
    archivedAt: null,
    lifecycleStage: "candidate",
    registeredAt: new Date("2026-05-27T00:00:00.000Z"),
    sourceName: "Florida Division of Corporations Daily Corporate Filing",
    ...overrides,
  };
}

function createStageHistoryEntry(
  overrides: Partial<TimingStageHistoryEntry>,
): TimingStageHistoryEntry {
  return {
    id: "stage_1",
    businessId: "biz_1",
    offeredService: "website-design-development",
    previousStage: null,
    nextStage: "warming-up",
    timingScore: 65,
    reason: "test timing reason",
    changedAt: "2026-06-04T00:00:00.000Z",
    ...overrides,
  };
}

function createMarketTarget(overrides: Partial<MarketTarget>): MarketTarget {
  return {
    id: "target_1",
    accountId: "acct_1",
    country: "US",
    state: "FL",
    cityOrRegion: "Miami",
    industry: "restaurants",
    desiredCustomerType: "New restaurants",
    offeredService: "website-design-development",
    ...overrides,
  };
}

function createWatchlistItem(overrides: Partial<WatchlistItem>): WatchlistItem {
  return {
    id: "watch_1",
    accountId: "acct_1",
    businessId: "biz_1",
    savedAt: "2026-06-04T00:00:00.000Z",
    ...overrides,
  };
}
