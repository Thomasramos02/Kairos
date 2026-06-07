import {
  buildColoradoBusinessDetailUrl,
  parseColoradoSosIndustry,
} from "./colorado-sos-industry.scraper";

describe("buildColoradoBusinessDetailUrl", () => {
  it("builds the official Colorado SOS detail URL", () => {
    expect(buildColoradoBusinessDetailUrl("20241052931")).toBe(
      "https://sos.state.co.us/biz/BusinessEntityDetail.do?fileId=20241052931",
    );
  });
});

describe("parseColoradoSosIndustry", () => {
  it("extracts company name and business purpose from structured table HTML", () => {
    const enrichment = parseColoradoSosIndustry(
      `
      <table>
        <tr><th>Name</th><td>Denver Launch Labs LLC</td></tr>
        <tr><th>Business Purpose</th><td>Software product development</td></tr>
      </table>
      `,
      "20241052931",
    );

    expect(enrichment).toEqual({
      state: "CO",
      company_name: "Denver Launch Labs LLC",
      naics_code: "",
      industry: "Software product development",
      confidence_score: 1.0,
    });
  });

  it("uses Colorado NAICS when it is available on the detail page", () => {
    const enrichment = parseColoradoSosIndustry(
      `
      <table>
        <tr><th>Name</th><td>Boulder Data Works LLC</td></tr>
        <tr><th>NAICS</th><td>541511 - Custom Computer Programming Services</td></tr>
      </table>
      `,
      "20241052931",
    );

    expect(enrichment.naics_code).toBe("541511");
    expect(enrichment.industry).toBe(
      "541511 - Custom Computer Programming Services",
    );
  });
});
