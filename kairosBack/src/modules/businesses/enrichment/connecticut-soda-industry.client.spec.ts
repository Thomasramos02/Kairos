import { buildConnecticutSodaUrl } from "./connecticut-soda-industry.client";

describe("buildConnecticutSodaUrl", () => {
  it("builds the official Socrata API URL for a Connecticut account number", () => {
    const url = new URL(buildConnecticutSodaUrl("1234567"));

    expect(url.origin + url.pathname).toBe(
      "https://data.ct.gov/resource/n7gp-d28j.json",
    );
    expect(url.searchParams.get("$select")).toBe(
      "name,accountnumber,naics_code,naics_sub_code",
    );
    expect(url.searchParams.get("accountnumber")).toBe("1234567");
    expect(url.searchParams.get("$limit")).toBe("1");
  });
});
