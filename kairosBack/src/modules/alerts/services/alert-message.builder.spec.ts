import { buildAlertDeliveryMessage } from './alert-message.builder';

describe('buildAlertDeliveryMessage', () => {
  it('builds concise alert messages', () => {
    const message = buildAlertDeliveryMessage({
      id: 'alert_1',
      accountId: 'user_1',
      businessId: 'biz_1',
      reason: 'entered-best-window',
      channels: ['email'],
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    expect(message.subject).toBe('Kairos alert: entered-best-window');
    expect(message.text).toContain('Business: biz_1');
  });
});
