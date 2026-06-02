import assert from 'node:assert/strict'
import test from 'node:test'

import { loadTsModule } from './ts-module-loader.mjs'

const {
  getTimingStage,
  getTimingStageColor,
  getTimingStageDescription,
  getTimingStageLabel,
} = loadTsModule('lib/types.ts')

test('classifies companies into documented timing stages by age', () => {
  assert.equal(getTimingStage(0), 'too-early')
  assert.equal(getTimingStage(7), 'too-early')
  assert.equal(getTimingStage(8), 'warming-up')
  assert.equal(getTimingStage(21), 'warming-up')
  assert.equal(getTimingStage(22), 'best-window')
  assert.equal(getTimingStage(45), 'best-window')
  assert.equal(getTimingStage(46), 'cooling-down')
  assert.equal(getTimingStage(90), 'cooling-down')
  assert.equal(getTimingStage(91), 'old-lead')
})

test('labels and descriptions explain every timing stage without promising conversion', () => {
  const stages = ['too-early', 'warming-up', 'best-window', 'cooling-down', 'old-lead']

  for (const stage of stages) {
    assert.ok(getTimingStageLabel(stage).length > 0)
    assert.ok(getTimingStageDescription(stage).length > 0)
    assert.ok(getTimingStageColor(stage).startsWith('timing-'))
    assert.doesNotMatch(getTimingStageDescription(stage), /will buy|guaranteed|conversion/i)
  }
})
