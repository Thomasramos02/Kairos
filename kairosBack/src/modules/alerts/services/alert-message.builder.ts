import { AlertEvent } from '../models/alert.model';
import { AlertDeliveryMessage } from '../models/alert-delivery.model';

export function buildAlertDeliveryMessage(
  alertEvent: AlertEvent,
): AlertDeliveryMessage {
  return {
    subject: buildAlertSubject(alertEvent),
    text: buildAlertText(alertEvent),
  };
}

function buildAlertSubject(alertEvent: AlertEvent): string {
  return `Kairos alert: ${alertEvent.reason}`;
}

function buildAlertText(alertEvent: AlertEvent): string {
  return [
    `Reason: ${alertEvent.reason}`,
    `Business: ${alertEvent.businessId}`,
    `Account: ${alertEvent.accountId}`,
  ].join('\n');
}
