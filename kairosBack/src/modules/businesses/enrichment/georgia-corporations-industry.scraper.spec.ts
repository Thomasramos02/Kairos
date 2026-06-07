import {
  buildGeorgiaBusinessDetailUrl,
  parseGeorgiaCorporationIndustry,
} from "./georgia-corporations-industry.scraper";

describe("buildGeorgiaBusinessDetailUrl", () => {
  it("builds the official Georgia Corporations Division detail URL", () => {
    expect(buildGeorgiaBusinessDetailUrl("981488")).toBe(
      "https://ecorp.sos.ga.gov/BusinessSearch/BusinessInformation?businessId=981488&fromSearch=True",
    );
  });
});

describe("parseGeorgiaCorporationIndustry", () => {
  it("extracts company name, NAICS code and NAICS description from table HTML", () => {
    const enrichment = parseGeorgiaCorporationIndustry(
      `
      <table>
        <tr><td>Business Name:</td><td>Atlanta Digital Studio LLC</td></tr>
        <tr><td>NAICS Code:</td><td>541511</td></tr>
        <tr><td>NAICS Description:</td><td>Custom Computer Programming Services</td></tr>
      </table>
      `,
      "981488",
    );

    expect(enrichment).toEqual({
      state: "GA",
      company_name: "Atlanta Digital Studio LLC",
      naics_code: "541511",
      industry: "Custom Computer Programming Services",
      confidence_score: 1.0,
    });
  });

  it("rejects Georgia rows without a six digit NAICS code", () => {
    expect(() =>
      parseGeorgiaCorporationIndustry(
        `
        <table>
          <tr><td>Business Name:</td><td>Any Purpose LLC</td></tr>
          <tr><td>NAICS Code:</td><td>Any legal purpose</td></tr>
          <tr><td>NAICS Description:</td><td>General Business</td></tr>
        </table>
        `,
        "981488",
      ),
    ).toThrow(
      'Invalid Georgia NAICS Code: received "Any legal purpose" for "981488"; expected 6 digit NAICS code',
    );
  });
});
