import { resolveCoverageStatus, usStateCoverages } from './us-state';

describe('usStateCoverages', () => {
  it('orders coverage by score reliability priority', () => {
    expect(usStateCoverages).toEqual([
      {
        abbreviation: 'CT',
        caution: null,
        coverageStatus: 'active',
        name: 'Connecticut',
      },
      {
        abbreviation: 'RI',
        caution: 'Promising NAICS/purpose coverage; source integration is not active yet.',
        coverageStatus: 'next',
        name: 'Rhode Island',
      },
      {
        abbreviation: 'FL',
        caution: 'High formation volume, but industry is inferred by Kairos instead of supplied by Sunbiz.',
        coverageStatus: 'experimental',
        name: 'Florida',
      },
      {
        abbreviation: 'WA',
        caution: 'Seattle city licenses include NAICS; statewide coverage is not validated.',
        coverageStatus: 'experimental',
        name: 'Seattle, Washington',
      },
      {
        abbreviation: 'OR',
        caution: 'Business registry is open, but industry may require separate employer datasets.',
        coverageStatus: 'experimental',
        name: 'Oregon',
      },
      {
        abbreviation: 'IA',
        caution: 'Business entities are open; NAICS appears in narrower tax/licensing datasets.',
        coverageStatus: 'experimental',
        name: 'Iowa',
      },
    ]);
  });

  it('marks Connecticut as active coverage and Rhode Island as next', () => {
    expect(resolveCoverageStatus('ct')).toBe('active');
    expect(resolveCoverageStatus('ri')).toBe('next');
  });

  it('marks Florida and separate experiments as experimental coverage', () => {
    expect(resolveCoverageStatus('fl')).toBe('experimental');
    expect(resolveCoverageStatus('wa')).toBe('experimental');
    expect(resolveCoverageStatus('or')).toBe('experimental');
    expect(resolveCoverageStatus('ia')).toBe('experimental');
  });

  it('marks unknown state codes as unavailable', () => {
    expect(resolveCoverageStatus('ZZ')).toBe('unavailable');
  });

  it('marks states outside the reliability plan as unavailable', () => {
    expect(resolveCoverageStatus('TX')).toBe('unavailable');
    expect(resolveCoverageStatus('CA')).toBe('unavailable');
    expect(resolveCoverageStatus('GA')).toBe('unavailable');
    expect(resolveCoverageStatus('CO')).toBe('unavailable');
  });
});
