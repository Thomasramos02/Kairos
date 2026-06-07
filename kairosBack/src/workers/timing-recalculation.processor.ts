import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Job } from "bullmq";
import { BusinessesRepository } from "../modules/businesses/businesses.repository";
import { DiscoveredBusiness } from "../modules/businesses/models/business.model";
import { MarketTargetsRepository } from "../modules/market-targets/market-targets.repository";
import { buildTimingRecalculationRequests } from "../modules/timing/services/timing-recalculation-request.builder";
import { RecalculateTimingStagesJobPayload } from "../queue/kairos-job-payload";
import { KairosJobDispatcherService } from "../queue/kairos-job-dispatcher.service";
import { kairosQueueNames } from "../queue/kairos-queue-name";

const timingRecalculationBatchSize = 8;

@Injectable()
@Processor(kairosQueueNames.timingRecalculation)
export class TimingRecalculationProcessor extends WorkerHost {
  constructor(
    private readonly businessesRepository: BusinessesRepository,
    private readonly marketTargetsRepository: MarketTargetsRepository,
    private readonly jobDispatcher: KairosJobDispatcherService,
  ) {
    super();
  }

  async process(job: Job<RecalculateTimingStagesJobPayload>): Promise<void> {
    const businesses = await this.listBusinesses(job.data);
    const marketTargets =
      await this.marketTargetsRepository.listMarketTargets();
    const requests = buildTimingRecalculationRequests(
      businesses,
      marketTargets,
    );

    await dispatchRequestsInBatches(
      requests,
      timingRecalculationBatchSize,
      (request) => this.jobDispatcher.dispatchTimingScore(request),
    );
    await this.businessesRepository.deleteExpiredOldLeadBusinesses(new Date());
  }

  private async listBusinesses(
    payload: RecalculateTimingStagesJobPayload,
  ): Promise<readonly DiscoveredBusiness[]> {
    const businesses = await this.businessesRepository.listMonitorableBusinesses();

    if (payload.state === undefined) {
      return businesses;
    }

    return businesses.filter(
      (business) => business.state === payload.state?.toUpperCase(),
    );
  }
}

async function dispatchRequestsInBatches<TRequest>(
  requests: readonly TRequest[],
  batchSize: number,
  dispatchRequest: (request: TRequest) => Promise<unknown>,
): Promise<void> {
  for (let index = 0; index < requests.length; index += batchSize) {
    const batch = requests.slice(index, index + batchSize);

    await Promise.all(batch.map((request) => dispatchRequest(request)));
  }
}
