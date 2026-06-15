export type AlertReason =
  | 'new-business'
  | 'entered-best-window'
  | 'timing-stage-changed';

export type AlertEvent = {
  readonly id: string;
  readonly accountId: string;
  readonly businessId: string;
  readonly reason: AlertReason;
  readonly channels: readonly ('email' | 'telegram')[];
  readonly readAt: string | null;
  readonly createdAt: string;
};
