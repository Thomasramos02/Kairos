import assert from 'node:assert/strict'
import test from 'node:test'

import { loadTsModule } from './ts-module-loader.mjs'

const { sampleCompanies, watchlistCompanies } = loadTsModule('lib/sample-data.ts')
const { getTimingStage } = loadTsModule('lib/types.ts')

test('sample companies expose the minimum fields required for dashboard listings', () => {
  assert.ok(sampleCompanies.length > 0)

  for (const company of sampleCompanies) {
    assert.ok(company.name)
    assert.ok(company.registeredDate instanceof Date)
    assert.equal(typeof company.ageInDays, 'number')
    assert.ok(company.location.city)
    assert.ok(company.location.state)
    assert.ok(company.industry)
    assert.ok(company.source)
    assert.equal(company.timingStage, getTimingStage(company.ageInDays))
    assert.equal(typeof company.timingScore, 'number')
  }
})

test('score breakdown stays explainable and bounded', () => {
  for (const company of sampleCompanies) {
    assert.ok(company.scoreBreakdown.ageWindow >= 0)
    assert.ok(company.scoreBreakdown.ageWindow <= 100)
    assert.ok(company.scoreBreakdown.businessFit >= 5)
    assert.ok(company.scoreBreakdown.businessFit <= 19)
    assert.ok(company.scoreBreakdown.contactability >= 3)
    assert.ok(company.scoreBreakdown.contactability <= 12)
    assert.ok(company.scoreBreakdown.dataConfidence >= 2)
    assert.ok(company.scoreBreakdown.dataConfidence <= 9)
  }
})

test('watchlist companies include monitoring metadata and alert state', () => {
  assert.ok(watchlistCompanies.length > 0)

  for (const company of watchlistCompanies) {
    assert.ok(company.expectedStageChange)
    assert.equal(typeof company.alertEnabled, 'boolean')
    assert.equal(Object.hasOwn(company, 'watchlistStatus'), false)
  }
})
