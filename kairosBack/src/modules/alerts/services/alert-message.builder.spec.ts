import { buildAlertDeliveryMessage } from './alert-message.builder';

describe('buildAlertDeliveryMessage', () => {
  it('builds concise alert messages', () => {
    const message = buildAlertDeliveryMessage({
      id: 'alert_1',
      accountId: 'user_1',
      businessId: 'biz_1',
      reason: 'entered-best-window',
      channels: ['email'],
      readAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
    }, 'Acme LLC');

    expect(message.subject).toBe('Kairos: Acme LLC — Entered best outreach window — time to act');
    expect(message.text).toContain('Acme LLC');
    expect(message.text).toContain('biz_1');
  });
});
