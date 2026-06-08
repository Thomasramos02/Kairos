import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { BusinessModule } from './modules/businesses/business.module';
import { CoverageModule } from '@modules/coverage/coverage.module';
import { DigitalSignalModule } from './modules/digital-signals/digital-signal.module';
import { ExportsModule } from './modules/exports/exports.module';
import { MarketTargetsModule } from './modules/market-targets/market-targets.module';
import { OutreachModule } from './modules/outreach/outreach.module';
import { WatchlistModule } from './modules/watchlist/watchlist.module';
import { OutboxModule } from './outbox/outbox.module';
import { QueueModule } from './queue/queue.module';
import { WorkersModule } from './workers/workers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', '..', 'kairosFront', 'out'),
    exclude: ['/kairos-api{/*path}'],
  }),
    DatabaseModule,
    QueueModule,
    OutboxModule,
    AccountsModule,
    AlertsModule,
    BusinessModule,
    CoverageModule,
    DigitalSignalModule,
    ExportsModule,
    MarketTargetsModule,
    OutreachModule,
    WatchlistModule,
    WorkersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
