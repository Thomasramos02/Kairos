import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
const passwordHashKeyLength = 64;

@Injectable()
export class PasswordHasherService {
  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const hash = await derivePasswordHash(password, salt);

    return `scrypt:${salt}:${hash}`;
  }

  async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    const parsedHash = parsePasswordHash(passwordHash);
    const attemptedHash = await derivePasswordHash(password, parsedHash.salt);

    return timingSafeEqual(
      Buffer.from(attemptedHash, 'hex'),
      Buffer.from(parsedHash.hash, 'hex'),
    );
  }
}

async function derivePasswordHash(password: string, salt: string): Promise<string> {
  const derivedKey = (await scryptAsync(
    password,
    salt,
    passwordHashKeyLength,
  )) as Buffer;

  return derivedKey.toString('hex');
}

function parsePasswordHash(passwordHash: string): {
  readonly salt: string;
  readonly hash: string;
} {
  const [algorithm, salt, hash] = passwordHash.split(':');

  if (algorithm !== 'scrypt' || salt === undefined || hash === undefined) {
    throw new Error(
      `Invalid passwordHash: received "${passwordHash}"; expected "scrypt:<salt>:<hash>"`,
    );
  }

  return { salt, hash };
}
