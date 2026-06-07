import { Injectable } from "@nestjs/common";
import { NewDiscoveredBusiness } from "../models/business.model";
import {
  BusinessRegistryDiscoveryRequest,
  BusinessRegistryDiscoveryResult,
  BusinessRegistrySource,
} from "./business-registry-source";

const oregonDatasetUrl = "https://data.oregon.gov/resource/tckn-sxa6.json";
const oregonDiscoveryLimit = 50;
const oregonSourceName = "Oregon Active Businesses Data List";
const oregonFields = [
  "registry_number",
  "business_name",
  "entity_type",
  "registry_date",
  "city",
].join(",");

type OregonActiveBusinessRow = {
  readonly registry_number?: string;
  readonly business_name?: string;
  readonly entity_type?: string;
  readonly registry_date?: string;
  readonly city?: string;
};

@Injectable()
export class OregonActiveBusinessesClient implements BusinessRegistrySource {
  readonly sourceName = oregonSourceName;

  async discoverBusinesses(
    request: BusinessRegistryDiscoveryRequest,
  ): Promise<BusinessRegistryDiscoveryResult> {
    const rows = await fetchOregonRows(request.industry);
    const businesses = rows.flatMap(toOregonDiscoveredBusiness);

    return {
      businesses,
      sourceCursor: resolveOregonSourceCursor(businesses),
      sourceName: this.sourceName,
    };
  }
}

export function buildOregonActiveBusinessesUrl(industry: string): string {
  const params = new URLSearchParams({
    $limit: String(oregonDiscoveryLimit),
    $order: "registry_date DESC",
    $select: oregonFields,
    $where: buildOregonWhereClause(industry),
  });

  return `${oregonDatasetUrl}?${params.toString()}`;
}

async function fetchOregonRows(
  industry: string,
): Promise<readonly OregonActiveBusinessRow[]> {
  const response = await fetch(buildOregonActiveBusinessesUrl(industry), {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `Oregon active businesses request failed: received ${response.status}; expected 2xx JSON response`,
    );
  }

  return (await response.json()) as readonly OregonActiveBusinessRow[];
}

function buildOregonWhereClause(industry: string): string {
  const baseWhere = "registry_date IS NOT NULL AND registry_number IS NOT NULL";
  const normalizedIndustry = industry.trim().toLowerCase();

  if (normalizedIndustry.length === 0 || normalizedIndustry === "all") {
    return baseWhere;
  }

  return `${baseWhere} AND lower(entity_type) like '%${escapeSodaLiteral(normalizedIndustry)}%'`;
}

function toOregonDiscoveredBusiness(
  row: OregonActiveBusinessRow,
): readonly NewDiscoveredBusiness[] {
  const legalName = row.business_name?.trim();
  const sourceDocumentNumber = row.registry_number?.trim();
  const registeredAt = parseOregonDate(row.registry_date);

  if (!legalName || !sourceDocumentNumber || registeredAt === null) {
    return [];
  }

  return [{
    city: row.city?.trim() || null,
    industry: row.entity_type?.trim() || "unclassified",
    legalName,
    registeredAt,
    sourceDocumentNumber: `OR:${sourceDocumentNumber}`,
    sourceName: oregonSourceName,
    state: "OR",
  }];
}

function parseOregonDate(value: string | undefined): Date | null {
  if (value === undefined || value.trim().length === 0) {
    return null;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function resolveOregonSourceCursor(
  businesses: readonly NewDiscoveredBusiness[],
): string | null {
  return businesses[0]?.registeredAt.toISOString().slice(0, 10).replace(/-/g, "") ?? null;
}

function escapeSodaLiteral(value: string): string {
  return value.replace(/'/g, "''");
}
