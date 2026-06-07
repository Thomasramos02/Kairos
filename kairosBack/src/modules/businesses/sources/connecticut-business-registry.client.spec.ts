import { buildConnecticutBusinessDiscoveryUrl } from "./connecticut-business-registry.client";

describe("buildConnecticutBusinessDiscoveryUrl", () => {
  it("builds a Socrata query for recent Connecticut business registrations", () => {
    const url = new URL(buildConnecticutBusinessDiscoveryUrl("all"));

    expect(url.origin + url.pathname).toBe(
      "https://data.ct.gov/resource/n7gp-d28j.json",
    );
    expect(url.searchParams.get("$limit")).toBe("50");
    expect(url.searchParams.get("$order")).toBe("date_registration DESC");
    expect(url.searchParams.get("$select")).toBe(
      "name,accountnumber,date_registration,billingcity,naics_code,naics_sub_code",
    );
    expect(url.searchParams.get("$where")).toBe(
      "date_registration IS NOT NULL AND accountnumber IS NOT NULL",
    );
  });

  it("filters Connecticut discovery by NAICS description when an industry is provided", () => {
    const url = new URL(buildConnecticutBusinessDiscoveryUrl("Custom Programming"));

    expect(url.searchParams.get("$where")).toContain(
      "lower(naics_sub_code) like '%custom programming%'",
    );
  });
});
