import { randomUUID } from "crypto";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Job, Queue } from "bullmq";
import {
  CalculateTimingScoreJobPayload,
  DetectDigitalSignalsJobPayload,
  DiscoverBusinessesJobPayload,
  EnrichBusinessContactsJobPayload,
  GenerateExportJobPayload,
  RecalculateTimingStagesJobPayload,
  SendAlertJobPayload,
} from "./kairos-job-payload";
import { kairosJobNames, kairosQueueNames } from "./kairos-queue-name";
import { buildBusinessDiscoveryJobId } from "../modules/businesses/services/business-discovery-polling.policy";

@Injectable()
export class KairosJobDispatcherService {
  constructor(
    @InjectQueue(kairosQueueNames.businessDiscovery)
    private readonly businessDiscoveryQueue: Queue<DiscoverBusinessesJobPayload>,
    @InjectQueue(kairosQueueNames.digitalSignal)
    private readonly digitalSignalQueue: Queue<DetectDigitalSignalsJobPayload>,
    @InjectQueue(kairosQueueNames.contactEnrichment)
    private readonly contactEnrichmentQueue: Queue<EnrichBusinessContactsJobPayload>,
    @InjectQueue(kairosQueueNames.timingRecalculation)
    private readonly timingRecalculationQueue: Queue<RecalculateTimingStagesJobPayload>,
    @InjectQueue(kairosQueueNames.timingScore)
    private readonly timingScoreQueue: Queue<CalculateTimingScoreJobPayload>,
    @InjectQueue(kairosQueueNames.alert)
    private readonly alertQueue: Queue<SendAlertJobPayload>,
    @InjectQueue(kairosQueueNames.export)
    private readonly exportQueue: Queue<GenerateExportJobPayload>,
  ) {}

  async dispatchBusinessDiscovery(
    payload: DiscoverBusinessesJobPayload,
  ): Promise<void> {
    await this.dispatchBusinessDiscoveryJob(payload, 0, {
      replacePending: true,
    });
  }

  async dispatchBusinessDiscoveryWithDelay(
    payload: DiscoverBusinessesJobPayload,
    delayMs: number,
  ): Promise<void> {
    await this.dispatchBusinessDiscoveryJob(payload, delayMs, {
      replacePending: false,
    });
  }

  private async dispatchBusinessDiscoveryJob(
    payload: DiscoverBusinessesJobPayload,
    delayMs: number,
    options: { readonly replacePending: boolean },
  ): Promise<void> {
    const existingJob = await this.findPendingBusinessDiscoveryJob(payload);

    if (existingJob !== null && !options.replacePending) {
      return;
    }

    if (existingJob !== null) {
      const state = await existingJob.getState();

      if (state === "waiting" || state === "delayed") {
        try {
          await existingJob.remove();
        } catch (error) {
          console.log(`Job ${existingJob.id} já foi pego por outro worker. Ignorando replace.`);
          return;
        }
      } else {
        console.log(`Job ${existingJob.id} está ${state}. Não será removido.`);
        return;
      }
    }

    await this.businessDiscoveryQueue.add(kairosJobNames.discoverBusinesses, payload, {
      delay: delayMs,
      jobId: buildBusinessDiscoveryJobId(
        payload.state,
        payload.industry,
        randomUUID(),
      ),
      removeOnComplete: true,
      removeOnFail: true,
    });
  }

  async dispatchDigitalSignals(
    payload: DetectDigitalSignalsJobPayload,
  ): Promise<void> {
    await this.digitalSignalQueue.add(
      kairosJobNames.detectDigitalSignals,
      payload,
    );
  }

  async dispatchContactEnrichment(
    payload: EnrichBusinessContactsJobPayload,
  ): Promise<void> {
    await this.contactEnrichmentQueue.add(
      kairosJobNames.enrichBusinessContacts,
      payload,
    );
  }

  async dispatchTimingRecalculation(
    payload: RecalculateTimingStagesJobPayload,
  ): Promise<void> {
    await this.timingRecalculationQueue.add(
      kairosJobNames.recalculateTimingStages,
      payload,
    );
  }

  async dispatchTimingScore(
    payload: CalculateTimingScoreJobPayload,
  ): Promise<void> {
    await this.timingScoreQueue.add(
      kairosJobNames.calculateTimingScore,
      payload,
    );
  }

  async dispatchAlert(payload: SendAlertJobPayload): Promise<void> {
    await this.alertQueue.add(kairosJobNames.sendAlert, payload);
  }

  async dispatchExport(payload: GenerateExportJobPayload): Promise<void> {
    await this.exportQueue.add(kairosJobNames.generateExport, payload);
  }

  private async findPendingBusinessDiscoveryJob(
    payload: DiscoverBusinessesJobPayload,
  ): Promise<Job<DiscoverBusinessesJobPayload> | null> {
    const jobs = await this.businessDiscoveryQueue.getJobs([
      "waiting",
      "delayed",
    ]);

    const normalizedState = payload.state.trim().toUpperCase();
    const normalizedIndustry = payload.industry.trim().toLowerCase();

    for (const job of jobs) {
      if (job === undefined) {
        continue;
      }

      if (job.name !== kairosJobNames.discoverBusinesses) {
        continue;
      }

      if (matchesBusinessDiscoveryPayload(job, normalizedState, normalizedIndustry)) {
        return job;
      }
    }

    return null;
  }
}

function matchesBusinessDiscoveryPayload(
  job: Job<DiscoverBusinessesJobPayload>,
  state: string,
  industry: string,
): boolean {
  return (
    job.data.state.trim().toUpperCase() === state &&
    job.data.industry.trim().toLowerCase() === industry
  );
}
