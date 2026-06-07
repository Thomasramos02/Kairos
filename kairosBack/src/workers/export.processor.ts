import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ExportsService } from '../modules/exports/exports.service';
import { GenerateExportJobPayload } from '../queue/kairos-job-payload';
import { kairosQueueNames } from '../queue/kairos-queue-name';

@Processor(kairosQueueNames.export)
export class ExportProcessor extends WorkerHost {
  constructor(private readonly exportsService: ExportsService) {
    super();
  }

  async process(job: Job<GenerateExportJobPayload>): Promise<void> {
    await this.exportsService.exportBusinessesCsv({ state: job.data.state });
  }
}
