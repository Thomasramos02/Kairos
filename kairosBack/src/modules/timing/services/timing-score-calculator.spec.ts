import { TimingScoreInput } from '../models/timing-score.model';
import { calculateTimingScore } from './timing-score-calculator';

describe('calculateTimingScore', () => {
  it('weights service-specific signals strongly', () => {
    const result = calculateTimingScore(
      createTimingInput({
        offeredService: 'website-design-development',
        signals: [{ signalName: 'website-missing', confidenceScore: 90 }],
      }),
    );

    expect(result.timingScore).toBe(71);
    expect(result.recommendationStrength).toBe('relevant');
    expect(result.components.serviceNeedScore).toBe(27);
  });

  it('caps duplicate signals within the same evidence group', () => {
    const result = calculateTimingScore(
      createTimingInput({
        signals: [
          { signalName: 'website-missing', confidenceScore: 100 },
          { signalName: 'website-incomplete', confidenceScore: 100 },
        ],
      }),
    );

    expect(result.components.serviceNeedScore).toBe(32);
  });

  it('keeps companies without digital evidence from ranking too high', () => {
    const result = calculateTimingScore(createTimingInput({ signals: [] }));

    expect(result.timingScore).toBeLessThanOrEqual(55);
    expect(result.recommendationStrength).toBe('low-fit');
  });

  it('treats Kairos-classified Florida industry as useful but not fully official', () => {
    const result = calculateTimingScore(createTimingInput());

    expect(result.components.industryFitScore).toBe(5);
    expect(result.components.dataConfidenceScore).toBe(15);
  });

  it('penalizes unclassified businesses and missing cities', () => {
    const result = calculateTimingScore(
      createTimingInput({ city: null, industry: 'unclassified' }),
    );

    expect(result.components.penaltyScore).toBe(13);
    expect(result.components.industryFitScore).toBe(0);
  });

  it('throws an exception with context for negative ages', () => {
    expect(() => calculateTimingScore(createTimingInput({ ageDays: -1 }))).toThrow(
      /expected >= 0/,
    );
  });
});

function createTimingInput(
  overrides: Partial<TimingScoreInput> = {},
): TimingScoreInput {
  return {
    ageDays: 21,
    city: 'Miami',
    industry: 'Food & Beverage',
    offeredService: 'website-design-development',
    signals: [{ signalName: 'website-missing', confidenceScore: 90 }],
    sourceName: 'Florida Division of Corporations Daily Corporate Filing',
    ...overrides,
  };
}
