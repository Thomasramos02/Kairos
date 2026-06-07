import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { OutboxModule } from "../../outbox/outbox.module";
import { AuthModule } from "../auth/auth.module";
import { TimingModule } from "../timing/timing.module";
import { BusinessesController } from "./businesses.controller";
import { BusinessesQueryService } from "./businesses-query.service";
import { BusinessesRepository } from "./businesses.repository";
import { ConnecticutBusinessRegistryClient } from "./sources/connecticut-business-registry.client";
import { IowaBusinessEntityClient } from "./sources/iowa-business-entity.client";
import { OregonActiveBusinessesClient } from "./sources/oregon-active-businesses.client";
import { RhodeIslandWeeklyCorporationsClient } from "./sources/rhode-island-weekly-corporations.client";
import { SeattleBusinessLicenseClient } from "./sources/seattle-business-license.client";
import { ColoradoSosIndustryScraper } from "./enrichment/colorado-sos-industry.scraper";
import { ConnecticutSodaIndustryClient } from "./enrichment/connecticut-soda-industry.client";
import { CorporateIndustryEnrichmentService } from "./enrichment/corporate-industry-enrichment.service";
import { GeorgiaCorporationsIndustryScraper } from "./enrichment/georgia-corporations-industry.scraper";
import { RegistrySourceRunsRepository } from "./registry-source-runs.repository";
import { BusinessDiscoveryService } from "./services/business-discovery.service";
import { BusinessRegistrySourceResolver } from "./sources/business-registry-source.resolver";

@Module({
  imports: [AuthModule, DatabaseModule, OutboxModule, TimingModule],
  controllers: [BusinessesController],
  providers: [
    BusinessesRepository,
    BusinessesQueryService,
    ColoradoSosIndustryScraper,
    ConnecticutSodaIndustryClient,
    CorporateIndustryEnrichmentService,
    GeorgiaCorporationsIndustryScraper,
    RegistrySourceRunsRepository,
    BusinessDiscoveryService,
    BusinessRegistrySourceResolver,
    ConnecticutBusinessRegistryClient,
    IowaBusinessEntityClient,
    OregonActiveBusinessesClient,
    RhodeIslandWeeklyCorporationsClient,
    SeattleBusinessLicenseClient,
  ],
  exports: [
    BusinessesRepository,
    BusinessesQueryService,
    CorporateIndustryEnrichmentService,
    RegistrySourceRunsRepository,
    BusinessDiscoveryService,
    BusinessRegistrySourceResolver,
  ],
})
export class BusinessModule {}
