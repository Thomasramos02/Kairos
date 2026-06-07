export type TimingStage = 
  | 'too-early' 
  | 'warming-up' 
  | 'best-window' 
  | 'cooling-down' 
  | 'old-lead'

export interface Company {
  id: string
  sourceDocumentNumber?: string | null
  name: string
  location: {
    state: string
    city: string
  }
  industry: string
  registeredDate: Date
  ageInDays: number
  timingStage: TimingStage
  timingScore: number
  source: string
  industryEnrichment?: CorporateIndustryEnrichment | null
  reason?: string
  digitalSignals?: readonly {
    readonly signalName: string
    readonly sourceName: string
    readonly confidenceScore: number
    readonly metadata: {
      readonly contactMethods?: readonly {
        readonly type: 'phone' | 'email' | 'contact-form' | 'address' | 'agent' | 'officer' | 'license'
        readonly value: string
        readonly source: 'registry' | 'website' | 'license' | 'county-btr'
        readonly confidenceScore: number
        readonly label?: string
      }[]
      readonly socialProfiles?: readonly {
        readonly network: string
        readonly url: string
      }[]
      readonly technologies?: readonly string[]
      readonly websiteUrl?: string
    }
    readonly serviceImpact: string
  }[]
  recommendationStrength?: 'strong-match' | 'relevant' | 'monitor' | 'low-fit'
  recommendedAction: string
  scoreBreakdown: {
    ageWindow: number
    businessFit: number
    contactability: number
    dataConfidence: number
    industryFit?: number
    penalties?: number
  }
}

export interface WatchlistCompany extends Company {
  expectedStageChange: string
  alertEnabled: boolean
  notes?: string
}

export type CorporateIndustryEnrichment = {
  readonly state: 'CT' | 'GA' | 'CO' | 'FL'
  readonly company_name: string
  readonly naics_code: string
  readonly industry: string
  readonly confidence_score: number
}

export interface AlertSettings {
  email: boolean
  telegram: boolean
  weeklyDigest: boolean
  triggers: {
    newBusinessDetected: boolean
    warmingUp: boolean
    bestWindow: boolean
    coolingDown: boolean
    savedCompanyChanged: boolean
  }
}

export interface UserSettings {
  name: string
  email: string
  company?: string
  defaultFilters: {
    country: string
    state: string
    city: string
    industry: string
  }
  alertSettings: AlertSettings
}

export interface Export {
  id: string
  date: Date
  fileName: string
  recordCount: number
  filters: string
}

export function getTimingStage(ageInDays: number): TimingStage {
  if (ageInDays <= 7) return 'too-early'
  if (ageInDays <= 21) return 'warming-up'
  if (ageInDays <= 45) return 'best-window'
  if (ageInDays <= 90) return 'cooling-down'
  return 'old-lead'
}

export function getTimingStageLabel(stage: TimingStage): string {
  const labels: Record<TimingStage, string> = {
    'too-early': 'Too Early',
    'warming-up': 'Warming Up',
    'best-window': 'Best Outreach Window',
    'cooling-down': 'Cooling Down',
    'old-lead': 'Old Lead',
  }
  return labels[stage]
}

export function getTimingStageDescription(stage: TimingStage): string {
  const descriptions: Record<TimingStage, string> = {
    'too-early': 'Business is still in setup phase. Wait for better timing.',
    'warming-up': 'Business is stabilizing. Monitor for outreach readiness.',
    'best-window': 'Optimal time for outreach. Act now.',
    'cooling-down': 'Window closing. Reach out soon if interested.',
    'old-lead': 'No longer a new business. Standard outreach applies.',
  }
  return descriptions[stage]
}

export function getTimingStageColor(stage: TimingStage): string {
  const colors: Record<TimingStage, string> = {
    'too-early': 'timing-too-early',
    'warming-up': 'timing-warming-up',
    'best-window': 'timing-best-window',
    'cooling-down': 'timing-cooling-down',
    'old-lead': 'timing-old-lead',
  }
  return colors[stage]
}
