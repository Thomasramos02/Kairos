import { Injectable } from "@nestjs/common";
import { createHash } from "crypto";
import { BusinessContactMethod } from "../../digital-signals/models/digital-signal.model";
import { NewDiscoveredBusiness } from "../models/business.model";
import {
  BusinessRegistryDiscoveryRequest,
  BusinessRegistryDiscoveryResult,
  BusinessRegistrySource,
} from "./business-registry-source";

const seattleDatasetUrl = "https://data.seattle.gov/resource/wnbq-64tb.json";
const seattleDiscoveryLimit = 50;
const seattleSourceName = "Seattle Active Business License Tax Certificate";
const seattleFields = [
  "business_legal_name",
  "license_start_date",
  "city",
  "naics_code",
  "naics_description",
  "city_account_number",
  "business_phone",
  "ubi",
].join(",");

type SeattleBusinessLicenseRow = {
  readonly business_legal_name?: string;
  readonly license_start_date?: string;
  readonly city?: string;
  readonly naics_code?: string;
  readonly naics_description?: string;
  readonly city_account_number?: string;
  readonly business_phone?: string;
  readonly ubi?: string;
};

@Injectable()
export class SeattleBusinessLicenseClient implements BusinessRegistrySource {
  readonly sourceName = seattleSourceName;

  async discoverBusinesses(
    request: BusinessRegistryDiscoveryRequest,
  ): Promise<BusinessRegistryDiscoveryResult> {
    const rows = await fetchSeattleRows(request.industry);
    const businesses = sortSeattleBusinessesByRegistrationDate(
      rows.flatMap(toSeattleDiscoveredBusiness),
    );

    return {
      businesses,
      sourceCursor: resolveSeattleSourceCursor(businesses),
      sourceName: this.sourceName,
    };
  }
}

export function buildSeattleBusinessLicenseUrl(
  industry: string,
  referenceDate = new Date(),
): string {
  const params = new URLSearchParams({
    $limit: String(seattleDiscoveryLimit),
    $select: seattleFields,
    $where: buildSeattleWhereClause(industry, referenceDate),
  });

  return `${seattleDatasetUrl}?${params.toString()}`;
}

async function fetchSeattleRows(
  industry: string,
): Promise<readonly SeattleBusinessLicenseRow[]> {
  const response = await fetch(buildSeattleBusinessLicenseUrl(industry), {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `Seattle license request failed: received ${response.status}; expected 2xx JSON response`,
    );
  }

  return (await response.json()) as readonly SeattleBusinessLicenseRow[];
}

function buildSeattleWhereClause(industry: string, referenceDate: Date): string {
  const cutoff = formatSeattleRecentCutoff(referenceDate);
  const baseWhere = [
    `license_start_date >= '${cutoff}'`,
    "business_legal_name IS NOT NULL",
  ].join(" AND ");
  const normalizedIndustry = industry.trim().toLowerCase();

  if (normalizedIndustry.length === 0 || normalizedIndustry === "all") {
    return baseWhere;
  }

  return `${baseWhere} AND lower(naics_description) like '%${escapeSodaLiteral(normalizedIndustry)}%'`;
}

function toSeattleDiscoveredBusiness(
  row: SeattleBusinessLicenseRow,
): readonly NewDiscoveredBusiness[] {
  const legalName = row.business_legal_name?.trim();
  const registeredAt = parseSeattleDate(row.license_start_date);

  if (!legalName || registeredAt === null) {
    return [];
  }

  return [{
    city: row.city?.trim() || "Seattle",
    industry: row.naics_description?.trim() || row.naics_code?.trim() || "unclassified",
    legalName,
    registeredAt,
    contactMethods: buildSeattleContactMethods(row),
    sourceDocumentNumber: buildSeattleSourceDocumentNumber(row, legalName, registeredAt),
    sourceName: seattleSourceName,
    state: "WA",
  }];
}

function buildSeattleContactMethods(
  row: SeattleBusinessLicenseRow,
): readonly BusinessContactMethod[] | undefined {
  const phone = normalizeSeattlePhone(row.business_phone);

  if (phone === null) {
    return undefined;
  }

  return [{
    confidenceScore: 80,
    source: "registry" as const,
    type: "phone" as const,
    value: phone,
  }];
}

function normalizeSeattlePhone(value: string | undefined): string | null {
  const digits = value?.replace(/\D/g, "") ?? "";

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  return null;
}

function buildSeattleSourceDocumentNumber(
  row: SeattleBusinessLicenseRow,
  legalName: string,
  registeredAt: Date,
): string {
  const officialIdentifier = row.ubi?.trim() || row.city_account_number?.trim();

  if (officialIdentifier) {
    return `SEA:${officialIdentifier}`;
  }

  const digest = createHash("sha1")
    .update(`${legalName}:${registeredAt.toISOString()}`)
    .digest("hex");

  return `SEA:${digest}`;
}

function parseSeattleDate(value: string | undefined): Date | null {
  if (value === undefined || value.trim().length === 0) {
    return null;
  }

  const normalizedDate = value.trim();

  if (/^\d{8}$/.test(normalizedDate)) {
    return parseSeattleCompactDate(normalizedDate);
  }

  const parsedDate = new Date(normalizedDate);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function parseSeattleCompactDate(value: string): Date | null {
  const year = Number(value.slice(0, 4));
  const monthIndex = Number(value.slice(4, 6)) - 1;
  const day = Number(value.slice(6, 8));
  const parsedDate = new Date(Date.UTC(year, monthIndex, day));

  if (parsedDate.getUTCMonth() !== monthIndex) {
    return null;
  }

  return parsedDate;
}

function formatSeattleRecentCutoff(referenceDate: Date): string {
  const cutoffDate = new Date(referenceDate);
  cutoffDate.setUTCDate(cutoffDate.getUTCDate() - 30);

  return [
    cutoffDate.getUTCFullYear(),
    String(cutoffDate.getUTCMonth() + 1).padStart(2, "0"),
    String(cutoffDate.getUTCDate()).padStart(2, "0"),
  ].join("");
}

function resolveSeattleSourceCursor(
  businesses: readonly NewDiscoveredBusiness[],
): string | null {
  return businesses[0]?.registeredAt.toISOString().slice(0, 10).replace(/-/g, "") ?? null;
}

function sortSeattleBusinessesByRegistrationDate(
  businesses: readonly NewDiscoveredBusiness[],
): readonly NewDiscoveredBusiness[] {
  return [...businesses].sort(
    (left, right) => right.registeredAt.getTime() - left.registeredAt.getTime(),
  );
}

function escapeSodaLiteral(value: string): string {
  return value.replace(/'/g, "''");
}
