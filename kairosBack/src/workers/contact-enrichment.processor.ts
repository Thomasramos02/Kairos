import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { BusinessesRepository } from "../modules/businesses/businesses.repository";
import { DiscoveredBusiness } from "../modules/businesses/models/business.model";
import { ContactEnrichmentService } from "../modules/contact-enrichment/contact-enrichment.service";
import { EnrichBusinessContactsJobPayload } from "../queue/kairos-job-payload";
import { kairosQueueNames } from "../queue/kairos-queue-name";

@Processor(kairosQueueNames.contactEnrichment)
export class ContactEnrichmentProcessor extends WorkerHost {
  constructor(
    private readonly businessesRepository: BusinessesRepository,
    private readonly contactEnrichmentService: ContactEnrichmentService,
  ) {
    super();
  }

  async process(job: Job<EnrichBusinessContactsJobPayload>): Promise<void> {
    const business = await this.findBusiness(job.data.businessId);
    const results = await this.contactEnrichmentService.enrichBusiness(business);

    for (const result of results) {
      const hasSignal = await this.businessesRepository.hasSignalByNameAndSource(
        business.id,
        "business-contact-detected",
        result.sourceName,
      );

      if (hasSignal) {
        continue;
      }

      await this.businessesRepository.createSignal({
        businessId: business.id,
        confidenceScore: resolveContactSignalConfidence(result.contactMethods),
        metadata: { contactMethods: result.contactMethods },
        signalName: "business-contact-detected",
        sourceName: result.sourceName,
      });
    }
  }

  private async findBusiness(businessId: string): Promise<DiscoveredBusiness> {
    const business = await this.businessesRepository.findBusinessById(businessId);

    if (business === null) {
      throw new Error(
        `Business not found for contact enrichment: received "${businessId}"; expected existing business id`,
      );
    }

    return business;
  }
}

function resolveContactSignalConfidence(
  contactMethods: readonly { readonly confidenceScore: number }[],
): number {
  const topConfidence = Math.max(
    ...contactMethods.map((contact) => contact.confidenceScore),
  );

  return Math.min(95, topConfidence + contactMethods.length * 2);
}
