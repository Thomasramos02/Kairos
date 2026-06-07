import { NewDiscoveredBusiness } from "../models/business.model";
import { classifyBusinessIndustryFromName } from "./business-industry-classifier";

export type FloridaSunbizCorporateRecord = NewDiscoveredBusiness;

const minimumCorporateRecordLength = 480;
const sunbizSourceName =
  "Florida Division of Corporations Daily Corporate Filing";

export function parseFloridaSunbizCorporateFile(
  fileContent: string,
  observedAt: Date,
): readonly FloridaSunbizCorporateRecord[] {
  return fileContent
    .split(/\r?\n/)
    .map((line) => parseFloridaSunbizCorporateLine(line, observedAt))
    .filter(
      (record): record is FloridaSunbizCorporateRecord => record !== null,
    );
}

function parseFloridaSunbizCorporateLine(
  line: string,
  observedAt: Date,
): FloridaSunbizCorporateRecord | null {
  if (line.trim().length === 0 || line.length < minimumCorporateRecordLength) {
    return null;
  }

  const registeredAt = parseSunbizDate(readField(line, 472, 480), observedAt);

  if (registeredAt === null) {
    return null;
  }

  const legalName = readField(line, 12, 192);

  return {
    sourceDocumentNumber: readField(line, 0, 12),
    legalName,
    state: "FL",
    city: readField(line, 280, 330) || null,
    industry: classifyBusinessIndustryFromName(legalName),
    registeredAt,
    sourceName: sunbizSourceName,
  };
}

function readField(line: string, start: number, end: number): string {
  return line.slice(start, end).trim();
}

function parseSunbizDate(value: string, observedAt: Date): Date | null {
  if (!/^\d{8}$/.test(value)) {
    return null;
  }

  const year = value.slice(4, 8);
  const month = value.slice(0, 2);
  const day = value.slice(2, 4);
  const registeredAt = new Date(`${year}-${month}-${day}T00:00:00.000Z`);

  if (!isExactSunbizDate(registeredAt, year, month, day)) {
    return null;
  }

  if (registeredAt.getTime() > observedAt.getTime()) {
    return null;
  }

  return registeredAt;
}

function isExactSunbizDate(
  value: Date,
  year: string,
  month: string,
  day: string,
): boolean {
  return (
    value.getUTCFullYear().toString() === year &&
    `${value.getUTCMonth() + 1}`.padStart(2, "0") === month &&
    `${value.getUTCDate()}`.padStart(2, "0") === day
  );
}
