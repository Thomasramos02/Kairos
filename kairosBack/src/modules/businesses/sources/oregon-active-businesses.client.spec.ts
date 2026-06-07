import { buildOregonActiveBusinessesUrl } from "./oregon-active-businesses.client";

describe("buildOregonActiveBusinessesUrl", () => {
  it("builds the official Oregon Socrata URL for active businesses", () => {
    const url = new URL(buildOregonActiveBusinessesUrl("all"));

    expect(url.origin + url.pathname).toBe(
      "https://data.oregon.gov/resource/tckn-sxa6.json",
    );
    expect(url.searchParams.get("$order")).toBe("registry_date DESC");
    expect(url.searchParams.get("$limit")).toBe("50");
    expect(url.searchParams.get("$where")).toContain("registry_date");
  });

  it("filters Oregon discovery by entity type when an industry is supplied", () => {
    const url = new URL(buildOregonActiveBusinessesUrl("llc"));

    expect(url.searchParams.get("$where")).toContain(
      "lower(entity_type) like '%llc%'",
    );
  });
});
