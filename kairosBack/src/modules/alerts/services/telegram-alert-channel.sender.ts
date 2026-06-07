import { Injectable } from '@nestjs/common';
import { readKairosEnvironment } from '../../../config/kairos-environment';
import { AlertEvent } from '../models/alert.model';
import {
  AlertChannelSender,
  AlertDeliveryMessage,
  AlertDeliveryResult,
} from '../models/alert-delivery.model';

@Injectable()
export class TelegramAlertChannelSender implements AlertChannelSender {
  readonly channel = 'telegram' as const;

  async sendAlert(
    _alertEvent: AlertEvent,
    message: AlertDeliveryMessage,
  ): Promise<AlertDeliveryResult> {
    const environment = readKairosEnvironment(process.env);

    if (!environment.telegramBotToken || !environment.telegramChatId) {
      return createSkippedTelegramResult('missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
    }

    await sendTelegramMessage(
      environment.telegramBotToken,
      environment.telegramChatId,
      message.text,
    );

    return { channel: this.channel, status: 'sent', reason: 'telegram delivered' };
  }
}

async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string,
): Promise<void> {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!response.ok) {
    throw new Error(`Telegram alert failed: received ${response.status}; expected 2xx`);
  }
}

function createSkippedTelegramResult(reason: string): AlertDeliveryResult {
  return { channel: 'telegram', status: 'skipped', reason };
}
