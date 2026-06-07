import { Injectable } from "@nestjs/common";
import { NewDiscoveredBusiness } from "../models/business.model";
import {
  BusinessRegistryDiscoveryRequest,
  BusinessRegistryDiscoveryResult,
  BusinessRegistrySource,
} from "./business-registry-source";

const connecticutDatasetUrl = "https://data.ct.gov/resource/n7gp-d28j.json";
const connecticutDiscoveryLimit = 50;
const connecticutSourceName = "Connecticut Business Registry Business Master";
const connecticutFields = [
  "name",
  "accountnumber",
  "date_registration",
  "billingcity",
  "naics_code",
  "naics_sub_code",
].join(",");

type ConnecticutBusinessRegistryRow = {
  readonly name?: string;
  readonly accountnumber?: string;
  readonly date_registration?: string;
  readonly billingcity?: string;
  readonly naics_code?: string;
  readonly naics_sub_code?: string;
};

@Injectable()
export class ConnecticutBusinessRegistryClient implements BusinessRegistrySource {
  readonly sourceName = connecticutSourceName;

  async discoverBusinesses(
    request: BusinessRegistryDiscoveryRequest,
  ): Promise<BusinessRegistryDiscoveryResult> {
    const rows = await fetchConnecticutRegistryRows(request.industry);
    const businesses = rows.flatMap(toConnecticutDiscoveredBusiness);

    return {
      businesses,
      sourceCursor: resolveConnecticutSourceCursor(businesses),
      sourceName: this.sourceName,
    };
  }
}

export function buildConnecticutBusinessDiscoveryUrl(industry: string): string {
  const params = new URLSearchParams({
    $limit: String(connecticutDiscoveryLimit),
    $order: "date_registration DESC",
    $select: connecticutFields,
    $where: buildConnecticutWhereClause(industry),
  });

  return `${connecticutDatasetUrl}?${params.toString()}`;
}

async function fetchConnecticutRegistryRows(
  industry: string,
): Promise<readonly ConnecticutBusinessRegistryRow[]> {
  const response = await fetch(buildConnecticutBusinessDiscoveryUrl(industry), {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `Connecticut discovery request failed: received ${response.status}; expected 2xx JSON response`,
    );
  }

  return (await response.json()) as readonly ConnecticutBusinessRegistryRow[];
}

function buildConnecticutWhereClause(industry: string): string {
  const normalizedIndustry = industry.trim().toLowerCase();
  const baseWhere = "date_registration IS NOT NULL AND accountnumber IS NOT NULL";

  if (normalizedIndustry.length === 0 || normalizedIndustry === "all") {
    return baseWhere;
  }

  return `${baseWhere} AND lower(naics_sub_code) like '%${escapeSodaLiteral(normalizedIndustry)}%'`;
}

function toConnecticutDiscoveredBusiness(
  row: ConnecticutBusinessRegistryRow,
): readonly NewDiscoveredBusiness[] {
  const legalName = row.name?.trim();
  const sourceDocumentNumber = row.accountnumber?.trim();
  const registeredAt = parseConnecticutRegistrationDate(row.date_registration);

  if (!legalName || !sourceDocumentNumber || registeredAt === null) {
    return [];
  }

  return [
    {
      city: row.billingcity?.trim() || null,
      industry: resolveConnecticutIndustry(row),
      legalName,
      registeredAt,
      sourceDocumentNumber,
      sourceName: connecticutSourceName,
      state: "CT",
    },
  ];
}

function parseConnecticutRegistrationDate(value: string | undefined): Date | null {
  if (value === undefined || value.trim().length === 0) {
    return null;
  }

  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function resolveConnecticutIndustry(row: ConnecticutBusinessRegistryRow): string {
  const description = row.naics_sub_code?.trim();
  const code = row.naics_code?.trim();

  return description || code || "unclassified";
}

function resolveConnecticutSourceCursor(
  businesses: readonly NewDiscoveredBusiness[],
): string | null {
  const newestBusiness = businesses[0];

  if (newestBusiness === undefined) {
    return null;
  }

  return newestBusiness.registeredAt.toISOString().slice(0, 10).replace(/-/g, "");
}

function escapeSodaLiteral(value: string): string {
  return value.replace(/'/g, "''");
}
