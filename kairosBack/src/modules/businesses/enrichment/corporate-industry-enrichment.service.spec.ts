import { BadRequestException } from "@nestjs/common";
import { BusinessesRepository } from "../businesses.repository";
import { ColoradoSosIndustryScraper } from "./colorado-sos-industry.scraper";
import { ConnecticutSodaIndustryClient } from "./connecticut-soda-industry.client";
import { CorporateIndustryEnrichmentService } from "./corporate-industry-enrichment.service";
import { GeorgiaCorporationsIndustryScraper } from "./georgia-corporations-industry.scraper";

class FakeConnecticutClient {
  async enrichByCompanyId(companyId: string) {
    return {
      state: "CT" as const,
      company_name: `CT ${companyId}`,
      naics_code: "541511",
      industry: "Custom Computer Programming Services",
      confidence_score: 1.0 as const,
    };
  }
}

class FakeGeorgiaScraper {
  async enrichByCompanyId(companyId: string) {
    return {
      state: "GA" as const,
      company_name: `GA ${companyId}`,
      naics_code: "722511",
      industry: "Full-Service Restaurants",
      confidence_score: 1.0 as const,
    };
  }
}

class FakeColoradoScraper {
  async enrichByCompanyId(companyId: string) {
    return {
      state: "CO" as const,
      company_name: `CO ${companyId}`,
      naics_code: "",
      industry: "Business purpose",
      confidence_score: 1.0 as const,
    };
  }
}

class FakeBusinessesRepository {
  async findBusinessBySourceDocumentNumber(companyId: string) {
    if (companyId !== "L26000000001") {
      return null;
    }

    return {
      id: "biz_1",
      sourceDocumentNumber: companyId,
      legalName: "SUNRISE BAKERY LLC",
      state: "FL",
      city: "MIAMI",
      industry: "Food & Beverage",
      archivedAt: null,
      lifecycleStage: "candidate" as const,
      registeredAt: new Date("2026-06-03T00:00:00.000Z"),
      sourceName: "Florida Division of Corporations Daily Corporate Filing",
    };
  }
}

describe("CorporateIndustryEnrichmentService", () => {
  it("routes supported states to their source clients", async () => {
    const service = createService();

    await expect(
      service.enrichByCompanyId({ state: "ct", companyId: "1234567" }),
    ).resolves.toMatchObject({ state: "CT", company_name: "CT 1234567" });
    await expect(
      service.enrichByCompanyId({ state: "GA", companyId: "981488" }),
    ).resolves.toMatchObject({ state: "GA", company_name: "GA 981488" });
    await expect(
      service.enrichByCompanyId({ state: "CO", companyId: "20241052931" }),
    ).resolves.toMatchObject({
      state: "CO",
      company_name: "CO 20241052931",
    });
  });

  it("returns local Florida classification from stored Sunbiz businesses", async () => {
    const service = createService();

    await expect(
      service.enrichByCompanyId({ state: "FL", companyId: "L26000000001" }),
    ).resolves.toMatchObject({
      state: "FL",
      company_name: "SUNRISE BAKERY LLC",
      industry: "Food & Beverage",
      confidence_score: 0.7,
    });
  });

  it("rejects unknown Florida registry identifiers with context", async () => {
    const service = createService();

    await expect(
      service.enrichByCompanyId({ state: "FL", companyId: "missing" }),
    ).rejects.toThrow(BadRequestException);
  });
});

function createService(): CorporateIndustryEnrichmentService {
  return new CorporateIndustryEnrichmentService(
    new FakeConnecticutClient() as unknown as ConnecticutSodaIndustryClient,
    new FakeGeorgiaScraper() as unknown as GeorgiaCorporationsIndustryScraper,
    new FakeColoradoScraper() as unknown as ColoradoSosIndustryScraper,
    new FakeBusinessesRepository() as unknown as BusinessesRepository,
  );
}
