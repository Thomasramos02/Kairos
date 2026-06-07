import { OfferedService } from '../../../domain/offered-service';
import { TimingStage } from '../../../domain/timing-stage';

export type ListBusinessesQuery = {
  readonly state?: string;
  readonly city?: string;
  readonly industry?: string;
  readonly search?: string;
  readonly timingStage?: TimingStage;
  readonly minScore?: string;
  readonly offeredService?: OfferedService;
};

export type ListBusinessesPageQuery = ListBusinessesQuery & {
  readonly limit?: string;
  readonly offset?: string;
};
