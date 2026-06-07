import {
  parseRhodeIslandWeeklyExport,
  resolveRhodeIslandExportUrl,
} from "./rhode-island-weekly-corporations.client";

describe("RhodeIslandWeeklyCorporationsClient helpers", () => {
  it("finds the latest official weekly export link", () => {
    const url = resolveRhodeIslandExportUrl(
      '<a href="WeeklyCorpExportFiles/02152026.txt">2/15/2026</a>',
    );

    expect(url).toBe(
      "https://business.sos.ri.gov/corp/WeeklyCorpExport/WeeklyCorpExportFiles/02152026.txt",
    );
  });

  it("parses tab-delimited Rhode Island rows", () => {
    const rows = parseRhodeIslandWeeklyExport(
      [
        "corp_id\tcorp_name\tincorp_dt\teffect_dt\tpurpose\tagent_city",
        "123\tKairos RI LLC\t2/10/2026\t2/11/2026\tSoftware\tProvidence",
      ].join("\n"),
    );

    expect(rows).toEqual([
      {
        agent_city: "Providence",
        corp_id: "123",
        corp_name: "Kairos RI LLC",
        effect_dt: "2/11/2026",
        incorp_dt: "2/10/2026",
        purpose: "Software",
      },
    ]);
  });
});
