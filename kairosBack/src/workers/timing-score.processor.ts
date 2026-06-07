import { Inject } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AlertsService } from '../modules/alerts/alerts.service';
import { buildTimingAlertRequests } from '../modules/alerts/services/timing-alert-request.builder';
import { BusinessesRepository } from '../modules/businesses/businesses.repository';
import { DiscoveredBusiness } from '../modules/businesses/models/business.model';
import { calculateBusinessAgeDays } from '../modules/businesses/services/business-age-calculator';
import { MarketTargetsRepository } from '../modules/market-targets/market-targets.repository';
import { TimingStageHistoryEntry } from '../modules/timing/models/timing-stage-history.model';
import { TimingScoreResult } from '../modules/timing/models/timing-score.model';
import { TimingHistoryRepository } from '../modules/timing/timing-history.repository';
import { TimingScoreService } from '../modules/timing/timing-score.service';
import { TimingScoresRepository } from '../modules/timing/timing-scores.repository';
import { rankTimingStage } from '../modules/timing/services/timing-stage-ranker';
import { WatchlistRepository } from '../modules/watchlist/watchlist.repository';
import { CalculateTimingScoreJobPayload } from '../queue/kairos-job-payload';
import { kairosQueueNames } from '../queue/kairos-queue-name';

const timingScoreVersion = 2;

@Processor(kairosQueueNames.timingScore)
export class TimingScoreProcessor extends WorkerHost {
  constructor(
    private readonly businessesRepository: BusinessesRepository,
    private readonly marketTargetsRepository: MarketTargetsRepository,
    private readonly watchlistRepository: WatchlistRepository,
    private readonly alertsService: AlertsService,
    private readonly timingScoreService: TimingScoreService,
    private readonly timingHistoryRepository: TimingHistoryRepository,
    private readonly timingScoresRepository: TimingScoresRepository,
  ) {
    super();
  }

  async process(job: Job<CalculateTimingScoreJobPayload>): Promise<void> {
    try {
      const business = await this.findBusiness(job.data.businessId);
      const signals = await this.businessesRepository.listSignalsByBusiness(
        business.id,
      );
      const ageDays = calculateBusinessAgeDays(business.registeredAt, new Date());
      const score = this.timingScoreService.calculate({
        ageDays,
        city: business.city,
        industry: business.industry,
        offeredService: job.data.offeredService,
        signals,
        sourceName: business.sourceName,
      });
      const calculatedAt = new Date();

      await this.timingScoresRepository.upsertTimingScore({
        businessId: business.id,
        calculatedAt,
        errorMessage: null,
        nextRefreshAt: calculateNextTimingRefresh(score, calculatedAt),
        offeredService: job.data.offeredService,
        reason: score.reason,
        scoreVersion: timingScoreVersion,
        signalsCount: signals.length,
        status: 'ready',
        timingRank: rankTimingStage(score.timingStage),
        timingScore: score.timingScore,
        timingStage: score.timingStage,
      });

      const stageHistoryEntry =
        await this.timingHistoryRepository.recordStageChange({
          businessId: business.id,
          offeredService: job.data.offeredService,
          nextStage: score.timingStage,
          timingScore: score.timingScore,
          reason: score.reason,
        });

      await this.createTimingAlerts(business, stageHistoryEntry);
    } catch (error) {
      await this.recordFailedTimingScore(job.data, error);
    }
  }

  private async createTimingAlerts(
    business: DiscoveredBusiness,
    stageHistoryEntry: TimingStageHistoryEntry | null,
  ): Promise<void> {
    const marketTargets =
      await this.marketTargetsRepository.listMarketTargets();
    const watchlistItems = await this.watchlistRepository.listByBusiness(
      business.id,
    );
    const alertRequests = buildTimingAlertRequests(
      business,
      stageHistoryEntry,
      marketTargets,
      watchlistItems,
    );

    await Promise.all(
      alertRequests.map((alertRequest) =>
        this.alertsService.createAlert(alertRequest),
      ),
    );
  }

  private async findBusiness(businessId: string): Promise<DiscoveredBusiness> {
    const business = await this.businessesRepository.findBusinessById(businessId);

    if (business === null) {
      throw new Error(
        `Business not found for timing score: received "${businessId}"; expected existing business id`,
      );
    }

    return business;
  }

  private async recordFailedTimingScore(
    payload: CalculateTimingScoreJobPayload,
    error: unknown,
  ): Promise<void> {
    await this.timingScoresRepository.upsertTimingScore({
      businessId: payload.businessId,
      calculatedAt: new Date(),
      errorMessage: formatError(error),
      nextRefreshAt: new Date(Date.now() + 60 * 60 * 1000),
      offeredService: payload.offeredService,
      reason: 'Timing score calculation failed',
      scoreVersion: timingScoreVersion,
      signalsCount: 0,
      status: 'failed',
      timingRank: 99,
      timingScore: 0,
      timingStage: 'old-lead',
    });
  }
}

function calculateNextTimingRefresh(
  score: TimingScoreResult,
  calculatedAt: Date,
): Date {
  const refreshMs = getRefreshIntervalMs(score.timingStage);
  return new Date(calculatedAt.getTime() + refreshMs);
}

function getRefreshIntervalMs(timingStage: TimingScoreResult['timingStage']): number {
  if (timingStage === 'best-window' || timingStage === 'warming-up') {
    return 12 * 60 * 60 * 1000;
  }

  if (timingStage === 'too-early') {
    return 24 * 60 * 60 * 1000;
  }

  if (timingStage === 'cooling-down') {
    return 48 * 60 * 60 * 1000;
  }

  return 7 * 24 * 60 * 60 * 1000;
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message.slice(0, 1000);
  }

  return `Unknown timing score error: received ${JSON.stringify(error)}`;
}
