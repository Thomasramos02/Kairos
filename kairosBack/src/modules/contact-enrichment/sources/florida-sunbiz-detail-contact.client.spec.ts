import {
  buildFloridaSunbizDetailUrl,
  parseFloridaSunbizPublicContext,
} from "./florida-sunbiz-detail-contact.client";

describe("FloridaSunbizDetailContactClient helpers", () => {
  it("builds Sunbiz document number lookup URLs", () => {
    const url = new URL(buildFloridaSunbizDetailUrl("L26000000001"));

    expect(url.origin + url.pathname).toBe(
      "https://search.sunbiz.org/Inquiry/CorporationSearch/ByDocumentNumber",
    );
    expect(url.searchParams.get("searchTerm")).toBe("L26000000001");
  });

  it("parses public registry context from Sunbiz detail HTML", () => {
    const contacts = parseFloridaSunbizPublicContext([
      "<h3>Principal Address</h3><div>123 Main Street Miami, FL 33101</div>",
      "<h3>Registered Agent Name & Address</h3><div>DOE, JANE 99 Agent Ave Miami FL</div>",
      "<h3>Officer/Director Detail</h3><div>DOE, JOHN MANAGER</div>",
    ].join(""));

    expect(contacts).toEqual([
      {
        confidenceScore: 90,
        label: "Public registry context",
        source: "registry",
        type: "address",
        value: "123 Main Street Miami, FL 33101",
      },
      {
        confidenceScore: 85,
        label: "Public registry context",
        source: "registry",
        type: "agent",
        value: "DOE, JANE 99 Agent Ave Miami FL",
      },
      {
        confidenceScore: 85,
        label: "Public registry context",
        source: "registry",
        type: "officer",
        value: "DOE, JOHN MANAGER",
      },
    ]);
  });
});
