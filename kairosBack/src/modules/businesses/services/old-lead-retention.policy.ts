export const oldLeadRetentionDays = 150;

/**
 * Returns the registration-date cutoff for deleting stale old leads.
 *
 * Example:
 * `calculateOldLeadRetentionCutoff(new Date("2026-06-07T00:00:00.000Z"))`
 */
export function calculateOldLeadRetentionCutoff(referenceDate: Date): Date {
  const cutoff = new Date(referenceDate);
  cutoff.setUTCDate(cutoff.getUTCDate() - oldLeadRetentionDays);

  return cutoff;
}

/**
 * Checks whether a business is beyond the old-lead retention window.
 *
 * Example:
 * `isPastOldLeadRetention(new Date("2026-01-01"), new Date("2026-06-07"))`
 */
export function isPastOldLeadRetention(
  registeredAt: Date,
  referenceDate: Date,
): boolean {
  return registeredAt < calculateOldLeadRetentionCutoff(referenceDate);
}
