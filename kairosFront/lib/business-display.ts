import { Company } from './types'
import { OfferedService } from './account-api'

export type ScoreMetricItem = {
  readonly label: string
  readonly value: string
  readonly description: string
}

export type RecommendationContext = {
  readonly actionLabel: string
  readonly confidenceLabel: string
  readonly noPredictionNotice: string
  readonly primarySignalLabel: string
  readonly serviceFitLabel: string
  readonly whyNow: string
}

export function buildCompanyScoreMetrics(company: Company): readonly ScoreMetricItem[] {
  const metrics = [
    buildScoreMetric('Timing fit', String(company.scoreBreakdown.ageWindow), 'Age window'),
    buildScoreMetric('Service need', String(company.scoreBreakdown.businessFit), 'Signal fit'),
    buildScoreMetric('Digital readiness', String(company.scoreBreakdown.contactability), 'Evidence quality'),
    buildScoreMetric('Industry fit', String(company.scoreBreakdown.industryFit ?? 0), 'Category confidence'),
    buildScoreMetric('Data confidence', String(company.scoreBreakdown.dataConfidence), 'Source quality'),
  ]

  if ((company.scoreBreakdown.penalties ?? 0) > 0) {
    return [
      ...metrics,
      buildScoreMetric('Penalties', `-${company.scoreBreakdown.penalties}`, 'Low evidence'),
    ]
  }

  return metrics
}

export function buildRecommendationContext(company: Company): RecommendationContext {
  const primarySignal = findPrimarySignal(company)

  return {
    actionLabel: company.recommendedAction,
    confidenceLabel: `${company.scoreBreakdown.dataConfidence} data confidence points`,
    noPredictionNotice: 'Kairos does not predict purchase intent.',
    primarySignalLabel: formatPrimarySignal(primarySignal),
    serviceFitLabel: 'Service-aware recommendation',
    whyNow: buildWhyNow(company, primarySignal),
  }
}

export function buildServiceRecommendationLabel(
  company: Company,
  offeredService: OfferedService,
): string {
  const serviceLabel = formatOfferedServiceLabel(offeredService)

  if (company.recommendationStrength === 'strong-match') {
    return `Strong match for ${serviceLabel}`
  }

  if (hasHighImpactSignalForService(company, offeredService)) {
    return `Recommended for ${serviceLabel}`
  }

  if (company.recommendationStrength === 'relevant' || company.timingScore >= 60) {
    return `Relevant for ${serviceLabel}`
  }

  return `Monitoring for ${serviceLabel}`
}

export function formatOfferedServiceLabel(offeredService: OfferedService): string {
  const labels: Record<OfferedService, string> = {
    branding: 'branding',
    'google-business-profile-local-presence': 'Google Business Profile',
    'landing-page-creation': 'landing pages',
    'logo-design': 'logo design',
    'seo-local-seo': 'local SEO',
    'website-design-development': 'website development',
  }

  return labels[offeredService]
}

export function formatDigitalSignalName(signalName: string): string {
  return signalName
    .split('-')
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ')
}

function buildWhyNow(
  company: Company,
  primarySignal: NonNullable<Company['digitalSignals']>[number] | undefined,
): string {
  const signalText = primarySignal
    ? `${formatDigitalSignalName(primarySignal.signalName)} is the strongest visible signal`
    : 'No strong digital signal is recorded yet'

  return `${signalText}; ${company.reason ?? company.recommendedAction}`
}

function buildScoreMetric(
  label: string,
  value: string,
  description: string,
): ScoreMetricItem {
  return { description, label, value }
}

function findPrimarySignal(
  company: Company,
): NonNullable<Company['digitalSignals']>[number] | undefined {
  const signals = company.digitalSignals ?? []
  return [...signals].sort((left, right) => right.confidenceScore - left.confidenceScore)[0]
}

function hasHighImpactSignalForService(
  company: Company,
  offeredService: OfferedService,
): boolean {
  const signals = company.digitalSignals ?? []

  return signals.some((signal) =>
    highImpactSignalKeys.has(`${signal.signalName}:${offeredService}`),
  )
}

function formatPrimarySignal(
  signal: NonNullable<Company['digitalSignals']>[number] | undefined,
): string {
  if (signal === undefined) {
    return 'No signal recorded yet'
  }

  return `${formatDigitalSignalName(signal.signalName)} (${signal.confidenceScore}%)`
}

const highImpactSignalKeys = new Set<string>([
  'website-missing:website-design-development',
  'website-missing:landing-page-creation',
  'website-missing:branding',
  'website-missing:logo-design',
  'domain-recently-registered:website-design-development',
  'domain-recently-registered:landing-page-creation',
  'website-incomplete:seo-local-seo',
  'website-incomplete:landing-page-creation',
  'local-presence-incomplete:seo-local-seo',
  'local-presence-incomplete:google-business-profile-local-presence',
  'social-presence-misaligned:branding',
  'social-presence-misaligned:logo-design',
  'business-contact-detected:website-design-development',
  'business-contact-detected:seo-local-seo',
  'business-contact-detected:landing-page-creation',
  'business-contact-detected:google-business-profile-local-presence',
])
