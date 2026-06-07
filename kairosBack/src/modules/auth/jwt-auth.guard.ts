import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtTokenService } from './jwt-token.service';
import { MutableAuthenticatedRequest } from './authenticated-request';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<MutableAuthenticatedRequest>();
    const token = extractBearerToken(request.headers.authorization);

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

function extractBearerToken(authorization: string | string[] | undefined): string {
  const header = Array.isArray(authorization) ? authorization[0] : authorization;

  if (header === undefined || !header.startsWith('Bearer ')) {
    throw new UnauthorizedException(
      `Invalid authorization header: received "${header}"; expected "Bearer <token>"`,
    );
  }

  return header.slice('Bearer '.length);
}
