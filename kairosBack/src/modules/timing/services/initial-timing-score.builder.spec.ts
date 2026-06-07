import { buildInitialTimingScoreInputs } from "./initial-timing-score.builder";

describe("buildInitialTimingScoreInputs", () => {
  it("creates ready timing scores for every offered service", () => {
    const inputs = buildInitialTimingScoreInputs(
      {
        archivedAt: null,
        city: "Stamford",
        id: "biz_1",
        industry: "Custom Computer Programming Services",
        legalName: "Apex Data LLC",
        lifecycleStage: "candidate",
        registeredAt: new Date("2026-06-01T00:00:00.000Z"),
        sourceDocumentNumber: "3382895",
        sourceName: "Connecticut Business Registry Business Master",
        state: "CT",
      },
      new Date("2026-06-05T00:00:00.000Z"),
    );

    expect(inputs).toHaveLength(6);
    expect(inputs[0]).toMatchObject({
      businessId: "biz_1",
      errorMessage: null,
      offeredService: "website-design-development",
      signalsCount: 0,
      status: "ready",
    });
    expect(inputs[0]?.reason).toContain(
      "Initial score created before digital signal enrichment completed.",
    );
  });
});
