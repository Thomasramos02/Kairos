import { AlertChannel } from '../../accounts/models/account.model';
import { AlertEvent } from './alert.model';

export type AlertDeliveryMessage = {
  readonly subject: string;
  readonly text: string;
};

export type AlertDeliveryResult = {
  readonly channel: AlertChannel;
  readonly status: 'sent' | 'skipped';
  readonly reason: string;
};

export type AlertChannelSender = {
  readonly channel: AlertChannel;
  sendAlert(
    alertEvent: AlertEvent,
    message: AlertDeliveryMessage,
  ): Promise<AlertDeliveryResult>;
};
