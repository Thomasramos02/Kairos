import { Injectable } from "@nestjs/common";
import {
  CorporateIndustryEnrichment,
  CorporateIndustryEnrichmentSource,
} from "./corporate-industry-enrichment.model";
import { extractFirstSixDigitCode, extractHtmlField } from "./html-field-extractor";

@Injectable()
export class ColoradoSosIndustryScraper
  implements CorporateIndustryEnrichmentSource
{
  async enrichByCompanyId(
    companyId: string,
  ): Promise<CorporateIndustryEnrichment> {
    const html = await fetchColoradoBusinessHtml(companyId);

    return parseColoradoSosIndustry(html, companyId);
  }
}

export function buildColoradoBusinessDetailUrl(companyId: string): string {
  const params = new URLSearchParams({ fileId: companyId.trim() });

  return `https://sos.state.co.us/biz/BusinessEntityDetail.do?${params.toString()}`;
}

export function parseColoradoSosIndustry(
  html: string,
  companyId: string,
): CorporateIndustryEnrichment {
  const companyName = requireColoradoField(html, ["Name", "Entity Name"], companyId);
  const naicsValue = extractHtmlField(html, ["NAICS Code", "NAICS"]);
  const businessPurpose = extractHtmlField(html, ["Business Purpose", "Purpose"]);
  const naicsCode = extractFirstSixDigitCode(naicsValue);
  const industry = businessPurpose ?? naicsValue ?? "";

  if (industry.length === 0) {
    throw new Error(
      `Invalid Colorado detail page: received no Business Purpose or NAICS for "${companyId}"; expected structured purpose or NAICS field`,
    );
  }

  return {
    state: "CO",
    company_name: companyName,
    naics_code: naicsCode,
    industry,
    confidence_score: 1.0,
  };
}

async function fetchColoradoBusinessHtml(companyId: string): Promise<string> {
  const response = await fetch(buildColoradoBusinessDetailUrl(companyId), {
    headers: { accept: "text/html" },
  });

  if (!response.ok) {
    throw new Error(
      `Colorado SOS request failed: received ${response.status} for "${companyId}"; expected 2xx HTML response`,
    );
  }

  return await response.text();
}

function requireColoradoField(
  html: string,
  fieldLabels: readonly string[],
  companyId: string,
): string {
  const value = extractHtmlField(html, fieldLabels);

  if (value === null || value.length === 0) {
    throw new Error(
      `Invalid Colorado detail page: received missing "${fieldLabels[0]}" for "${companyId}"; expected structured HTML field`,
    );
  }

  return value;
}
