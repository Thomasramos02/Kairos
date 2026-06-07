import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../modules/auth/jwt-auth.guard";
import {
  DiscoverBusinessesJobPayload,
  GenerateExportJobPayload,
  RecalculateTimingStagesJobPayload,
} from "./kairos-job-payload";
import { KairosJobDispatcherService } from "./kairos-job-dispatcher.service";

@Controller("/jobs")
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobDispatcher: KairosJobDispatcherService) {}

  @Post("/discover-businesses")
  async dispatchBusinessDiscovery(
    @Body() payload: DiscoverBusinessesJobPayload,
  ): Promise<{ readonly status: "queued" }> {
    await this.jobDispatcher.dispatchBusinessDiscovery(payload);

    return { status: "queued" };
  }

  @Post("/exports")
  async dispatchExport(
    @Body() payload: GenerateExportJobPayload,
  ): Promise<{ readonly status: "queued" }> {
    await this.jobDispatcher.dispatchExport(payload);

    return { status: "queued" };
  }

  @Post("/recalculate-timing-stages")
  async dispatchTimingRecalculation(
    @Body() payload: RecalculateTimingStagesJobPayload,
  ): Promise<{ readonly status: "queued" }> {
    await this.jobDispatcher.dispatchTimingRecalculation(payload);

    return { status: "queued" };
  }
}
