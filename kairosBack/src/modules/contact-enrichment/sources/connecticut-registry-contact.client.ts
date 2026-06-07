import { Injectable } from "@nestjs/common";
import { DiscoveredBusiness } from "../../businesses/models/business.model";
import { ContactEnrichmentResult, ContactEnrichmentSource } from "../contact-enrichment-source";

const connecticutDatasetUrl = "https://data.ct.gov/resource/n7gp-d28j.json";
const connecticutContactSourceName = "Connecticut Business Registry Official Email";

type ConnecticutContactRow = {
  readonly business_email_address?: string;
};

@Injectable()
export class ConnecticutRegistryContactClient implements ContactEnrichmentSource {
  readonly sourceName = connecticutContactSourceName;

  supports(business: DiscoveredBusiness): boolean {
    return business.state === "CT" && business.sourceDocumentNumber !== null;
  }

  async enrichBusiness(
    business: DiscoveredBusiness,
  ): Promise<ContactEnrichmentResult | null> {
    const email = await fetchConnecticutEmail(business.sourceDocumentNumber);

    if (email === null) {
      return null;
    }

    return {
      sourceName: this.sourceName,
      contactMethods: [{
        confidenceScore: 90,
        label: "Corporate contact",
        source: "registry",
        type: "email",
        value: email,
      }],
    };
  }
}

export function buildConnecticutContactUrl(accountNumber: string | null): string {
  if (accountNumber === null || accountNumber.trim().length === 0) {
    throw new Error(
      `Invalid Connecticut account number: received "${accountNumber}"; expected non-empty account number`,
    );
  }

  const params = new URLSearchParams({
    $limit: "1",
    $select: "business_email_address",
    $where: `accountnumber = '${escapeSodaLiteral(accountNumber.trim())}'`,
  });

  return `${connecticutDatasetUrl}?${params.toString()}`;
}

async function fetchConnecticutEmail(
  accountNumber: string | null,
): Promise<string | null> {
  const response = await fetch(buildConnecticutContactUrl(accountNumber), {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `Connecticut contact request failed: received ${response.status}; expected 2xx JSON response`,
    );
  }

  const rows = (await response.json()) as readonly ConnecticutContactRow[];
  return normalizeEmail(rows[0]?.business_email_address);
}

function normalizeEmail(value: string | undefined): string | null {
  const normalizedEmail = value?.trim().toLowerCase() ?? "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return null;
  }

  return normalizedEmail;
}

function escapeSodaLiteral(value: string): string {
  return value.replace(/'/g, "''");
}
