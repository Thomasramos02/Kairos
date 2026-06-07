import { parseDomainRegisteredAt } from './domain-registration-date.parser';

describe('parseDomainRegisteredAt', () => {
  it('parses RDAP registration events', () => {
    const registeredAt = parseDomainRegisteredAt({
      events: [{ eventAction: 'registration', eventDate: '2026-01-01T00:00:00Z' }],
    });

    expect(registeredAt?.toISOString()).toBe('2026-01-01T00:00:00.000Z');
  });

  it('returns null when RDAP has no registration event', () => {
    expect(parseDomainRegisteredAt({ events: [] })).toBeNull();
  });
});
