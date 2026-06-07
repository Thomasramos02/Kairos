export type TimingStage =
  | 'too-early'
  | 'warming-up'
  | 'best-window'
  | 'cooling-down'
  | 'old-lead';

export type TimingStageDecision = {
  readonly stage: TimingStage;
  readonly reason: string;
};
