import { isRecentlyRegisteredDomain } from './recent-domain-registration.detector';

describe('isRecentlyRegisteredDomain', () => {
  it('accepts domains registered within 90 days', () => {
    expect(
      isRecentlyRegisteredDomain(
        new Date('2026-01-01T00:00:00.000Z'),
        new Date('2026-03-01T00:00:00.000Z'),
      ),
    ).toBe(true);
  });

  it('rejects older domains', () => {
    expect(
      isRecentlyRegisteredDomain(
        new Date('2025-01-01T00:00:00.000Z'),
        new Date('2026-03-01T00:00:00.000Z'),
      ),
    ).toBe(false);
  });
});
