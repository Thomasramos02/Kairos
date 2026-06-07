import { Injectable } from '@nestjs/common';
import {
  AlertChannelSender,
  AlertDeliveryResult,
} from '../models/alert-delivery.model';
import { AlertEvent } from '../models/alert.model';
import { buildAlertDeliveryMessage } from './alert-message.builder';
import { SmtpEmailAlertChannelSender } from './resend-email-alert-channel.sender';
import { TelegramAlertChannelSender } from './telegram-alert-channel.sender';

@Injectable()
export class AlertDeliveryService {
  constructor(
    private readonly emailSender: SmtpEmailAlertChannelSender,
    private readonly telegramSender: TelegramAlertChannelSender,
  ) {}

  async deliverAlert(alertEvent: AlertEvent): Promise<readonly AlertDeliveryResult[]> {
    const message = buildAlertDeliveryMessage(alertEvent);
    const senders = this.listRequestedSenders(alertEvent);

    return await Promise.all(
      senders.map((sender) => sender.sendAlert(alertEvent, message)),
    );
  }

  private listRequestedSenders(alertEvent: AlertEvent): readonly AlertChannelSender[] {
    const senders = [this.emailSender, this.telegramSender];

    return senders.filter((sender) => alertEvent.channels.includes(sender.channel));
  }
}
