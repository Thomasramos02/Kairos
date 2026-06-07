import { OfferedService } from '../../../domain/offered-service';
import { TimingStage } from '../../../domain/timing-stage';
import { DigitalSignalName } from '../../digital-signals/models/digital-signal.model';

export type OutreachSuggestionRequest = {
  readonly businessName: string;
  readonly offeredService: OfferedService;
  readonly signalName: DigitalSignalName;
  readonly signalConfidenceScore?: number;
  readonly signalImpact?: string;
  readonly timingReason?: string;
  readonly timingStage?: TimingStage;
};

export type OutreachSuggestion = {
  readonly message: string;
};
