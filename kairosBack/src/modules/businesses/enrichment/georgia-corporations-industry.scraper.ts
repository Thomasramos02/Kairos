import { Injectable } from "@nestjs/common";
import {
  CorporateIndustryEnrichment,
  CorporateIndustryEnrichmentSource,
} from "./corporate-industry-enrichment.model";
import { extractFirstSixDigitCode, extractHtmlField } from "./html-field-extractor";

@Injectable()
export class GeorgiaCorporationsIndustryScraper
  implements CorporateIndustryEnrichmentSource
{
  async enrichByCompanyId(
    companyId: string,
  ): Promise<CorporateIndustryEnrichment> {
    const html = await fetchGeorgiaBusinessHtml(companyId);

    return parseGeorgiaCorporationIndustry(html, companyId);
  }
}

export function buildGeorgiaBusinessDetailUrl(companyId: string): string {
  const params = new URLSearchParams({
    businessId: companyId.trim(),
    fromSearch: "True",
  });

  return `https://ecorp.sos.ga.gov/BusinessSearch/BusinessInformation?${params.toString()}`;
}

export function parseGeorgiaCorporationIndustry(
  html: string,
  companyId: string,
): CorporateIndustryEnrichment {
  const companyName = requireGeorgiaField(html, ["Business Name", "Entity Name"], companyId);
  const rawNaicsCode = extractHtmlField(html, ["NAICS Code", "NAICS"]);
  const naicsCode = extractFirstSixDigitCode(rawNaicsCode);
  const industry = requireGeorgiaField(html, ["NAICS Description"], companyId);

  if (naicsCode.length === 0) {
    throw new Error(
      `Invalid Georgia NAICS Code: received "${rawNaicsCode ?? ""}" for "${companyId}"; expected 6 digit NAICS code`,
    );
  }

  return {
    state: "GA",
    company_name: companyName,
    naics_code: naicsCode,
    industry,
    confidence_score: 1.0,
  };
}

async function fetchGeorgiaBusinessHtml(companyId: string): Promise<string> {
  const response = await fetch(buildGeorgiaBusinessDetailUrl(companyId), {
    headers: { accept: "text/html" },
  });

  if (!response.ok) {
    throw new Error(
      `Georgia corporations request failed: received ${response.status} for "${companyId}"; expected 2xx HTML response`,
    );
  }

  return await response.text();
}

function requireGeorgiaField(
  html: string,
  fieldLabels: readonly string[],
  companyId: string,
): string {
  const value = extractHtmlField(html, fieldLabels);

  if (value === null || value.length === 0) {
    throw new Error(
      `Invalid Georgia detail page: received missing "${fieldLabels[0]}" for "${companyId}"; expected structured HTML field`,
    );
  }

  return value;
}
