import { Module } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtTokenService } from './jwt-token.service';

@Module({
  providers: [JwtAuthGuard, JwtTokenService],
  exports: [JwtAuthGuard, JwtTokenService],
})
export class AuthModule {}
