import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

const root = resolve(import.meta.dirname, '..')

function readProjectFile(relativePath) {
  return readFileSync(resolve(root, relativePath), 'utf8')
}

test('settings page exposes account, target market, alert preferences, and billing only', () => {
  const source = readProjectFile('app/dashboard/settings/page.tsx')

  assert.match(source, /Account Information/)
  assert.match(source, /Target Market/)
  assert.match(source, /Desired customer type/)
  assert.match(source, /Alert Preferences/)
  assert.match(source, /Billing/)
  assert.doesNotMatch(source, /API Access/)
  assert.doesNotMatch(source, /label: 'API'/)
})

test('alerts page keeps email and Telegram as MVP channels and marks webhook as future', () => {
  const source = readProjectFile('app/dashboard/alerts/page.tsx')

  assert.match(source, /Email Alerts/)
  assert.match(source, /Telegram Alerts/)
  assert.match(source, /Recent alerts/)
  assert.match(source, /listKairosAlerts/)
  assert.match(source, /Future channel/)
  assert.match(source, /MVP alert channels are email and Telegram/)
  assert.doesNotMatch(source, /webhookAlerts/)
  assert.doesNotMatch(source, /webhookUrl/)
})

test('exports page includes source as a selected minimum CSV field', () => {
  const source = readProjectFile('app/dashboard/exports/page.tsx')

  assert.match(source, /\{ id: 'source', label: 'Source', checked: true \}/)
  assert.match(source, /exportKairosBusinessesCsv/)
  assert.match(source, /Export includes all required MVP fields/)
})

test('company detail page includes required recommendation context', () => {
  const source = readProjectFile('app/dashboard/company/[id]/page.tsx')

  for (const label of [
    'Registered Date',
    'Age',
    'State',
    'City',
    'Industry',
    'Source',
    'Timing Score Breakdown',
    'Contact options',
    'Recommended Action',
    'Why this is relevant',
    'Suggested Outreach',
  ]) {
    assert.match(source, new RegExp(label))
  }

  assert.match(source, /It does not predict purchase intent/)
  assert.match(source, /createKairosOutreachSuggestion/)
  assert.doesNotMatch(source, /Copy a contextual outreach suggestion/)
})

test('service dropdown labels use polished service names', () => {
  const onboardingSource = readProjectFile('app/onboarding/page.tsx')
  const settingsSource = readProjectFile('app/dashboard/settings/page.tsx')

  assert.match(onboardingSource, /Website design & development/)
  assert.match(onboardingSource, /SEO \/ local SEO/)
  assert.match(settingsSource, /Website design & development/)
  assert.match(settingsSource, /SEO \/ local SEO/)
})

test('new business card keeps detail-heavy data out of the list view', () => {
  const source = readProjectFile('components/dashboard/company-card.tsx')

  assert.match(source, /Details/)
  assert.match(source, /Timing Score/)
  assert.doesNotMatch(source, /CompanyIndustryEnrichment/)
  assert.doesNotMatch(source, /buildCompanyScoreMetrics/)
  assert.doesNotMatch(source, /formatDigitalSignalName/)
})

test('business list exposes pagination controls after the result cards', () => {
  const source = readProjectFile('components/dashboard/company-list.tsx')

  assert.match(source, /Business result pages/)
  assert.match(source, /24 per page/)
  assert.ok(source.match(/<PaginationBar/g).length >= 3)
})

test('business list can sync covered states into backend discovery jobs', () => {
  const source = readProjectFile('components/dashboard/company-list.tsx')

  assert.match(source, /Sync state data/)
  assert.match(source, /discoverKairosBusinesses/)
  assert.match(source, /usStateOptions\.map/)
})

test('state filter hides coverage status labels and Iowa for now', () => {
  const filterSource = readProjectFile('components/dashboard/company-filters.tsx')
  const statesSource = readProjectFile('lib/us-state-options.ts')

  assert.doesNotMatch(filterSource, /formatCoverageStatusLabel/)
  assert.doesNotMatch(filterSource, /coverageStatusLabel/)
  assert.doesNotMatch(statesSource, /name: 'Iowa'/)
})
