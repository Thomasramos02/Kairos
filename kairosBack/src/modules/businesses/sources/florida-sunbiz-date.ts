export function formatSunbizDailyDate(date: Date): string {
  const year = date.getUTCFullYear().toString();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');

  return `${year}${month}${day}`;
}

export function listRecentSunbizBusinessDates(
  observedAt: Date,
  lookbackDays: number,
): readonly Date[] {
  if (lookbackDays <= 0) {
    throw new Error(`Invalid lookbackDays: received ${lookbackDays}; expected > 0`);
  }

  return Array.from({ length: lookbackDays }, (_value, index) =>
    subtractDays(observedAt, index),
  ).filter(isWeekday);
}

function subtractDays(date: Date, days: number): Date {
  const copiedDate = new Date(date);
  copiedDate.setUTCDate(copiedDate.getUTCDate() - days);

  return copiedDate;
}

function isWeekday(date: Date): boolean {
  const day = date.getUTCDay();

  return day !== 0 && day !== 6;
}
