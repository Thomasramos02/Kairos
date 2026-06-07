import {
  isPriorityFloridaLicenseIndustry,
  parseFloridaDbprLicenseContext,
} from "./florida-dbpr-license-contact.client";

describe("FloridaDbprLicenseContactClient helpers", () => {
  it("prioritizes contractors and real estate businesses", () => {
    expect(isPriorityFloridaLicenseIndustry({
      industry: "unclassified",
      legalName: "ACME CONTRACTORS LLC",
    })).toBe(true);
    expect(isPriorityFloridaLicenseIndustry({
      industry: "Real Estate Brokerage",
      legalName: "PALM REALTY LLC",
    })).toBe(true);
    expect(isPriorityFloridaLicenseIndustry({
      industry: "Restaurants",
      legalName: "SUNRISE BAKERY LLC",
    })).toBe(false);
  });

  it("parses strong DBPR license contacts only when name matches", () => {
    const html = [
      "ACME CONTRACTORS LLC",
      "License Number CGC1234567",
      "Phone 305-555-1212",
      "Email permits@acmecontractors.com",
    ].join(" ");

    expect(parseFloridaDbprLicenseContext(html, "ACME CONTRACTORS LLC")).toEqual([
      {
        confidenceScore: 80,
        label: "Public license context",
        source: "license",
        type: "license",
        value: "CGC1234567",
      },
      {
        confidenceScore: 82,
        label: "Public license contact",
        source: "license",
        type: "phone",
        value: "+13055551212",
      },
      {
        confidenceScore: 82,
        label: "Public license contact",
        source: "license",
        type: "email",
        value: "permits@acmecontractors.com",
      },
    ]);
  });
});
