import { TimingStage } from '../../../domain/timing-stage';

export function calculateTimingStage(
  timingScore: number,
  ageDays: number,
): TimingStage {
  if (ageDays <= 3) {
    return 'too-early';
  }

  if (timingScore >= 75) {
    return 'best-window';
  }

  if (timingScore >= 55) {
    return 'warming-up';
  }

  if (ageDays >= 120) {
    return 'old-lead';
  }

  return 'cooling-down';
}
