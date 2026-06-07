import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { BusinessesRepository } from '../modules/businesses/businesses.repository';
import { DiscoveredBusiness } from '../modules/businesses/models/business.model';
import { DigitalSignalDetectorService } from '../modules/digital-signals/services/digital-signal-detector.service';
import { MarketTarget } from '../modules/market-targets/models/market-target.model';
import { MarketTargetsRepository } from '../modules/market-targets/market-targets.repository';
import { OfferedService, offeredServices } from '../domain/offered-service';
import { KairosJobDispatcherService } from '../queue/kairos-job-dispatcher.service';
import { DetectDigitalSignalsJobPayload } from '../queue/kairos-job-payload';
import { kairosQueueNames } from '../queue/kairos-queue-name';

@Processor(kairosQueueNames.digitalSignal)
export class DigitalSignalProcessor extends WorkerHost {
  constructor(
    private readonly businessesRepository: BusinessesRepository,
    private readonly digitalSignalDetector: DigitalSignalDetectorService,
    private readonly marketTargetsRepository: MarketTargetsRepository,
    private readonly jobDispatcher: KairosJobDispatcherService,
  ) {
    super();
  }

  async process(job: Job<DetectDigitalSignalsJobPayload>): Promise<void> {
    const business = await this.findBusiness(job.data.businessId);
    const signals = await this.digitalSignalDetector.detectSignals(business);

    for (const signal of signals) {
      await this.businessesRepository.createSignal({
        businessId: business.id,
        signalName: signal.signalName,
        sourceName: signal.sourceName,
        confidenceScore: signal.confidenceScore,
        metadata: signal.metadata,
      });
    }

    await this.dispatchTimingScoresForBusiness(business);
  }

  private async findBusiness(businessId: string) {
    const business = await this.businessesRepository.findBusinessById(businessId);

    if (business === null) {
      throw new Error(
        `Business not found for digital signal detection: received "${businessId}"; expected existing business id`,
      );
    }

    return business;
  }

  private async dispatchTimingScoresForBusiness(
    business: DiscoveredBusiness,
  ): Promise<void> {
    const marketTargets = await this.marketTargetsRepository.listMarketTargets();
    const offeredServices = resolveOfferedServicesForBusiness(
      business,
      marketTargets,
    );

    for (const offeredService of offeredServices) {
      await this.jobDispatcher.dispatchTimingScore({
        businessId: business.id,
        offeredService,
      });
    }
  }
}

function resolveOfferedServicesForBusiness(
  business: DiscoveredBusiness,
  marketTargets: readonly MarketTarget[],
): readonly OfferedService[] {
  if (marketTargets.length === 0) {
    return offeredServices;
  }

  const matchedOfferedServices = new Set(
    marketTargets
      .filter((marketTarget) => matchesMarketTarget(business, marketTarget))
      .map((marketTarget) => marketTarget.offeredService),
  );

  if (matchedOfferedServices.size === 0) {
    matchedOfferedServices.add('website-design-development');
  }

  return [...matchedOfferedServices];
}

function matchesMarketTarget(
  business: DiscoveredBusiness,
  marketTarget: MarketTarget,
): boolean {
  return (
    business.state === marketTarget.state.toUpperCase() &&
    matchesSourceIndustry(business.industry, marketTarget.industry) &&
    matchesCity(business.city, marketTarget.cityOrRegion)
  );
}

function matchesSourceIndustry(
  businessIndustry: string,
  marketTargetIndustry: string,
): boolean {
  if (businessIndustry === 'unclassified') {
    return true;
  }

  return businessIndustry === marketTargetIndustry;
}

function matchesCity(
  businessCity: string | null,
  cityOrRegion: string | null,
): boolean {
  if (cityOrRegion === null) {
    return true;
  }

  return businessCity === cityOrRegion;
}
