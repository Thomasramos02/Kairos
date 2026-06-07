import { OfferedService } from "../../../domain/offered-service";

export type TimingRecalculationRequest = {
  readonly businessId: string;
  readonly offeredService: OfferedService;
};
