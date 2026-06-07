export type CorporateIndustryState = "CT" | "GA" | "CO" | "FL";

export type CorporateIndustryEnrichment = {
  readonly state: CorporateIndustryState;
  readonly company_name: string;
  readonly naics_code: string;
  readonly industry: string;
  readonly confidence_score: number;
};

export type CorporateIndustryEnrichmentRequest = {
  readonly state?: string;
  readonly companyId?: string;
};

export type CorporateIndustryEnrichmentSource = {
  enrichByCompanyId(companyId: string): Promise<CorporateIndustryEnrichment>;
};
