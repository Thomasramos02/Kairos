import { TelegramAlertChannelSender } from './telegram-alert-channel.sender';

describe('TelegramAlertChannelSender', () => {
  beforeEach(() => {
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/kairos';
    process.env.VALKEY_URL = 'redis://localhost:6379';
    process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-chars';
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
  });

  it('skips delivery when Telegram is not configured', async () => {
    const sender = new TelegramAlertChannelSender();
    const result = await sender.sendAlert(createAlertEvent(), {
      subject: 'Subject',
      text: 'Message',
    });

    expect(result).toEqual({
      channel: 'telegram',
      status: 'skipped',
      reason: 'missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID',
    });
  });
});

function createAlertEvent() {
  return {
    id: 'alert_1',
    accountId: 'user_1',
    businessId: 'biz_1',
    reason: 'new-business' as const,
    channels: ['telegram'] as const,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}
