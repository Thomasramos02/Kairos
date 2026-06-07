const millisecondsPerDay = 24 * 60 * 60 * 1000;

export function calculateBusinessAgeDays(
  registeredAt: Date,
  observedAt: Date,
): number {
  if (hasFutureBusinessRegistration(registeredAt, observedAt)) {
    throw new Error(
      `Invalid registeredAt: received ${registeredAt.toISOString()}; expected date before observedAt ${observedAt.toISOString()}`,
    );
  }

  return Math.floor((observedAt.getTime() - registeredAt.getTime()) / millisecondsPerDay);
}

export function hasFutureBusinessRegistration(
  registeredAt: Date,
  observedAt: Date,
): boolean {
  return registeredAt.getTime() > observedAt.getTime();
}
