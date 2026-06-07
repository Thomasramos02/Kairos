import { FloridaCountyBtrContactClient } from "./florida-county-btr-contact.client";
import { DiscoveredBusiness } from "../../businesses/models/business.model";

describe("FloridaCountyBtrContactClient", () => {
  it("adds public county record context for supported top county cities", async () => {
    const client = new FloridaCountyBtrContactClient();

    const result = await client.enrichBusiness(createBusiness("MIAMI"));

    expect(result).toEqual({
      sourceName: "Florida County Business Tax Receipt Context: Miami-Dade",
      contactMethods: [{
        confidenceScore: 60,
        label: "Public county record",
        source: "county-btr",
        type: "license",
        value: expect.stringContaining("Miami-Dade local business tax receipt lookup"),
      }],
    });
  });

  it("does not support Florida cities outside configured top counties yet", () => {
    const client = new FloridaCountyBtrContactClient();

    expect(client.supports(createBusiness("TALLAHASSEE"))).toBe(false);
  });
});

function createBusiness(city: string): DiscoveredBusiness {
  return {
    archivedAt: null,
    city,
    id: "biz_1",
    industry: "contractors",
    legalName: "ACME CONTRACTORS LLC",
    lifecycleStage: "candidate",
    registeredAt: new Date("2026-06-01T00:00:00.000Z"),
    sourceDocumentNumber: "L26000000001",
    sourceName: "Florida Division of Corporations Daily Corporate Filing",
    state: "FL",
  };
}
