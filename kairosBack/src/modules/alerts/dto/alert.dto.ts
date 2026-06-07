import { AlertReason } from '../models/alert.model';

export type CreateAlertRequest = {
  readonly accountId: string;
  readonly businessId: string;
  readonly reason: AlertReason;
};
