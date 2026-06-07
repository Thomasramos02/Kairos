import {
  BusinessLifecycleInput,
  BusinessLifecycleStage,
} from '../models/business-lifecycle.model';

export function decideBusinessLifecycleStage(
  input: BusinessLifecycleInput,
): BusinessLifecycleStage {
  if (input.hasWatchlistItem || input.currentStage === 'watched') {
    return 'watched';
  }

  if (isStaleWeakCandidate(input)) {
    return 'archived';
  }

  if (isQualifiedBusiness(input)) {
    return 'qualified';
  }

  return 'candidate';
}

export function canMonitorBusiness(stage: BusinessLifecycleStage): boolean {
  return stage !== 'archived';
}

function isStaleWeakCandidate(input: BusinessLifecycleInput): boolean {
  return input.ageDays > 90 && input.timingScore < 70 && input.highestSignalConfidence < 80;
}

function isQualifiedBusiness(input: BusinessLifecycleInput): boolean {
  return input.timingScore >= 60 || input.highestSignalConfidence >= 75;
}
