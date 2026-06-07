import { Injectable } from "@nestjs/common";
import { BusinessContactMethod } from "../../digital-signals/models/digital-signal.model";
import { DiscoveredBusiness } from "../../businesses/models/business.model";
import { ContactEnrichmentResult, ContactEnrichmentSource } from "../contact-enrichment-source";

const dbprSearchUrl = "https://www.myfloridalicense.com/portalsearches/VerifyLicensee";
const dbprSourceName = "Florida DBPR Public License Context";

@Injectable()
export class FloridaDbprLicenseContactClient implements ContactEnrichmentSource {
  readonly sourceName = dbprSourceName;

  supports(business: DiscoveredBusiness): boolean {
    return business.state === "FL" && isPriorityFloridaLicenseIndustry(business);
  }

  async enrichBusiness(
    business: DiscoveredBusiness,
  ): Promise<ContactEnrichmentResult | null> {
    const response = await fetch(buildFloridaDbprSearchUrl(business), {
      headers: { accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return null;
    }

    const contactMethods = parseFloridaDbprLicenseContext(
      await response.text(),
      business.legalName,
    );

    return contactMethods.length === 0
      ? null
      : { contactMethods, sourceName: this.sourceName };
  }
}

export function buildFloridaDbprSearchUrl(business: DiscoveredBusiness): string {
  const params = new URLSearchParams({
    Mode: "0",
    SID: "",
    name: business.legalName,
  });

  return `${dbprSearchUrl}?${params.toString()}`;
}

export function isPriorityFloridaLicenseIndustry(
  business: Pick<DiscoveredBusiness, "industry" | "legalName">,
): boolean {
  const text = `${business.industry} ${business.legalName}`.toLowerCase();

  return [
    "contractor",
    "construction",
    "real estate",
    "realty",
    "broker",
    "property",
  ].some((keyword) => text.includes(keyword));
}

export function parseFloridaDbprLicenseContext(
  html: string,
  legalName: string,
): readonly BusinessContactMethod[] {
  const text = normalizeLicenseText(html);

  if (!hasStrongNameMatch(text, legalName)) {
    return [];
  }

  return [
    ...extractLicenseNumbers(text),
    ...extractDbprPhones(text),
    ...extractDbprEmails(text),
  ].slice(0, 6);
}

function hasStrongNameMatch(text: string, legalName: string): boolean {
  const normalizedText = normalizeMatchText(text);
  const normalizedName = normalizeMatchText(legalName);

  return normalizedName.length > 5 && normalizedText.includes(normalizedName);
}

function extractLicenseNumbers(text: string): readonly BusinessContactMethod[] {
  const matches = text.match(/\b[A-Z]{1,4}\d{5,12}\b/g) ?? [];

  return [...new Set(matches)].slice(0, 2).map((licenseNumber) => ({
    confidenceScore: 80,
    label: "Public license context",
    source: "license" as const,
    type: "license" as const,
    value: licenseNumber,
  }));
}

function extractDbprPhones(text: string): readonly BusinessContactMethod[] {
  const matches = text.match(/\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g) ?? [];

  return [...new Set(matches)].slice(0, 2).map((phone) => ({
    confidenceScore: 82,
    label: "Public license contact",
    source: "license" as const,
    type: "phone" as const,
    value: normalizePhoneNumber(phone),
  }));
}

function extractDbprEmails(text: string): readonly BusinessContactMethod[] {
  const matches = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) ?? [];

  return [...new Set(matches.map((email) => email.toLowerCase()))].slice(0, 2).map((email) => ({
    confidenceScore: 82,
    label: "Public license contact",
    source: "license" as const,
    type: "email" as const,
    value: email,
  }));
}

function normalizeLicenseText(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeMatchText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function normalizePhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  return value.trim();
}
