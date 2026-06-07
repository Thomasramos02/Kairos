import {
  buildConnecticutContactUrl,
  ConnecticutRegistryContactClient,
} from "./connecticut-registry-contact.client";
import { DiscoveredBusiness } from "../../businesses/models/business.model";

describe("ConnecticutRegistryContactClient", () => {
  const previousFetch = global.fetch;

  afterEach(() => {
    global.fetch = previousFetch;
  });

  it("builds a Socrata lookup by account number", () => {
    const url = new URL(buildConnecticutContactUrl("1234567"));

    expect(url.searchParams.get("$select")).toBe("business_email_address");
    expect(url.searchParams.get("$where")).toBe("accountnumber = '1234567'");
  });

  it("returns official registry email contacts", async () => {
    global.fetch = jest.fn(async () => new Response(JSON.stringify([{
      business_email_address: "HELLO@EXAMPLE.COM",
    }])));
    const client = new ConnecticutRegistryContactClient();

    const result = await client.enrichBusiness(createBusiness());

    expect(result).toEqual({
      sourceName: "Connecticut Business Registry Official Email",
      contactMethods: [{
        confidenceScore: 90,
        label: "Corporate contact",
        source: "registry",
        type: "email",
        value: "hello@example.com",
      }],
    });
  });
});

function createBusiness(): DiscoveredBusiness {
  return {
    archivedAt: null,
    city: "HARTFORD",
    id: "biz_1",
    industry: "Professional Services",
    legalName: "KAIROS CT LLC",
    lifecycleStage: "candidate",
    registeredAt: new Date("2026-06-01T00:00:00.000Z"),
    sourceDocumentNumber: "1234567",
    sourceName: "Connecticut Business Registry Business Master",
    state: "CT",
  };
}
