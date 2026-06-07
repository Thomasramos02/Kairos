import { z } from "zod";

const optionalString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().optional(),
);

const optionalEmail = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().email().optional(),
);

const optionalBooleanString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.enum(["true", "false"]).optional(),
);

const kairosEnvironmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().url(),
  VALKEY_URL: z.string().url(),
  OUTBOX_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(5000),
  JWT_SECRET: z.string().min(32),
  FLORIDA_SUNBIZ_USERNAME: optionalString.default("Public"),
  FLORIDA_SUNBIZ_PASSWORD: optionalString.default("PubAccess1845!"),
  TELEGRAM_BOT_TOKEN: optionalString,
  TELEGRAM_CHAT_ID: optionalString,
  SMTP_HOST: optionalString,
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_SECURE: optionalBooleanString,
  SMTP_USER: optionalString,
  SMTP_APP_PASSWORD: optionalString,
  IOWA_SOS_AUTHORIZATION: optionalString,
  ALERT_EMAIL_FROM: optionalEmail,
  ALERT_EMAIL_TO: optionalEmail,
});

export type KairosEnvironment = {
  readonly nodeEnv: "development" | "test" | "production";
  readonly port: number;
  readonly databaseUrl: string;
  readonly valkeyUrl: string;
  readonly outboxPollIntervalMs: number;
  readonly jwtSecret: string;
  readonly floridaSunbizUsername: string;
  readonly floridaSunbizPassword: string;
  readonly telegramBotToken?: string;
  readonly telegramChatId?: string;
  readonly smtpHost?: string;
  readonly smtpPort?: number;
  readonly smtpSecure?: boolean;
  readonly smtpUser?: string;
  readonly smtpAppPassword?: string;
  readonly iowaSosAuthorization?: string;
  readonly alertEmailFrom?: string;
  readonly alertEmailTo?: string;
};

export function readKairosEnvironment(
  environment: NodeJS.ProcessEnv,
): KairosEnvironment {
  const parsedEnvironment = kairosEnvironmentSchema.safeParse(environment);

  if (!parsedEnvironment.success) {
    throw new Error(
      `Invalid Kairos environment: received ${JSON.stringify(
        parsedEnvironment.error.flatten().fieldErrors,
      )}; expected NODE_ENV, PORT, DATABASE_URL, VALKEY_URL, OUTBOX_POLL_INTERVAL_MS and JWT_SECRET`,
    );
  }

  return {
    nodeEnv: parsedEnvironment.data.NODE_ENV,
    port: parsedEnvironment.data.PORT,
    databaseUrl: parsedEnvironment.data.DATABASE_URL,
    valkeyUrl: parsedEnvironment.data.VALKEY_URL,
    outboxPollIntervalMs: parsedEnvironment.data.OUTBOX_POLL_INTERVAL_MS,
    jwtSecret: parsedEnvironment.data.JWT_SECRET,
    floridaSunbizUsername: parsedEnvironment.data.FLORIDA_SUNBIZ_USERNAME,
    floridaSunbizPassword: parsedEnvironment.data.FLORIDA_SUNBIZ_PASSWORD,
    telegramBotToken: parsedEnvironment.data.TELEGRAM_BOT_TOKEN,
    telegramChatId: parsedEnvironment.data.TELEGRAM_CHAT_ID,
    smtpHost: parsedEnvironment.data.SMTP_HOST,
    smtpPort: parsedEnvironment.data.SMTP_PORT,
    smtpSecure: parsedEnvironment.data.SMTP_SECURE === "true",
    smtpUser: parsedEnvironment.data.SMTP_USER,
    smtpAppPassword: parsedEnvironment.data.SMTP_APP_PASSWORD,
    iowaSosAuthorization: parsedEnvironment.data.IOWA_SOS_AUTHORIZATION,
    alertEmailFrom: parsedEnvironment.data.ALERT_EMAIL_FROM,
    alertEmailTo: parsedEnvironment.data.ALERT_EMAIL_TO,
  };
}
