import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { AccountsController } from './accounts.controller';
import { AccountsRepository } from './accounts.repository';
import { AccountsService } from './accounts.service';
import { PasswordHasherService } from './services/password-hasher.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [AccountsController],
  providers: [AccountsRepository, AccountsService, PasswordHasherService],
  exports: [AccountsService],
})
export class AccountsModule {}
