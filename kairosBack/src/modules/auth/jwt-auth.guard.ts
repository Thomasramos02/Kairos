import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtTokenService } from './jwt-token.service';
import { MutableAuthenticatedRequest } from './authenticated-request';

const kairosTokenCookieName = 'kairos_token';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<MutableAuthenticatedRequest>();
    const token = resolveToken(request);

    try {
      request.user = this.jwtTokenService.verifyAccessToken(token);
      return true;
    } catch (error) {
      throw new UnauthorizedException(
        `Invalid authorization token: received "${token}"; expected valid Bearer JWT`,
      );
    }
  }
}

function resolveToken(request: MutableAuthenticatedRequest): string {
  const fromCookie = request.cookies?.[kairosTokenCookieName];
  if (fromCookie !== undefined && fromCookie.length > 0) {
    return fromCookie;
  }

  return extractBearerToken(request.headers.authorization);
}

function extractBearerToken(authorization: string | string[] | undefined): string {
  const header = Array.isArray(authorization) ? authorization[0] : authorization;

  if (header === undefined || !header.startsWith('Bearer ')) {
    throw new UnauthorizedException(
      `Invalid authorization: no cookie or authorization header found; expected "kairos_token" cookie or "Bearer <token>" header`,
    );
  }

  return header.slice('Bearer '.length);
}
