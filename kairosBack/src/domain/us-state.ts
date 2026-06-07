export type StateCoverageStatus =
  | 'active'
  | 'next'
  | 'experimental'
  | 'unavailable';

export type UsStateCoverage = {
  readonly name: string;
  readonly abbreviation: string;
  readonly coverageStatus: StateCoverageStatus;
  readonly caution: string | null;
};

export const usStateCoverages: readonly UsStateCoverage[] = [
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
] as const;

export function resolveCoverageStatus(stateCode: string): StateCoverageStatus {
  const normalizedStateCode = stateCode.trim().toUpperCase();

  if (normalizedStateCode === 'CT') {
    return 'active';
  }

  if (normalizedStateCode === 'RI') {
    return 'next';
  }

  if (['FL', 'WA', 'OR', 'IA'].includes(normalizedStateCode)) {
    return 'experimental';
  }

  return 'unavailable';
}
