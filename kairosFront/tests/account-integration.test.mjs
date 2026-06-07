import assert from 'node:assert/strict'
import test from 'node:test'

import { loadTsModule } from './ts-module-loader.mjs'

const {
  buildKairosApiErrorMessage,
  buildKairosHeaders,
  readKairosApiBaseUrl,
} = loadTsModule('lib/account-api.ts')
const {
  parseKairosAccountSession,
  serializeKairosAccountSession,
} = loadTsModule('lib/account-session.ts')
const { parseKairosMarketTargetSession } = loadTsModule('lib/market-target-session.ts')
const { buildAccountInitials } = loadTsModule('lib/account-display.ts')
const { findUsStateOption, usStateOptions } = loadTsModule('lib/us-state-options.ts')
const {
  buildBusinessDetailPath,
  buildBusinessesPath,
  buildExportBusinessesPath,
  buildWatchlistCollectionPath,
  buildWatchlistItemPath,
  discoverKairosBusinesses,
  toCompany,
} = loadTsModule('lib/business-api.ts')

const kairosAccountSession = {
  accessToken: 'token_123',
  account: {
    alertPreference: { channels: ['email'], frequency: 'phase-change' },
    companyName: 'Acme Inc.',
    email: 'john@company.com',
    id: 'user_1',
    name: 'John Smith',
  },
}

test('Kairos API headers include bearer token when authenticated', () => {
  const headers = buildKairosHeaders('token_123')

  assert.equal(headers.Authorization, 'Bearer token_123')
  assert.equal(headers['Content-Type'], 'application/json')
})

test('Kairos API base defaults to the Next backend proxy', () => {
  assert.equal(readKairosApiBaseUrl({}), '/kairos-api')
})

test('Kairos API errors include response context', () => {
  const message = buildKairosApiErrorMessage(401, '/auth/login', 'invalid')

  assert.match(message, /received 401/)
  assert.match(message, /\/auth\/login/)
  assert.match(message, /invalid/)
})

test('Kairos account session round trips through storage serialization', () => {
  const serializedSession = serializeKairosAccountSession(kairosAccountSession)
  const parsedSession = parseKairosAccountSession(serializedSession)

  assert.equal(JSON.stringify(parsedSession), JSON.stringify(kairosAccountSession))
})

test('Kairos account session parsing rejects corrupt storage data', () => {
  assert.throws(
    () => parseKairosAccountSession('{bad-json'),
    /expected serialized KairosAccountSession/,
  )
})

test('Kairos market target session preserves the offered service', () => {
  const parsedTarget = parseKairosMarketTargetSession(JSON.stringify({
    accountId: 'user_1',
    cityOrRegion: 'Miami',
    desiredCustomerType: 'Agencies',
    industry: 'Healthcare',
    offeredService: 'branding',
    state: 'FL',
  }))

  assert.equal(parsedTarget.offeredService, 'branding')
  assert.equal(parsedTarget.state, 'FL')
})

test('dashboard account initials use the signed-in account name', () => {
  assert.equal(buildAccountInitials('John Smith'), 'JS')
  assert.equal(buildAccountInitials('  Maria  Silva Costa '), 'MS')
  assert.equal(buildAccountInitials(' '), 'K')
})

test('US state options map display names to backend abbreviations', () => {
  const florida = findUsStateOption('Florida')

  assert.equal(florida.abbreviation, 'FL')
  assert.equal(florida.coverageStatus, 'experimental')
  assert.equal(findUsStateOption('Unknown'), null)
})

test('US state options expose score-reliability coverage priorities', () => {
  assert.equal(usStateOptions.length, 5)
  assert.ok(findUsStateOption('Connecticut'))
  assert.equal(findUsStateOption('Connecticut').coverageStatus, 'active')
  assert.equal(findUsStateOption('Rhode Island').coverageStatus, 'next')
  assert.equal(findUsStateOption('Seattle, Washington').coverageStatus, 'experimental')
  assert.equal(findUsStateOption('Oregon').coverageStatus, 'experimental')
  assert.equal(findUsStateOption('Iowa'), null)
  assert.equal(findUsStateOption('Georgia'), null)
  assert.equal(findUsStateOption('Colorado'), null)
  assert.equal(findUsStateOption('Texas'), null)
})

test('business API rows map into dashboard companies with signals and timing', () => {
  const company = toCompany({
    ageDays: 14,
    city: 'Miami',
    digitalSignals: [
      {
        confidenceScore: 90,
        metadata: {},
        serviceImpact: 'high',
        signalName: 'website-missing',
        sourceName: 'Kairos detector',
      },
    ],
    id: 'biz_1',
    industry: 'Healthcare',
    name: 'Sunrise Clinic LLC',
    reason: '1 digital signal produced score 63 and stage warming-up.',
    recommendationStrength: 'relevant',
    registeredAt: '2026-06-01',
    scoreComponents: {
      ageFitScore: 14,
      dataConfidenceScore: 15,
      digitalReadinessScore: 4,
      industryFitScore: 5,
      penaltyScore: 0,
      serviceNeedScore: 25,
    },
    signalsCount: 1,
    sourceDocumentNumber: '1234567',
    source: 'Florida Division of Corporations',
    state: 'FL',
    timingScore: 63,
    timingStage: 'warming-up',
  })

  assert.equal(company.location.state, 'FL')
  assert.equal(company.digitalSignals.length, 1)
  assert.equal(company.reason, '1 digital signal produced score 63 and stage warming-up.')
  assert.equal(company.recommendationStrength, 'relevant')
  assert.equal(company.scoreBreakdown.businessFit, 25)
  assert.equal(company.timingScore, 63)
})

test('watchlist removal uses account and business identifiers', () => {
  assert.equal(
    buildWatchlistItemPath('account_1', 'biz_1'),
    '/accounts/account_1/watchlist/biz_1',
  )
})

test('watchlist save uses the account-scoped collection endpoint', () => {
  assert.equal(
    buildWatchlistCollectionPath('account_1'),
    '/accounts/account_1/watchlist',
  )
})

test('business list pagination builds server-side filter query params', () => {
  assert.equal(
    buildBusinessesPath({
      city: 'Miami',
      offeredService: 'branding',
      limit: 24,
      minScore: '70',
      offset: 48,
      search: 'clinic',
      state: 'FL',
      timingStage: 'best-window',
    }),
    '/businesses?state=FL&city=Miami&search=clinic&timingStage=best-window&minScore=70&offeredService=branding&limit=24&offset=48',
  )
})

test('business detail path targets one company instead of loading the full list', () => {
  assert.equal(
    buildBusinessDetailPath('biz_1', 'branding'),
    '/businesses/biz_1?offeredService=branding',
  )
})

test('business export path follows selected state and service', () => {
  assert.equal(
    buildExportBusinessesPath({
      offeredService: 'seo-local-seo',
      state: 'CT',
    }),
    '/exports/businesses.csv?state=CT&offeredService=seo-local-seo',
  )
})

test('business discovery API queues a state and industry sync job', async () => {
  const calls = []
  const previousFetch = globalThis.fetch

  try {
    globalThis.fetch = async (url, options) => {
      calls.push({ options, url })
      return new Response(JSON.stringify({ status: 'queued' }), { status: 200 })
    }

    const response = await discoverKairosBusinesses('token_1', {
      industry: 'all',
      state: 'RI',
    })

    assert.equal(response.status, 'queued')
    assert.equal(calls[0].url, '/kairos-api/jobs/discover-businesses')
    assert.equal(calls[0].options.method, 'POST')
    assert.deepEqual(JSON.parse(calls[0].options.body), {
      industry: 'all',
      state: 'RI',
    })
  } finally {
    globalThis.fetch = previousFetch
  }
})
