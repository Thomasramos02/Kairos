import { Injectable } from "@nestjs/common";
import { NewDiscoveredBusiness } from "../models/business.model";
import {
  BusinessRegistryDiscoveryRequest,
  BusinessRegistryDiscoveryResult,
  BusinessRegistrySource,
} from "./business-registry-source";

const rhodeIslandExportListUrl =
  "https://business.sos.ri.gov/corp/WeeklyCorpExport/WeeklyCorpExportList.asp";
const rhodeIslandSourceName = "Rhode Island Weekly Export of New Entities";
const rhodeIslandSourceBaseUrl =
  "https://business.sos.ri.gov/corp/WeeklyCorpExport/";

type RhodeIslandWeeklyRow = {
  readonly corp_id?: string;
  readonly corp_name?: string;
  readonly incorp_dt?: string;
  readonly effect_dt?: string;
  readonly purpose?: string;
  readonly agent_city?: string;
};

@Injectable()
export class RhodeIslandWeeklyCorporationsClient implements BusinessRegistrySource {
  readonly sourceName = rhodeIslandSourceName;

  async discoverBusinesses(
    request: BusinessRegistryDiscoveryRequest,
  ): Promise<BusinessRegistryDiscoveryResult> {
    const exportUrl = await fetchLatestRhodeIslandExportUrl();
    const rows = await fetchRhodeIslandRows(exportUrl);
    const businesses = rows
      .flatMap(toRhodeIslandDiscoveredBusiness)
      .filter((business) => matchesIndustryFilter(business, request.industry));

    return {
      businesses,
      sourceCursor: resolveSourceCursor(businesses),
      sourceName: this.sourceName,
    };
  }
}

export async function fetchLatestRhodeIslandExportUrl(): Promise<string> {
  const response = await fetch(rhodeIslandExportListUrl, {
    headers: { accept: "text/html" },
  });

  if (!response.ok) {
    throw new Error(
      `Rhode Island export list failed: received ${response.status}; expected 2xx HTML response`,
    );
  }

  return resolveRhodeIslandExportUrl(await response.text());
}

export function resolveRhodeIslandExportUrl(html: string): string {
  const match = html.match(/href=["']([^"']*\.txt)["']/i);

  if (match?.[1] === undefined) {
    throw new Error(
      "Rhode Island export list invalid: received HTML without WeeklyCorpExportFiles link; expected weekly text export",
    );
  }

  return new URL(match[1], rhodeIslandSourceBaseUrl).toString();
}

async function fetchRhodeIslandRows(
  exportUrl: string,
): Promise<readonly RhodeIslandWeeklyRow[]> {
  const response = await fetch(exportUrl, { headers: { accept: "text/plain" } });

  if (!response.ok) {
    throw new Error(
      `Rhode Island export failed: received ${response.status} from "${exportUrl}"; expected 2xx tab-delimited text`,
    );
  }

  return parseRhodeIslandWeeklyExport(await response.text());
}

export function parseRhodeIslandWeeklyExport(
  text: string,
): readonly RhodeIslandWeeklyRow[] {
  const [headerLine, ...recordLines] = text.split(/\r?\n/).filter(Boolean);

  if (headerLine === undefined) {
    return [];
  }

  const headers = headerLine.split("\t").map((header) => header.trim());

  return recordLines.map((line) => toRhodeIslandRow(headers, line));
}

function toRhodeIslandRow(
  headers: readonly string[],
  line: string,
): RhodeIslandWeeklyRow {
  const values = line.split("\t");

  return Object.fromEntries(
    headers.map((header, index) => [header, values[index]?.trim()]),
  ) as RhodeIslandWeeklyRow;
}

function toRhodeIslandDiscoveredBusiness(
  row: RhodeIslandWeeklyRow,
): readonly NewDiscoveredBusiness[] {
  const legalName = row.corp_name?.trim();
  const sourceDocumentNumber = row.corp_id?.trim();
  const registeredAt = parseRhodeIslandDate(row.effect_dt || row.incorp_dt);

  if (!legalName || !sourceDocumentNumber || registeredAt === null) {
    return [];
  }

  return [{
    city: row.agent_city?.trim() || null,
    industry: row.purpose?.trim() || "unclassified",
    legalName,
    registeredAt,
    sourceDocumentNumber: `RI:${sourceDocumentNumber}`,
    sourceName: rhodeIslandSourceName,
    state: "RI",
  }];
}

function parseRhodeIslandDate(value: string | undefined): Date | null {
  if (value === undefined || value.trim().length === 0) {
    return null;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function matchesIndustryFilter(
  business: NewDiscoveredBusiness,
  industry: string,
): boolean {
  const normalizedIndustry = industry.trim().toLowerCase();

  return (
    normalizedIndustry.length === 0 ||
    normalizedIndustry === "all" ||
    business.industry.toLowerCase().includes(normalizedIndustry)
  );
}

function resolveSourceCursor(
  businesses: readonly NewDiscoveredBusiness[],
): string | null {
  return businesses[0]?.registeredAt.toISOString().slice(0, 10).replace(/-/g, "") ?? null;
}
