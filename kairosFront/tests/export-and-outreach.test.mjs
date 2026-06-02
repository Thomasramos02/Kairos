import assert from 'node:assert/strict'
import test from 'node:test'

import { loadTsModule } from './ts-module-loader.mjs'

const { sampleCompanies } = loadTsModule('lib/sample-data.ts')
const { buildOutreachMessage, companyToCsvRow } = loadTsModule('lib/mock-actions.ts')

const requiredCsvFields = [
  'company_name',
  'registered_at',
  'age_days',
  'state',
  'city',
  'industry',
  'timing_stage',
  'timing_score',
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

test('outreach suggestion is contextual and avoids conversion promises', () => {
  const company = sampleCompanies[0]
  const message = buildOutreachMessage(company)

  assert.match(message, new RegExp(company.location.city))
  assert.match(message, new RegExp(company.location.state))
  assert.match(message, new RegExp(company.industry.toLowerCase()))
  assert.doesNotMatch(message, /guaranteed|you will buy|conversion/i)
  assert.doesNotMatch(message, /blast|mass email|spam/i)
})
