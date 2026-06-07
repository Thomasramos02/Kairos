import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { DiscoverBusinessesJobPayload } from "../queue/kairos-job-payload";
import { KairosJobDispatcherService } from "../queue/kairos-job-dispatcher.service";

const defaultDiscoveryIndustry = "all";
const discoveryStateCodes = ["CT", "RI", "WA", "OR", "IA"] as const;

@Injectable()
export class BusinessDiscoveryBootstrap implements OnApplicationBootstrap {
  constructor(
    private readonly jobDispatcher: KairosJobDispatcherService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const discoveryRequests = this.buildDiscoveryRequests();

    for (const request of discoveryRequests) {
      await this.jobDispatcher.dispatchBusinessDiscovery(request);
    }

    for (const state of discoveryStateCodes) {
      await this.jobDispatcher.dispatchTimingRecalculation({ state });
    }
  }

  private buildDiscoveryRequests(): readonly DiscoverBusinessesJobPayload[] {
    return discoveryStateCodes.map((state) => ({
      industry: defaultDiscoveryIndustry,
      state,
    }));
  }
}
