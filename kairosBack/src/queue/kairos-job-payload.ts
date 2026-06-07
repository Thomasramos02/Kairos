import { OfferedService } from "../domain/offered-service";

export type DiscoverBusinessesJobPayload = {
  readonly state: string;
  readonly industry: string;
};

export type DetectDigitalSignalsJobPayload = {
  readonly businessId: string;
};

export type EnrichBusinessContactsJobPayload = {
  readonly businessId: string;
};

export type CalculateTimingScoreJobPayload = {
  readonly businessId: string;
  readonly offeredService: OfferedService;
};

export type RecalculateTimingStagesJobPayload = {
  readonly state?: string;
};

export type SendAlertJobPayload = {
  readonly accountId: string;
  readonly businessId: string;
  readonly reason:
    | "new-business"
    | "entered-best-window"
    | "timing-stage-changed";
};

export type GenerateExportJobPayload = {
  readonly accountId: string;
  readonly state?: string;
};
