import {
  calculateBusinessAgeDays,
  hasFutureBusinessRegistration,
} from './business-age-calculator';

describe('calculateBusinessAgeDays', () => {
  it('calculates whole age days', () => {
    const ageDays = calculateBusinessAgeDays(
      new Date('2026-01-01T00:00:00.000Z'),
      new Date('2026-01-11T00:00:00.000Z'),
    );

    expect(ageDays).toBe(10);
  });

  it('throws an exception with context for future registration dates', () => {
    expect(() =>
      calculateBusinessAgeDays(
        new Date('2026-01-11T00:00:00.000Z'),
        new Date('2026-01-01T00:00:00.000Z'),
      ),
    ).toThrow(/expected date before observedAt/);
  });

  it('detects when a registration date is in the future', () => {
    const isFutureRegistration = hasFutureBusinessRegistration(
      new Date('2026-01-11T00:00:00.000Z'),
      new Date('2026-01-01T00:00:00.000Z'),
    );

    expect(isFutureRegistration).toBe(true);
  });
});
