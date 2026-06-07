import { JwtTokenService } from './jwt-token.service';

describe('JwtTokenService', () => {
  const previousSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-chars';
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/kairos';
    process.env.VALKEY_URL = 'redis://localhost:6379';
  });

  afterAll(() => {
    process.env.JWT_SECRET = previousSecret;
  });

  it('creates and verifies access tokens', () => {
    const jwtTokenService = new JwtTokenService();
    const accessToken = jwtTokenService.createAccessToken({
      accountId: 'user_1',
      email: 'test@example.com',
    });

    expect(jwtTokenService.verifyAccessToken(accessToken)).toEqual({
      accountId: 'user_1',
      email: 'test@example.com',
    });
  });

  it('throws an exception with context for malformed tokens', () => {
    const jwtTokenService = new JwtTokenService();

    expect(() => jwtTokenService.verifyAccessToken('bad')).toThrow(/expected three/);
  });
});
