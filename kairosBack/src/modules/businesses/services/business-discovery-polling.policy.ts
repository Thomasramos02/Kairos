import { formatSunbizDailyDate } from '../sources/florida-sunbiz-date';

export type BusinessDiscoveryPollingDecision = {
  readonly delayMs: number;
  readonly reason: string;
};

const oneHourMs = 60 * 60 * 1000;
const twentyFourHoursMs = 24 * oneHourMs;

export function decideBusinessDiscoveryPolling(
  sourceCursor: string | null,
  completedAt: Date,
): BusinessDiscoveryPollingDecision {
  const todayCursor = formatSunbizDailyDate(completedAt);

  if (sourceCursor === todayCursor) {
    return {
      delayMs: twentyFourHoursMs + 15 * 60 * 1000,
      reason: 'latest daily filing already processed; wait for the next official publication',
    };
  }

  if (sourceCursor === null) {
    return {
      delayMs: oneHourMs,
      reason: 'source file not found yet; retry within the same publication day',
    };
  }

  return {
    delayMs: oneHourMs,
    reason: 'source cursor is behind the current day; retry soon until the official file catches up',
  };
}

export function buildBusinessDiscoveryJobId(
  state: string,
  industry: string,
  scheduleToken: string,
): string {
  const normalizedState = normalizeJobSegment(state.trim().toUpperCase());
  const normalizedIndustry = normalizeJobSegment(industry);
  const normalizedToken = normalizeJobSegment(scheduleToken);

  return `business-discovery-${normalizedState}-${normalizedIndustry}-${normalizedToken}`;
}

function normalizeJobSegment(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
