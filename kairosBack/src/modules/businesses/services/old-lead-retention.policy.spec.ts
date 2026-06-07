import {
  calculateOldLeadRetentionCutoff,
  isPastOldLeadRetention,
  oldLeadRetentionDays,
} from "./old-lead-retention.policy";

describe("old lead retention policy", () => {
  it("uses 150 days as the old lead deletion window", () => {
    const cutoff = calculateOldLeadRetentionCutoff(
      new Date("2026-06-07T00:00:00.000Z"),
    );

    expect(oldLeadRetentionDays).toBe(150);
    expect(cutoff.toISOString()).toBe("2026-01-08T00:00:00.000Z");
  });

  it("only deletes businesses registered before the retention cutoff", () => {
    const referenceDate = new Date("2026-06-07T00:00:00.000Z");

    expect(isPastOldLeadRetention(new Date("2026-01-07"), referenceDate)).toBe(true);
    expect(isPastOldLeadRetention(new Date("2026-01-08"), referenceDate)).toBe(false);
  });
});
