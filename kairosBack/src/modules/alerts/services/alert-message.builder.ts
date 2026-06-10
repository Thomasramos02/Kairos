import { AlertEvent } from '../models/alert.model';
import { AlertDeliveryMessage } from '../models/alert-delivery.model';

export function buildAlertDeliveryMessage(
  alertEvent: AlertEvent,
  businessName: string,
): AlertDeliveryMessage {
  return {
    subject: buildAlertSubject(alertEvent, businessName),
    text: buildAlertText(alertEvent, businessName),
  };
}

function buildAlertSubject(
  alertEvent: AlertEvent,
  businessName: string,
): string {
  const reasonLabel = alertReasonLabels[alertEvent.reason];
  return `Kairos: ${businessName} — ${reasonLabel}`;
}

function buildAlertText(
  alertEvent: AlertEvent,
  businessName: string,
): string {
  const reasonLabel = alertReasonLabels[alertEvent.reason];
  return [
    `Kairos Alert`,
    ``,
    `${businessName}`,
    `${reasonLabel}`,
    ``,
    `View in dashboard: https://kairos.app/dashboard/company/${alertEvent.businessId}`,
  ].join('\n');
}

const alertReasonLabels: Record<AlertEvent['reason'], string> = {
  'new-business': 'New business match detected in your market',
  'entered-best-window': 'Entered best outreach window — time to act',
  'timing-stage-changed': 'Timing stage changed',
};
