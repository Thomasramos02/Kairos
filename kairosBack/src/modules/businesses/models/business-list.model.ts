import { TimingStage } from '../../../domain/timing-stage';
import {
  RecommendationStrength,
  TimingScoreComponents,
} from '../../timing/models/timing-score.model';
import {
  DigitalSignalMetadata,
  DigitalSignalName,
} from '../../digital-signals/models/digital-signal.model';
import {
  BusinessOpportunitySummary,
  OpportunityFilter,
} from './business-opportunity.model';

export type BusinessDigitalSignalSummary = {
  readonly signalName: DigitalSignalName;
  readonly sourceName: string;
  readonly confidenceScore: number;
  readonly metadata: DigitalSignalMetadata;
  readonly serviceImpact: string;
};

export type BusinessListItem = {
  readonly id: string;
  readonly sourceDocumentNumber: string | null;
  readonly name: string;
  readonly registeredAt: string;
  readonly ageDays: number;
  readonly city: string | null;
  readonly state: string;
  readonly industry: string;
  readonly source: string;
  readonly signalsCount: number;
  readonly digitalSignals: readonly BusinessDigitalSignalSummary[];
  readonly recommendationStrength: RecommendationStrength;
  readonly scoreComponents: TimingScoreComponents;
  readonly timingStage: TimingStage;
  readonly timingScore: number;
  readonly reason: string;
  readonly opportunity: BusinessOpportunitySummary;
  readonly opportunityFilters: readonly OpportunityFilter[];
};

export type PaginatedBusinessList = {
  readonly items: readonly BusinessListItem[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
  readonly hasMore: boolean;
};
