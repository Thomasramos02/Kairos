import { OfferedService } from '../../../domain/offered-service';
import { TimingStage } from '../../../domain/timing-stage';

export type TimingStageHistoryEntry = {
  readonly id: string;
  readonly businessId: string;
  readonly offeredService: OfferedService;
  readonly previousStage: TimingStage | null;
  readonly nextStage: TimingStage;
  readonly timingScore: number;
  readonly reason: string;
  readonly changedAt: string;
};

export type TimingStageChangeInput = {
  readonly businessId: string;
  readonly offeredService: OfferedService;
  readonly previousStage: TimingStage | null;
  readonly nextStage: TimingStage;
  readonly timingScore: number;
  readonly reason: string;
};
