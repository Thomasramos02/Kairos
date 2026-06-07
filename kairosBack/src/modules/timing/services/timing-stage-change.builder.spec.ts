import { shouldRecordTimingStageChange } from './timing-stage-change.builder';

describe('shouldRecordTimingStageChange', () => {
  it('records initial timing stages', () => {
    expect(
      shouldRecordTimingStageChange({
        businessId: 'biz_1',
        offeredService: 'website-design-development',
        previousStage: null,
        nextStage: 'warming-up',
        timingScore: 60,
        reason: 'initial score',
      }),
    ).toBe(true);
  });

  it('skips unchanged timing stages', () => {
    expect(
      shouldRecordTimingStageChange({
        businessId: 'biz_1',
        offeredService: 'branding',
        previousStage: 'warming-up',
        nextStage: 'warming-up',
        timingScore: 60,
        reason: 'same score',
      }),
    ).toBe(false);
  });

  it('throws an exception with context for empty business ids', () => {
    expect(() =>
      shouldRecordTimingStageChange({
        businessId: ' ',
        offeredService: 'branding',
        previousStage: null,
        nextStage: 'warming-up',
        timingScore: 60,
        reason: 'bad input',
      }),
    ).toThrow(/expected non-empty business id/);
  });
});
