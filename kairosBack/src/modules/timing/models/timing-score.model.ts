import { OfferedService } from '../../../domain/offered-service';
import { TimingStage } from '../../../domain/timing-stage';
import { DigitalSignalName } from '../../digital-signals/models/digital-signal.model';

export type TimingSignalInput = {
  readonly signalName: DigitalSignalName;
  readonly confidenceScore: number;
};

export type RecommendationStrength =
  | 'strong-match'
  | 'relevant'
  | 'monitor'
  | 'low-fit';

export type TimingScoreComponents = {
  readonly ageFitScore: number;
  readonly dataConfidenceScore: number;
  readonly digitalReadinessScore: number;
  readonly industryFitScore: number;
  readonly penaltyScore: number;
  readonly serviceNeedScore: number;
};

export type TimingScoreInput = {
  readonly ageDays: number;
  readonly city: string | null;
  readonly industry: string;
  readonly offeredService: OfferedService;
  readonly signals: readonly TimingSignalInput[];
  readonly sourceName: string;
};

export type TimingScoreResult = {
  readonly components: TimingScoreComponents;
  readonly recommendationStrength: RecommendationStrength;
  readonly timingScore: number;
  readonly timingStage: TimingStage;
  readonly reason: string;
};
