import { Injectable } from "@nestjs/common";
import { BusinessContactMethod } from "../../digital-signals/models/digital-signal.model";
import { DiscoveredBusiness } from "../../businesses/models/business.model";
import { ContactEnrichmentResult, ContactEnrichmentSource } from "../contact-enrichment-source";

const sunbizDocumentSearchUrl =
  "https://search.sunbiz.org/Inquiry/CorporationSearch/ByDocumentNumber";
const sunbizDetailSourceName = "Florida Sunbiz Detail Public Registry Context";
const sunbizSectionHeadings = [
  "Principal Address",
  "Mailing Address",
  "Registered Agent Name & Address",
  "Authorized Person(s) Detail",
  "Officer/Director Detail",
  "Annual Reports",
  "Document Images",
  "Filing Information",
] as const;

@Injectable()
export class FloridaSunbizDetailContactClient implements ContactEnrichmentSource {
  readonly sourceName = sunbizDetailSourceName;

  supports(business: DiscoveredBusiness): boolean {
    return business.state === "FL" && business.sourceDocumentNumber !== null;
  }

  async enrichBusiness(
    business: DiscoveredBusiness,
  ): Promise<ContactEnrichmentResult | null> {
    const response = await fetch(buildFloridaSunbizDetailUrl(business.sourceDocumentNumber), {
      headers: { accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(
        `Florida Sunbiz detail request failed: received ${response.status}; expected 2xx HTML response`,
      );
    }

    const contactMethods = parseFloridaSunbizPublicContext(await response.text());

    return contactMethods.length === 0
      ? null
      : { contactMethods, sourceName: this.sourceName };
  }
}

export function buildFloridaSunbizDetailUrl(documentNumber: string | null): string {
  if (documentNumber === null || documentNumber.trim().length === 0) {
    throw new Error(
      `Invalid Florida document number: received "${documentNumber}"; expected non-empty document number`,
    );
  }

  const params = new URLSearchParams({
    searchTerm: documentNumber.trim(),
  });

  return `${sunbizDocumentSearchUrl}?${params.toString()}`;
}

export function parseFloridaSunbizPublicContext(
  html: string,
): readonly BusinessContactMethod[] {
  const text = normalizeSunbizText(html);

  return [
    ...extractSunbizContext(text, "Principal Address", "address"),
    ...extractSunbizContext(text, "Mailing Address", "address"),
    ...extractSunbizContext(text, "Registered Agent Name & Address", "agent"),
    ...extractSunbizContext(text, "Authorized Person(s) Detail", "officer"),
    ...extractSunbizContext(text, "Officer/Director Detail", "officer"),
  ].slice(0, 8);
}

function extractSunbizContext(
  text: string,
  heading: string,
  type: "address" | "agent" | "officer",
): readonly BusinessContactMethod[] {
  const value = readSectionValue(text, heading);

  if (value === null) {
    return [];
  }

  return [{
    confidenceScore: type === "address" ? 90 : 85,
    label: "Public registry context",
    source: "registry",
    type,
    value,
  }];
}

function readSectionValue(text: string, heading: string): string | null {
  const startIndex = text.indexOf(heading);

  if (startIndex === -1) {
    return null;
  }

  const valueStart = startIndex + heading.length;
  const nextHeadingIndex = findNextHeadingIndex(text, valueStart, heading);
  const value = text
    .slice(valueStart, nextHeadingIndex)
    .replace(/\s+/g, " ")
    .trim();

  return value === undefined || value.length === 0 ? null : value.slice(0, 240);
}

function findNextHeadingIndex(
  text: string,
  valueStart: number,
  currentHeading: string,
): number {
  const nextIndexes = sunbizSectionHeadings
    .filter((heading) => heading !== currentHeading)
    .map((heading) => text.indexOf(heading, valueStart))
    .filter((index) => index >= 0);

  return nextIndexes.length === 0 ? text.length : Math.min(...nextIndexes);
}

function normalizeSunbizText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}
