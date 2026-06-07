import {
  buildSeattleBusinessLicenseUrl,
  SeattleBusinessLicenseClient,
} from "./seattle-business-license.client";

describe("buildSeattleBusinessLicenseUrl", () => {
  it("builds the official Seattle Socrata URL for recent licenses", () => {
    const url = new URL(
      buildSeattleBusinessLicenseUrl("all", new Date("2026-06-07T00:00:00.000Z")),
    );

    expect(url.origin + url.pathname).toBe(
      "https://data.seattle.gov/resource/wnbq-64tb.json",
    );
    expect(url.searchParams.has("$order")).toBe(false);
    expect(url.searchParams.get("$limit")).toBe("50");
    expect(url.searchParams.get("$where")).toContain("license_start_date >= '20260508'");
  });

  it("filters Seattle discovery by NAICS description", () => {
    const url = new URL(buildSeattleBusinessLicenseUrl("restaurants"));

    expect(url.searchParams.get("$where")).toContain(
      "lower(naics_description) like '%restaurants%'",
    );
  });
});

describe("SeattleBusinessLicenseClient", () => {
  const previousFetch = global.fetch;

  afterEach(() => {
    global.fetch = previousFetch;
  });

  it("maps compact Seattle license dates into discovered businesses", async () => {
    global.fetch = jest.fn(async () => new Response(JSON.stringify([{
      business_legal_name: "1724 MLK LLC",
      business_phone: "2065551234",
      city: "SEATTLE",
      city_account_number: "0008925100810216",
      license_start_date: "20260601",
      naics_description: "Lessors of Residential Buildings and Dwellings",
      ubi: "6062143280010001",
    }])));
    const client = new SeattleBusinessLicenseClient();

    const result = await client.discoverBusinesses({ industry: "all", state: "WA" });

    expect(result.businesses).toEqual([{
      city: "SEATTLE",
      contactMethods: [{
        confidenceScore: 80,
        source: "registry",
        type: "phone",
        value: "+12065551234",
      }],
      industry: "Lessors of Residential Buildings and Dwellings",
      legalName: "1724 MLK LLC",
      registeredAt: new Date("2026-06-01T00:00:00.000Z"),
      sourceDocumentNumber: "SEA:6062143280010001",
      sourceName: "Seattle Active Business License Tax Certificate",
      state: "WA",
    }]);
  });
});
