export type StateCoverageStatus = 'active' | 'next' | 'experimental'

export type UsStateOption = {
  readonly name: string
  readonly abbreviation: string
  readonly coverageStatus: StateCoverageStatus
  readonly caution: string | null
}

export const usStateOptions: readonly UsStateOption[] = [
  {
    abbreviation: 'CT',
    caution: null,
    coverageStatus: 'active',
    name: 'Connecticut',
  },
  {
    abbreviation: 'RI',
    caution: null,
    coverageStatus: 'active',
    name: 'Rhode Island',
  },
  {
    abbreviation: 'FL',
    caution: null,
    coverageStatus: 'next',
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
]

export function findUsStateOption(stateName: string): UsStateOption | null {
  return (
    usStateOptions.find((state) => state.name === stateName || state.abbreviation === stateName) ??
    null
  )
}

export function formatCoverageStatusLabel(status: StateCoverageStatus): string {
  if (status === 'active') {
    return 'active'
  }

  if (status === 'next') {
    return 'next'
  }

  return 'experimental'
}
