import { readKairosEnvironment } from "./kairos-environment";

describe("readKairosEnvironment", () => {
  it("returns typed environment values", () => {
    const environment = readKairosEnvironment({
      NODE_ENV: "test",
      PORT: "4000",
      DATABASE_URL: "postgres://user:pass@localhost:5432/kairos",
      VALKEY_URL: "redis://localhost:6379",
      OUTBOX_POLL_INTERVAL_MS: "2500",
      JWT_SECRET: "test-secret-with-at-least-thirty-two-chars",
      FLORIDA_SUNBIZ_USERNAME: "Public",
      FLORIDA_SUNBIZ_PASSWORD: "public-password",
      TELEGRAM_BOT_TOKEN: "telegram-token",
      TELEGRAM_CHAT_ID: "telegram-chat",
      SMTP_HOST: "smtp.gmail.com",
      SMTP_PORT: "587",
      SMTP_SECURE: "false",
      SMTP_USER: "kairos@gmail.com",
      SMTP_APP_PASSWORD: "gmail-app-password",
      IOWA_SOS_AUTHORIZATION: "Basic iowa-token",
      ALERT_EMAIL_FROM: "kairos@gmail.com",
      ALERT_EMAIL_TO: "owner@example.com",
    });

    expect(environment).toEqual({
      nodeEnv: "test",
      port: 4000,
      databaseUrl: "postgres://user:pass@localhost:5432/kairos",
      valkeyUrl: "redis://localhost:6379",
      outboxPollIntervalMs: 2500,
      jwtSecret: "test-secret-with-at-least-thirty-two-chars",
      floridaSunbizUsername: "Public",
      floridaSunbizPassword: "public-password",
      telegramBotToken: "telegram-token",
      telegramChatId: "telegram-chat",
      smtpHost: "smtp.gmail.com",
      smtpPort: 587,
      smtpSecure: false,
      smtpUser: "kairos@gmail.com",
      smtpAppPassword: "gmail-app-password",
      iowaSosAuthorization: "Basic iowa-token",
      alertEmailFrom: "kairos@gmail.com",
      alertEmailTo: "owner@example.com",
    });
  });

  it("ignores empty optional integration values", () => {
    const environment = readKairosEnvironment({
      DATABASE_URL: "postgres://user:pass@localhost:5432/kairos",
      VALKEY_URL: "redis://localhost:6379",
      JWT_SECRET: "test-secret-with-at-least-thirty-two-chars",
      TELEGRAM_BOT_TOKEN: "",
      SMTP_USER: "",
      SMTP_APP_PASSWORD: "",
      ALERT_EMAIL_FROM: "",
      ALERT_EMAIL_TO: "",
    });

    expect(environment.smtpUser).toBeUndefined();
    expect(environment.smtpAppPassword).toBeUndefined();
    expect(environment.alertEmailFrom).toBeUndefined();
    expect(environment.alertEmailTo).toBeUndefined();
    expect(environment.floridaSunbizUsername).toBe("Public");
    expect(environment.floridaSunbizPassword).toBe("PubAccess1845!");
  });

  it("throws an exception with context for invalid values", () => {
    expect(() =>
      readKairosEnvironment({
        DATABASE_URL: "not-a-url",
        VALKEY_URL: "redis://localhost:6379",
        JWT_SECRET: "test-secret-with-at-least-thirty-two-chars",
      }),
    ).toThrow(/Invalid Kairos environment/);
  });
});
