import { BusinessDiscoveryBootstrap } from "./business-discovery.bootstrap";
import {
  DiscoverBusinessesJobPayload,
  RecalculateTimingStagesJobPayload,
} from "../queue/kairos-job-payload";
import { KairosJobDispatcherService } from "../queue/kairos-job-dispatcher.service";

class FakeJobDispatcher {
  readonly discoveredBusinesses: DiscoverBusinessesJobPayload[] = [];
  readonly timingRecalculations: RecalculateTimingStagesJobPayload[] = [];

  async dispatchBusinessDiscovery(
    payload: DiscoverBusinessesJobPayload,
  ): Promise<void> {
    this.discoveredBusinesses.push(payload);
  }

  async dispatchTimingRecalculation(
    payload: RecalculateTimingStagesJobPayload,
  ): Promise<void> {
    this.timingRecalculations.push(payload);
  }
}

describe("BusinessDiscoveryBootstrap", () => {
  it("dispatches each source state as a separate discovery experiment", async () => {
    const dispatcher = new FakeJobDispatcher();
    const bootstrap = new BusinessDiscoveryBootstrap(
      dispatcher as unknown as KairosJobDispatcherService,
    );

    await bootstrap.onApplicationBootstrap();

    expect(dispatcher.discoveredBusinesses).toEqual([
      { state: "CT", industry: "all" },
      { state: "RI", industry: "all" },
      { state: "WA", industry: "all" },
      { state: "OR", industry: "all" },
      { state: "IA", industry: "all" },
    ]);
    expect(dispatcher.timingRecalculations).toEqual([
      { state: "CT" },
      { state: "RI" },
      { state: "WA" },
      { state: "OR" },
      { state: "IA" },
    ]);
  });
});
