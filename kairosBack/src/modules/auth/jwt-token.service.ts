import { createHmac, timingSafeEqual } from 'crypto';
import { Injectable } from '@nestjs/common';
import { readKairosEnvironment } from '../../config/kairos-environment';
import { AuthenticatedUser } from './authenticated-request';

type JwtHeader = {
  readonly alg: 'HS256';
  readonly typ: 'JWT';
};

type JwtPayload = AuthenticatedUser & {
  readonly exp: number;
};

@Injectable()
export class JwtTokenService {
  createAccessToken(user: AuthenticatedUser): string {
    const header: JwtHeader = { alg: 'HS256', typ: 'JWT' };
    const payload: JwtPayload = {
      ...user,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    };

    return signToken(header, payload, readKairosEnvironment(process.env).jwtSecret);
  }

  verifyAccessToken(token: string): AuthenticatedUser {
    const payload = verifyToken(token, readKairosEnvironment(process.env).jwtSecret);

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error(`Expired JWT: received exp ${payload.exp}; expected future timestamp`);
    }

    return { accountId: payload.accountId, email: payload.email };
  }
}

function signToken(header: JwtHeader, payload: JwtPayload, secret: string): string {
  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = createTokenSignature(encodedHeader, encodedPayload, secret);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyToken(token: string, secret: string): JwtPayload {
  const [encodedHeader, encodedPayload, signature] = token.split('.');

  if (encodedHeader === undefined || encodedPayload === undefined || signature === undefined) {
    throw new Error(`Invalid JWT: received "${token}"; expected three token segments`);
  }

  const expectedSignature = createTokenSignature(encodedHeader, encodedPayload, secret);
  const receivedSignature = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (!timingSafeEqual(receivedSignature, expectedBuffer)) {
    throw new Error('Invalid JWT signature: received non-matching signature; expected HS256');
  }

  return JSON.parse(decodeBase64Url(encodedPayload)) as JwtPayload;
}

function createTokenSignature(
  encodedHeader: string,
  encodedPayload: string,
  secret: string,
): string {
  return createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value).toString('base64url');
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}
