import { SmtpEmailAlertChannelSender } from './resend-email-alert-channel.sender';

describe('SmtpEmailAlertChannelSender', () => {
  beforeEach(() => {
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/kairos';
    process.env.VALKEY_URL = 'redis://localhost:6379';
    process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-chars';
    delete process.env.SMTP_USER;
    delete process.env.SMTP_APP_PASSWORD;
    delete process.env.ALERT_EMAIL_FROM;
    delete process.env.ALERT_EMAIL_TO;
  });

  it('skips delivery when email is not configured', async () => {
    const sender = new SmtpEmailAlertChannelSender();
    const result = await sender.sendAlert(createAlertEvent(), {
      subject: 'Subject',
      text: 'Message',
    });

    expect(result).toEqual({
      channel: 'email',
      status: 'skipped',
      reason: 'missing SMTP_USER, SMTP_APP_PASSWORD, ALERT_EMAIL_FROM or ALERT_EMAIL_TO',
    });
  });
});

function createAlertEvent() {
  return {
    id: 'alert_1',
    accountId: 'user_1',
    businessId: 'biz_1',
    reason: 'new-business' as const,
    channels: ['email'] as const,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}
