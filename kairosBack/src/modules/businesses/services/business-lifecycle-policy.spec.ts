import {
  canMonitorBusiness,
  decideBusinessLifecycleStage,
} from './business-lifecycle-policy';

describe('decideBusinessLifecycleStage', () => {
  it('keeps watched businesses monitored regardless of score', () => {
    const stage = decideBusinessLifecycleStage({
      ageDays: 120,
      currentStage: 'candidate',
      hasWatchlistItem: true,
      highestSignalConfidence: 10,
      timingScore: 10,
    });

    expect(stage).toBe('watched');
  });

  it('qualifies businesses with strong score or signal confidence', () => {
    const stage = decideBusinessLifecycleStage({
      ageDays: 30,
      currentStage: 'candidate',
      hasWatchlistItem: false,
      highestSignalConfidence: 80,
      timingScore: 40,
    });

    expect(stage).toBe('qualified');
  });

  it('archives stale weak businesses to avoid monitoring everything', () => {
    const stage = decideBusinessLifecycleStage({
      ageDays: 120,
      currentStage: 'candidate',
      hasWatchlistItem: false,
      highestSignalConfidence: 40,
      timingScore: 40,
    });

    expect(stage).toBe('archived');
    expect(canMonitorBusiness(stage)).toBe(false);
  });
});
