import { TimingStage } from '../../../domain/timing-stage';

export function rankTimingStage(stage: TimingStage): number {
  const stageRanks: Record<TimingStage, number> = {
    'best-window': 0,
    'warming-up': 1,
    'too-early': 2,
    'cooling-down': 3,
    'old-lead': 4,
  };

  return stageRanks[stage] ?? 99;
}
