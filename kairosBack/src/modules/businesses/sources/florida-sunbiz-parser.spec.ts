import { parseFloridaSunbizCorporateFile } from "./florida-sunbiz-parser";

describe("parseFloridaSunbizCorporateFile", () => {
  it("parses fixed-width Sunbiz corporate records", () => {
    const line = createSunbizCorporateLine();
    const records = parseFloridaSunbizCorporateFile(
      line,
      new Date("2026-06-03T12:00:00.000Z"),
    );

    expect(records).toEqual([
      {
        sourceDocumentNumber: "L26000000001",
        legalName: "SUNRISE BAKERY LLC",
        state: "FL",
        city: "MIAMI",
        industry: "Food & Beverage",
        registeredAt: new Date("2026-06-03T00:00:00.000Z"),
        sourceName: "Florida Division of Corporations Daily Corporate Filing",
      },
    ]);
  });

  it("skips records without a valid filing date", () => {
    const line = createSunbizCorporateLine();
    const invalidLine = replaceField(line, 472, "        ");

    const records = parseFloridaSunbizCorporateFile(
      invalidLine,
      new Date("2026-06-03T12:00:00.000Z"),
    );

    expect(records).toEqual([]);
  });

  it("skips records with a future registered date for the observed file", () => {
    const line = createSunbizCorporateLine("06282026");

    const records = parseFloridaSunbizCorporateFile(
      line,
      new Date("2026-06-05T12:00:00.000Z"),
    );

    expect(records).toEqual([]);
  });
});

function createSunbizCorporateLine(registeredAt = "06032026"): string {
  const line = Array.from({ length: 1440 }, () => " ");
  writeField(line, 0, "L26000000001");
  writeField(line, 12, "SUNRISE BAKERY LLC");
  writeField(line, 280, "MIAMI");
  writeField(line, 472, registeredAt);

  return line.join("");
}

function replaceField(line: string, start: number, value: string): string {
  const characters = line.split("");
  writeField(characters, start, value);

  return characters.join("");
}

function writeField(line: string[], start: number, value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    line[start + index] = value[index];
  }
}
