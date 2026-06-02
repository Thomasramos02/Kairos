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
  assert.match(source, /Future channel/)
  assert.match(source, /MVP alert channels are email and Telegram/)
  assert.doesNotMatch(source, /webhookAlerts/)
  assert.doesNotMatch(source, /webhookUrl/)
})

test('exports page includes source as a selected minimum CSV field', () => {
  const source = readProjectFile('app/dashboard/exports/page.tsx')

  assert.match(source, /\{ id: 'source', label: 'Source', checked: true \}/)
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
    'Recommended Action',
    'Suggested Outreach',
  ]) {
    assert.match(source, new RegExp(label))
  }

  assert.match(source, /It does not predict purchase intent/)
})
