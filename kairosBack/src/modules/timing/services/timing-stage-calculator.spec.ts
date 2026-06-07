import { calculateTimingStage } from './timing-stage-calculator';

describe('calculateTimingStage', () => {
  it('keeps very new businesses in too early stage', () => {
    expect(calculateTimingStage(90, 2)).toBe('too-early');
  });

  it('marks high score businesses as best window', () => {
    expect(calculateTimingStage(80, 21)).toBe('best-window');
  });

  it('marks old weak businesses as old leads', () => {
    expect(calculateTimingStage(20, 150)).toBe('old-lead');
  });
});
