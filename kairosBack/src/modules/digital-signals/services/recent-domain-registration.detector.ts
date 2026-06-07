const recentDomainWindowDays = 90;
const millisecondsPerDay = 24 * 60 * 60 * 1000;

export function isRecentlyRegisteredDomain(
  registeredAt: Date,
  observedAt: Date,
): boolean {
  if (registeredAt.getTime() > observedAt.getTime()) {
    throw new Error(
      `Invalid registeredAt: received ${registeredAt.toISOString()}; expected date before observedAt ${observedAt.toISOString()}`,
    );
  }

  return calculateAgeDays(registeredAt, observedAt) <= recentDomainWindowDays;
}

function calculateAgeDays(registeredAt: Date, observedAt: Date): number {
  return Math.floor((observedAt.getTime() - registeredAt.getTime()) / millisecondsPerDay);
}
