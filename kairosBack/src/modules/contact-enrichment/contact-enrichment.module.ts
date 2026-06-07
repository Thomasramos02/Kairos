import { Module } from "@nestjs/common";
import { BusinessModule } from "../businesses/business.module";
import { ContactEnrichmentService } from "./contact-enrichment.service";
import { ConnecticutRegistryContactClient } from "./sources/connecticut-registry-contact.client";
import { FloridaCountyBtrContactClient } from "./sources/florida-county-btr-contact.client";
import { FloridaDbprLicenseContactClient } from "./sources/florida-dbpr-license-contact.client";
import { FloridaSunbizDetailContactClient } from "./sources/florida-sunbiz-detail-contact.client";

@Module({
  imports: [BusinessModule],
  providers: [
    ContactEnrichmentService,
    ConnecticutRegistryContactClient,
    FloridaCountyBtrContactClient,
    FloridaDbprLicenseContactClient,
    FloridaSunbizDetailContactClient,
  ],
  exports: [ContactEnrichmentService],
})
export class ContactEnrichmentModule {}
