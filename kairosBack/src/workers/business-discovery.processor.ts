import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { BusinessesRepository } from "../modules/businesses/businesses.repository";
import {
  DiscoveredBusiness,
  NewDiscoveredBusiness,
} from "../modules/businesses/models/business.model";
import { RegistrySourceRunsRepository } from "../modules/businesses/registry-source-runs.repository";
import { BusinessDiscoveryService } from "../modules/businesses/services/business-discovery.service";
import { decideBusinessDiscoveryPolling } from "../modules/businesses/services/business-discovery-polling.policy";
import { BusinessRegistrySourceResolver } from "../modules/businesses/sources/business-registry-source.resolver";
import { DiscoverBusinessesJobPayload } from "../queue/kairos-job-payload";
import { KairosJobDispatcherService } from "../queue/kairos-job-dispatcher.service";
import { kairosQueueNames } from "../queue/kairos-queue-name";
import { buildInitialTimingScoreInputs } from "../modules/timing/services/initial-timing-score.builder";
import { TimingScoresRepository } from "../modules/timing/timing-scores.repository";

@Processor(kairosQueueNames.businessDiscovery)
export class BusinessDiscoveryProcessor extends WorkerHost {
  constructor(
    private readonly businessesRepository: BusinessesRepository,
    private readonly registrySourceRunsRepository: RegistrySourceRunsRepository,
    private readonly businessDiscoveryService: BusinessDiscoveryService,
    private readonly sourceResolver: BusinessRegistrySourceResolver,
    private readonly jobDispatcher: KairosJobDispatcherService,
    private readonly timingScoresRepository: TimingScoresRepository,
  ) {
    super();
  }

  async process(job: Job<DiscoverBusinessesJobPayload>): Promise<void> {
    const source = this.sourceResolver.resolveSource(job.data.state);
    const registrySourceRun = await this.registrySourceRunsRepository.startRun({
      state: job.data.state.toUpperCase(),
      sourceName: source.sourceName,
    });

    try {
      const discoveryResult = await source.discoverBusinesses(job.data);
      const recordsCreated = await this.persistDiscoveredBusinesses(
        discoveryResult.businesses,
      );

      await this.registrySourceRunsRepository.completeRun(
        registrySourceRun.id,
        {
          sourceCursor: discoveryResult.sourceCursor,
          recordsFound: discoveryResult.businesses.length,
          recordsCreated,
        },
      );
      const pollingDecision = decideBusinessDiscoveryPolling(
        discoveryResult.sourceCursor,
        new Date(),
      );

      await this.jobDispatcher.dispatchBusinessDiscoveryWithDelay(
        job.data,
        pollingDecision.delayMs,
      );
    } catch (error) {
      await this.registrySourceRunsRepository.failRun(
        registrySourceRun.id,
        error,
      );
      await this.jobDispatcher.dispatchBusinessDiscoveryWithDelay(
        job.data,
        60 * 60 * 1000,
      );
      throw error;
    }
  }

  private async persistDiscoveredBusinesses(
    discoveredBusinesses: readonly NewDiscoveredBusiness[],
  ): Promise<number> {
    let recordsCreated = 0;

    for (const discoveredBusiness of discoveredBusinesses) {
      const creationResult =
        await this.businessesRepository.createBusinessWithOutboxIfMissing(
          discoveredBusiness,
          (business) =>
            this.businessDiscoveryService.createDiscoveredEvent(business),
        );

      await this.createInitialTimingScoresIfMissing(creationResult.business);
      await this.createRegistryContactSignalIfAvailable(
        creationResult.business.id,
        discoveredBusiness,
      );

      if (creationResult.wasCreated) {
        recordsCreated += 1;
      }
    }

    return recordsCreated;
  }

  private async createInitialTimingScoresIfMissing(
    business: DiscoveredBusiness,
  ): Promise<void> {
    const hasTimingScore =
      await this.timingScoresRepository.hasAnyTimingScoreForBusiness(business.id);

    if (hasTimingScore) {
      return;
    }

    const calculatedAt = new Date();

    for (const input of buildInitialTimingScoreInputs(business, calculatedAt)) {
      await this.timingScoresRepository.upsertTimingScore(input);
    }
  }

  private async createRegistryContactSignalIfAvailable(
    businessId: string,
    discoveredBusiness: NewDiscoveredBusiness,
  ): Promise<void> {
    const contactMethods = discoveredBusiness.contactMethods ?? [];

    if (contactMethods.length === 0) {
      return;
    }

    const hasContactSignal = await this.businessesRepository.hasSignalByName(
      businessId,
      "business-contact-detected",
    );

    if (hasContactSignal) {
      return;
    }

    await this.businessesRepository.createSignal({
      businessId,
      confidenceScore: resolveRegistryContactConfidence(contactMethods),
      metadata: { contactMethods },
      signalName: "business-contact-detected",
      sourceName: discoveredBusiness.sourceName,
    });
  }
}

function resolveRegistryContactConfidence(
  contactMethods: NonNullable<NewDiscoveredBusiness["contactMethods"]>,
): number {
  const topConfidence = Math.max(
    ...contactMethods.map((contact) => contact.confidenceScore),
  );

  return Math.min(90, topConfidence + contactMethods.length * 2);
}
