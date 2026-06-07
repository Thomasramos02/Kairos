import { BadRequestException, Injectable } from "@nestjs/common";
import { BusinessesRepository } from "../businesses.repository";
import { ColoradoSosIndustryScraper } from "./colorado-sos-industry.scraper";
import { ConnecticutSodaIndustryClient } from "./connecticut-soda-industry.client";
import {
  CorporateIndustryEnrichment,
  CorporateIndustryEnrichmentRequest,
  CorporateIndustryEnrichmentSource,
  CorporateIndustryState,
} from "./corporate-industry-enrichment.model";
import { GeorgiaCorporationsIndustryScraper } from "./georgia-corporations-industry.scraper";

@Injectable()
export class CorporateIndustryEnrichmentService {
  constructor(
    private readonly connecticutClient: ConnecticutSodaIndustryClient,
    private readonly georgiaScraper: GeorgiaCorporationsIndustryScraper,
    private readonly coloradoScraper: ColoradoSosIndustryScraper,
    private readonly businessesRepository: BusinessesRepository,
  ) {}

  async enrichByCompanyId(
    request: CorporateIndustryEnrichmentRequest,
  ): Promise<CorporateIndustryEnrichment> {
    const state = parseCorporateIndustryState(request.state);
    const companyId = parseCompanyId(request.companyId);

    if (state === "FL") {
      return await this.enrichFloridaBusiness(companyId);
    }

    return await this.resolveSource(state).enrichByCompanyId(companyId);
  }

  private async enrichFloridaBusiness(
    companyId: string,
  ): Promise<CorporateIndustryEnrichment> {
    const business =
      await this.businessesRepository.findBusinessBySourceDocumentNumber(companyId);

    if (business === null) {
      throw new BadRequestException(
        `Invalid Florida companyId: received "${companyId}"; expected existing Sunbiz source document number`,
      );
    }

    return {
      state: "FL",
      company_name: business.legalName,
      naics_code: "",
      industry: business.industry,
      confidence_score: business.industry === "unclassified" ? 0.2 : 0.7,
    };
  }

  private resolveSource(
    state: Exclude<CorporateIndustryState, "FL">,
  ): CorporateIndustryEnrichmentSource {
    if (state === "CT") {
      return this.connecticutClient;
    }

    if (state === "GA") {
      return this.georgiaScraper;
    }

    return this.coloradoScraper;
  }
}

function parseCorporateIndustryState(
  state: string | undefined,
): CorporateIndustryState {
  const normalizedState = state?.trim().toUpperCase() ?? "";

  if (["CT", "GA", "CO", "FL"].includes(normalizedState)) {
    return normalizedState as CorporateIndustryState;
  }

  throw new BadRequestException(
    `Invalid industry enrichment state: received "${state ?? ""}"; expected CT, GA, CO or FL`,
  );
}

function parseCompanyId(companyId: string | undefined): string {
  const normalizedCompanyId = companyId?.trim() ?? "";

  if (normalizedCompanyId.length > 0) {
    return normalizedCompanyId;
  }

  throw new BadRequestException(
    `Invalid companyId: received "${companyId ?? ""}"; expected non-empty registry identifier`,
  );
}
