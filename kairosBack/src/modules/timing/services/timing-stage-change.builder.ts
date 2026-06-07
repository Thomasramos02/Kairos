import { TimingStageChangeInput } from '../models/timing-stage-history.model';

export function shouldRecordTimingStageChange(
  timingStageChange: TimingStageChangeInput,
): boolean {
  if (timingStageChange.businessId.trim().length === 0) {
    throw new Error(
      `Invalid businessId: received "${timingStageChange.businessId}"; expected non-empty business id`,
    );
  }

  return timingStageChange.previousStage !== timingStageChange.nextStage;
}
