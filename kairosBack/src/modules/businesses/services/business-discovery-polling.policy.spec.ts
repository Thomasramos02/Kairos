import {
  decideBusinessDiscoveryPolling,
  buildBusinessDiscoveryJobId,
} from "./business-discovery-polling.policy";

describe("business discovery polling policy", () => {
  it("waits until the next day after today's publication was processed", () => {
    const decision = decideBusinessDiscoveryPolling(
      "20260605",
      new Date("2026-06-05T14:00:00.000Z"),
    );

    expect(decision.delayMs).toBe(24 * 60 * 60 * 1000 + 15 * 60 * 1000);
  });

  it("retries in one hour when the source is behind the current day", () => {
    const decision = decideBusinessDiscoveryPolling(
      "20260604",
      new Date("2026-06-05T14:00:00.000Z"),
    );

    expect(decision.delayMs).toBe(60 * 60 * 1000);
  });

  it("builds a stable job id for a state and industry pair", () => {
    const jobId = buildBusinessDiscoveryJobId(
      "fl",
      " Food Service ",
      "bootstrap",
    );

    expect(jobId).toBe("business-discovery-fl-food-service-bootstrap");
  });
});
