import { Injectable } from '@nestjs/common';
import { Socket, connect as connectTcp } from 'net';
import { TLSSocket, connect as connectTls } from 'tls';
import { readKairosEnvironment } from '../../../config/kairos-environment';
import { AlertEvent } from '../models/alert.model';
import {
  AlertChannelSender,
  AlertDeliveryMessage,
  AlertDeliveryResult,
} from '../models/alert-delivery.model';

@Injectable()
export class SmtpEmailAlertChannelSender implements AlertChannelSender {
  readonly channel = 'email' as const;

  async sendAlert(
    _alertEvent: AlertEvent,
    message: AlertDeliveryMessage,
  ): Promise<AlertDeliveryResult> {
    const environment = readKairosEnvironment(process.env);

    if (!isEmailConfigured(environment)) {
      return createSkippedEmailResult(
        'missing SMTP_USER, SMTP_APP_PASSWORD, ALERT_EMAIL_FROM or ALERT_EMAIL_TO',
      );
    }

    await sendEmailWithSmtp(createSmtpConfig(environment), message);

    return { channel: this.channel, status: 'sent', reason: 'email delivered' };
  }
}

type SmtpEnvironment = {
  readonly smtpHost?: string;
  readonly smtpPort?: number;
  readonly smtpSecure?: boolean;
  readonly smtpUser?: string;
  readonly smtpAppPassword?: string;
  readonly alertEmailFrom?: string;
  readonly alertEmailTo?: string;
};

type SmtpConfig = {
  readonly host: string;
  readonly port: number;
  readonly secure: boolean;
  readonly user: string;
  readonly appPassword: string;
  readonly from: string;
  readonly to: string;
};

type SmtpConnection = Socket | TLSSocket;

function isEmailConfigured(environment: SmtpEnvironment): boolean {
  return Boolean(
    environment.smtpUser &&
      environment.smtpAppPassword &&
      environment.alertEmailFrom &&
      environment.alertEmailTo,
  );
}

function createSmtpConfig(environment: SmtpEnvironment): SmtpConfig {
  return {
    host: environment.smtpHost ?? 'smtp.gmail.com',
    port: environment.smtpPort ?? 587,
    secure: environment.smtpSecure ?? false,
    user: environment.smtpUser ?? '',
    appPassword: environment.smtpAppPassword ?? '',
    from: environment.alertEmailFrom ?? '',
    to: environment.alertEmailTo ?? '',
  };
}

async function sendEmailWithSmtp(
  config: SmtpConfig,
  message: AlertDeliveryMessage,
): Promise<void> {
  let connection = await openSmtpConnection(config);

  try {
    await readSmtpResponse(connection, 'initial greeting');
    connection = await prepareSmtpConnection(connection, config);
    await sendAuthenticatedMessage(connection, config, message);
  } finally {
    connection.end();
  }
}

async function prepareSmtpConnection(
  connection: SmtpConnection,
  config: SmtpConfig,
): Promise<SmtpConnection> {
  await sendSmtpCommand(connection, 'EHLO kairos.local', ['250']);

  if (config.secure) {
    return connection;
  }

  await sendSmtpCommand(connection, 'STARTTLS', ['220']);
  const tlsConnection = await upgradeSmtpConnection(connection, config.host);
  await sendSmtpCommand(tlsConnection, 'EHLO kairos.local', ['250']);

  return tlsConnection;
}

async function sendAuthenticatedMessage(
  connection: SmtpConnection,
  config: SmtpConfig,
  message: AlertDeliveryMessage,
): Promise<void> {
  await sendSmtpCommand(connection, createAuthPlainCommand(config), ['235']);
  await sendSmtpCommand(connection, `MAIL FROM:<${config.from}>`, ['250']);
  await sendSmtpCommand(connection, `RCPT TO:<${config.to}>`, ['250', '251']);
  await sendSmtpCommand(connection, 'DATA', ['354']);
  await sendSmtpData(connection, buildMimeMessage(config, message));
  await sendSmtpCommand(connection, 'QUIT', ['221']);
}

function createAuthPlainCommand(config: SmtpConfig): string {
  const token = Buffer.from(
    `\u0000${config.user}\u0000${config.appPassword}`,
    'utf8',
  ).toString('base64');

  return `AUTH PLAIN ${token}`;
}

function buildMimeMessage(
  config: SmtpConfig,
  message: AlertDeliveryMessage,
): string {
  return [
    `From: ${config.from}`,
    `To: ${config.to}`,
    `Subject: ${message.subject}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    escapeSmtpData(message.text),
  ].join('\r\n');
}

function escapeSmtpData(text: string): string {
  return text.replace(/\r?\n/g, '\r\n').replace(/^\./gm, '..');
}

function openSmtpConnection(config: SmtpConfig): Promise<SmtpConnection> {
  return config.secure
    ? openTlsConnection(config.host, config.port)
    : openTcpConnection(config.host, config.port);
}

function openTcpConnection(host: string, port: number): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const socket = connectTcp(port, host, () => resolve(socket));
    socket.once('error', reject);
  });
}

function openTlsConnection(host: string, port: number): Promise<TLSSocket> {
  return new Promise((resolve, reject) => {
    const socket = connectTls({ host, port, servername: host }, () => resolve(socket));
    socket.once('error', reject);
  });
}

function upgradeSmtpConnection(
  connection: SmtpConnection,
  host: string,
): Promise<TLSSocket> {
  return new Promise((resolve, reject) => {
    const socket = connectTls({ socket: connection, servername: host }, () =>
      resolve(socket),
    );
    socket.once('error', reject);
  });
}

async function sendSmtpCommand(
  connection: SmtpConnection,
  command: string,
  expectedCodes: readonly string[],
): Promise<void> {
  connection.write(`${command}\r\n`);
  const response = await readSmtpResponse(connection, command);

  if (!expectedCodes.includes(response.code)) {
    throw new Error(
      `SMTP command failed: received ${response.code} for ${command}; expected ${expectedCodes.join(
        ' or ',
      )}`,
    );
  }
}

async function sendSmtpData(
  connection: SmtpConnection,
  message: string,
): Promise<void> {
  connection.write(`${message}\r\n.\r\n`);
  const response = await readSmtpResponse(connection, 'message data');

  if (response.code !== '250') {
    throw new Error(
      `SMTP data failed: received ${response.code}; expected 250 after message data`,
    );
  }
}

function readSmtpResponse(
  connection: SmtpConnection,
  context: string,
): Promise<{ readonly code: string }> {
  return new Promise<{ readonly code: string }>((resolve, reject) => {
    let buffer = '';
    const removeListeners = (): void => {
      connection.off('data', onData);
      connection.off('error', onError);
    };
    const onError = (error: Error): void => {
      removeListeners();
      reject(error);
    };
    const onData = (chunk: Buffer): void => {
      buffer += chunk.toString('utf8');
      const code = parseCompletedSmtpCode(buffer);

      if (code) {
        removeListeners();
        resolve({ code });
      }
    };

    connection.on('data', onData);
    connection.once('error', onError);
  }).catch((error: unknown) => {
    throw new Error(
      `SMTP response failed: received ${String(error)} during ${context}; expected SMTP response line`,
    );
  });
}

function parseCompletedSmtpCode(buffer: string): string | undefined {
  const lines = buffer.split(/\r?\n/).filter((line) => line.length > 0);
  const lastLine = lines.at(-1);

  if (!lastLine || !/^\d{3} /.test(lastLine)) {
    return undefined;
  }

  return lastLine.slice(0, 3);
}

function createSkippedEmailResult(reason: string): AlertDeliveryResult {
  return { channel: 'email', status: 'skipped', reason };
}
