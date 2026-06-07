import { DiscoveredBusiness } from "../../businesses/models/business.model";
import { MarketTarget } from "../../market-targets/models/market-target.model";
import { buildTimingRecalculationRequests } from "./timing-recalculation-request.builder";

describe("buildTimingRecalculationRequests", () => {
  it("returns unique business and service pairs for matching targets", () => {
    const requests = buildTimingRecalculationRequests(
      [createBusiness({ id: "biz_1" })],
      [
        createMarketTarget({ id: "target_1", cityOrRegion: null }),
        createMarketTarget({ id: "target_2", cityOrRegion: "Miami" }),
      ],
    );

    expect(requests).toEqual([
      { businessId: "biz_1", offeredService: "website-design-development" },
    ]);
  });

  it("keeps different offered services for the same business", () => {
    const requests = buildTimingRecalculationRequests(
      [createBusiness({ id: "biz_1" })],
      [
        createMarketTarget({ id: "target_1", offeredService: "branding" }),
        createMarketTarget({ id: "target_2", offeredService: "seo-local-seo" }),
      ],
    );

    expect(requests).toEqual([
      { businessId: "biz_1", offeredService: "branding" },
      { businessId: "biz_1", offeredService: "seo-local-seo" },
    ]);
  });

  it("skips businesses outside the target state city or industry", () => {
    const requests = buildTimingRecalculationRequests(
      [
        createBusiness({ id: "biz_1", state: "TX" }),
        createBusiness({ id: "biz_2", city: "Orlando" }),
        createBusiness({ id: "biz_3", industry: "Retail" }),
      ],
      [createMarketTarget({ cityOrRegion: "Miami", industry: "Restaurants" })],
    );

    expect(requests).toEqual([]);
  });

  it("matches unknown business cities only when the target has no city filter", () => {
    const requests = buildTimingRecalculationRequests(
      [createBusiness({ id: "biz_1", city: null })],
      [
        createMarketTarget({ id: "target_1", cityOrRegion: "Miami" }),
        createMarketTarget({ id: "target_2", cityOrRegion: null }),
      ],
    );

    expect(requests).toEqual([
      { businessId: "biz_1", offeredService: "website-design-development" },
    ]);
  });

  it("matches unclassified source industries because Florida does not classify filings", () => {
    const requests = buildTimingRecalculationRequests(
      [createBusiness({ id: "biz_1", industry: "unclassified" })],
      [createMarketTarget({ industry: "Restaurants" })],
    );

    expect(requests).toEqual([
      { businessId: "biz_1", offeredService: "website-design-development" },
    ]);
  });
});

function createBusiness(
  overrides: Partial<DiscoveredBusiness>,
): DiscoveredBusiness {
  return {
    id: "biz_default",
    sourceDocumentNumber: "P01000000001",
    legalName: "Kairos Cafe LLC",
    state: "FL",
    city: "Miami",
    industry: "Restaurants",
    archivedAt: null,
    lifecycleStage: "candidate",
    registeredAt: new Date("2026-06-01T00:00:00.000Z"),
    sourceName: "Florida Sunbiz",
    ...overrides,
  };
}

function createMarketTarget(overrides: Partial<MarketTarget>): MarketTarget {
  return {
    id: "target_default",
    accountId: "acct_1",
    country: "US",
    state: "FL",
    cityOrRegion: null,
    industry: "Restaurants",
    desiredCustomerType: "Local restaurant owners",
    offeredService: "website-design-development",
    ...overrides,
  };
}
