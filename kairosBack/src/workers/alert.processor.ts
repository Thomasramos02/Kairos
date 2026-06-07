import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AlertsService } from '../modules/alerts/alerts.service';
import { SendAlertJobPayload } from '../queue/kairos-job-payload';
import { kairosQueueNames } from '../queue/kairos-queue-name';

@Processor(kairosQueueNames.alert)
export class AlertProcessor extends WorkerHost {
  constructor(private readonly alertsService: AlertsService) {
    super();
  }

  async process(job: Job<SendAlertJobPayload>): Promise<void> {
    await this.alertsService.createAlert(job.data);
  }
}
