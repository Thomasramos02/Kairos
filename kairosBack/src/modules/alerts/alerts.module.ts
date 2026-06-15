import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { AccountsModule } from '../accounts/accounts.module';
import { AlertsController } from './alerts.controller';
import { AlertsRepository } from './alerts.repository';
import { AlertsService } from './alerts.service';
import { AlertDeliveryService } from './services/alert-delivery.service';
import { SmtpEmailAlertChannelSender } from './services/resend-email-alert-channel.sender';
import { TelegramAlertChannelSender } from './services/telegram-alert-channel.sender';

@Module({
  imports: [AuthModule, AccountsModule, DatabaseModule],
  controllers: [AlertsController],
  providers: [
    AlertDeliveryService,
    AlertsRepository,
    AlertsService,
    SmtpEmailAlertChannelSender,
    TelegramAlertChannelSender,
  ],
  exports: [AlertsService],
})
export class AlertsModule {}
