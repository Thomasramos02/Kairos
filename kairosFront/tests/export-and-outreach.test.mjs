import assert from 'node:assert/strict'
import test from 'node:test'

import { loadTsModule } from './ts-module-loader.mjs'

const { sampleCompanies } = loadTsModule('lib/sample-data.ts')
const {
  buildCompanyScoreMetrics,
  buildRecommendationContext,
  buildServiceRecommendationLabel,
  formatDigitalSignalName,
} = loadTsModule('lib/business-display.ts')
const { buildOutreachSuggestionPayload } = loadTsModule('lib/business-api.ts')
const { companyToCsvRow } = loadTsModule('lib/mock-actions.ts')

const requiredCsvFields = [
  'company_name',
  'registered_at',
  'age_days',
  'state',
  'city',
  'industry',
  'timing_stage',
  'timing_score',
  'website_status',
  'digital_presence_status',
  'contact_detected',
  'opportunity_filters',
  'source',
]

test('CSV rows include every MVP export field', () => {
  const row = companyToCsvRow(sampleCompanies[0])

  for (const field of requiredCsvFields) {
    assert.ok(Object.hasOwn(row, field), `missing ${field}`)
    assert.notEqual(row[field], '')
  }
})

test('CSV rows include recommended action as useful export context', () => {
  const row = companyToCsvRow(sampleCompanies[0])

  assert.ok(Object.hasOwn(row, 'recommended_action'))
  assert.equal(row.recommended_action, sampleCompanies[0].recommendedAction)
})

test('outreach suggestion payload uses company context for the backend', () => {
  const company = sampleCompanies[0]
  const payload = buildOutreachSuggestionPayload(company, 'branding')

  assert.equal(payload.businessName, company.name)
  assert.equal(payload.offeredService, 'branding')
  assert.equal(payload.signalName, 'website-missing')
  assert.equal(payload.timingStage, company.timingStage)
})

test('outreach payload uses the highest-confidence signal first', () => {
  const payload = buildOutreachSuggestionPayload({
    ...sampleCompanies[0],
    digitalSignals: [
      {
        confidenceScore: 65,
        metadata: {},
        serviceImpact: 'local presence looks incomplete',
        signalName: 'local-presence-incomplete',
        sourceName: 'site check',
      },
      {
        confidenceScore: 92,
        metadata: {},
        serviceImpact: 'a missing website weakens early customer trust',
        signalName: 'website-missing',
        sourceName: 'candidate domain check',
      },
    ],
  }, 'website-design-development')

  assert.equal(payload.signalName, 'website-missing')
  assert.equal(payload.signalConfidenceScore, 92)
  assert.match(payload.signalImpact, /customer trust/)
})

test('digital signal names are readable in dashboard UI', () => {
  assert.equal(
    formatDigitalSignalName('domain-recently-registered'),
    'Domain Recently Registered',
  )
})

test('score metrics expose labels, units, and descriptions', () => {
  const metrics = buildCompanyScoreMetrics(sampleCompanies[0])

  assert.equal(metrics[0].label, 'Timing fit')
  assert.match(metrics[0].value, /^\d+$/)
  assert.equal(metrics[0].description, 'Age window')
})

test('recommendation context explains why now without purchase promises', () => {
  const context = buildRecommendationContext({
    ...sampleCompanies[0],
    digitalSignals: [
      {
        confidenceScore: 90,
        metadata: {},
        serviceImpact: 'a missing website weakens early trust',
        signalName: 'website-missing',
        sourceName: 'candidate domain check',
      },
    ],
    reason: 'score 87 and stage best-window',
  })

  assert.match(context.whyNow, /Website Missing/)
  assert.match(context.whyNow, /best-window/)
  assert.match(context.primarySignalLabel, /90%/)
  assert.doesNotMatch(context.noPredictionNotice, /will buy|guaranteed/i)
})

test('service recommendation highlights companies with matching signal problems', () => {
  const label = buildServiceRecommendationLabel({
    ...sampleCompanies[0],
    digitalSignals: [
      {
        confidenceScore: 90,
        metadata: {},
        serviceImpact: 'a missing website weakens early trust',
        signalName: 'website-missing',
        sourceName: 'candidate domain check',
      },
    ],
  }, 'website-design-development')

  assert.equal(label, 'Recommended for website development')
})

test('service recommendation highlights strong matches from backend strength', () => {
  const label = buildServiceRecommendationLabel({
    ...sampleCompanies[0],
    recommendationStrength: 'strong-match',
  }, 'logo-design')

  assert.equal(label, 'Strong match for logo design')
})
