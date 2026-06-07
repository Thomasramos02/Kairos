import { Injectable } from "@nestjs/common";
import {
  CorporateIndustryEnrichment,
  CorporateIndustryEnrichmentSource,
} from "./corporate-industry-enrichment.model";

const connecticutDatasetUrl = "https://data.ct.gov/resource/n7gp-d28j.json";
const connecticutFields = "name,accountnumber,naics_code,naics_sub_code";

type ConnecticutBusinessMasterRow = {
  readonly name?: string;
  readonly accountnumber?: string;
  readonly naics_code?: string;
  readonly naics_sub_code?: string;
};

@Injectable()
export class ConnecticutSodaIndustryClient
  implements CorporateIndustryEnrichmentSource
{
  async enrichByCompanyId(
    companyId: string,
  ): Promise<CorporateIndustryEnrichment> {
    const rows = await fetchConnecticutRows(companyId);
    const row = rows[0];

    if (row === undefined) {
      throw new Error(
        `Connecticut company not found: received "${companyId}"; expected accountnumber in data.ct.gov n7gp-d28j`,
      );
    }

    return toConnecticutEnrichment(row, companyId);
  }
}

export function buildConnecticutSodaUrl(companyId: string): string {
  const params = new URLSearchParams({
    $limit: "1",
    $select: connecticutFields,
    accountnumber: companyId.trim(),
  });

  return `${connecticutDatasetUrl}?${params.toString()}`;
}

async function fetchConnecticutRows(
  companyId: string,
): Promise<readonly ConnecticutBusinessMasterRow[]> {
  const response = await fetch(buildConnecticutSodaUrl(companyId), {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `Connecticut SODA request failed: received ${response.status} for "${companyId}"; expected 2xx JSON response`,
    );
  }

  return (await response.json()) as readonly ConnecticutBusinessMasterRow[];
}

function toConnecticutEnrichment(
  row: ConnecticutBusinessMasterRow,
  companyId: string,
): CorporateIndustryEnrichment {
  const companyName = requireText(row.name, "name", companyId);
  const naicsCode = requireText(row.naics_code, "naics_code", companyId);

  return {
    state: "CT",
    company_name: companyName,
    naics_code: naicsCode,
    industry: row.naics_sub_code?.trim() || naicsCode,
    confidence_score: 1.0,
  };
}

function requireText(
  value: string | undefined,
  fieldName: string,
  companyId: string,
): string {
  if (value === undefined || value.trim().length === 0) {
    throw new Error(
      `Invalid Connecticut row: received empty ${fieldName} for "${companyId}"; expected populated ${fieldName}`,
    );
  }

  return value.trim();
}
