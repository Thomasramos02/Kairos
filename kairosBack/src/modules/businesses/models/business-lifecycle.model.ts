export type BusinessLifecycleStage =
  | 'candidate'
  | 'qualified'
  | 'watched'
  | 'archived';

export type BusinessLifecycleInput = {
  readonly ageDays: number;
  readonly currentStage: BusinessLifecycleStage;
  readonly hasWatchlistItem: boolean;
  readonly highestSignalConfidence: number;
  readonly timingScore: number;
};
