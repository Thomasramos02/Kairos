import { Injectable } from "@nestjs/common";
import { readKairosEnvironment } from "../../../config/kairos-environment";
import { NewDiscoveredBusiness } from "../models/business.model";
import {
  BusinessRegistryDiscoveryRequest,
  BusinessRegistryDiscoveryResult,
  BusinessRegistrySource,
} from "./business-registry-source";

const iowaSourceName = "Iowa Secretary of State Business Entity Data API";
const iowaUpdatesSinceUrl = "https://api.sos.iowa.gov/BusinessEntity/updatessince/7";
const iowaEmptyCursor = new Date().toISOString().slice(0, 10).replace(/-/g, "");

type IowaBusinessEntityRow = {
  readonly id?: number | string;
  readonly businessEntityId?: number | string;
  readonly businessName?: string;
  readonly legalName?: string;
  readonly name?: string;
  readonly effectiveDate?: string;
  readonly registrationDate?: string;
  readonly createdDate?: string;
  readonly city?: string;
  readonly homeOfficeCity?: string;
  readonly entityType?: string;
  readonly naicsDescription?: string;
};

@Injectable()
export class IowaBusinessEntityClient implements BusinessRegistrySource {
  readonly sourceName = iowaSourceName;
  private readonly environment = readKairosEnvironment(process.env);

  async discoverBusinesses(
    request: BusinessRegistryDiscoveryRequest,
  ): Promise<BusinessRegistryDiscoveryResult> {
    if (this.environment.iowaSosAuthorization === undefined) {
      return {
        businesses: [],
        sourceCursor: iowaEmptyCursor,
        sourceName: this.sourceName,
      };
    }

    const rows = await fetchIowaRows(this.environment.iowaSosAuthorization);
    const businesses = rows
      .flatMap(toIowaDiscoveredBusiness)
      .filter((business) => matchesIndustryFilter(business, request.industry));

    return {
      businesses,
      sourceCursor: resolveIowaSourceCursor(businesses),
      sourceName: this.sourceName,
    };
  }
}

async function fetchIowaRows(
  authorization: string,
): Promise<readonly IowaBusinessEntityRow[]> {
  const response = await fetch(iowaUpdatesSinceUrl, {
    headers: { accept: "application/json", Authorization: authorization },
  });

  if (!response.ok) {
    throw new Error(
      `Iowa business entity request failed: received ${response.status}; expected 2xx JSON response with configured IOWA_SOS_AUTHORIZATION`,
    );
  }

  const body = await response.json();
  return Array.isArray(body) ? body as readonly IowaBusinessEntityRow[] : [];
}

function toIowaDiscoveredBusiness(
  row: IowaBusinessEntityRow,
): readonly NewDiscoveredBusiness[] {
  const legalName = resolveIowaName(row);
  const sourceDocumentNumber = String(row.businessEntityId ?? row.id ?? "").trim();
  const registeredAt = parseIowaDate(row.effectiveDate ?? row.registrationDate ?? row.createdDate);

  if (!legalName || !sourceDocumentNumber || registeredAt === null) {
    return [];
  }

  return [{
    city: row.city?.trim() || row.homeOfficeCity?.trim() || null,
    industry: row.naicsDescription?.trim() || row.entityType?.trim() || "unclassified",
    legalName,
    registeredAt,
    sourceDocumentNumber: `IA:${sourceDocumentNumber}`,
    sourceName: iowaSourceName,
    state: "IA",
  }];
}

function resolveIowaName(row: IowaBusinessEntityRow): string {
  return (row.businessName ?? row.legalName ?? row.name ?? "").trim();
}

function parseIowaDate(value: string | undefined): Date | null {
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

function resolveIowaSourceCursor(
  businesses: readonly NewDiscoveredBusiness[],
): string | null {
  return businesses[0]?.registeredAt.toISOString().slice(0, 10).replace(/-/g, "") ?? iowaEmptyCursor;
}
