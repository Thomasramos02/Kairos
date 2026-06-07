import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { TimingHistoryController } from './timing-history.controller';
import { TimingHistoryRepository } from './timing-history.repository';
import { TimingHistoryService } from './timing-history.service';
import { TimingScoresRepository } from './timing-scores.repository';
import { TimingScoreService } from './timing-score.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [TimingHistoryController],
  providers: [
    TimingHistoryRepository,
    TimingHistoryService,
    TimingScoreService,
    TimingScoresRepository,
  ],
  exports: [
    TimingHistoryRepository,
    TimingHistoryService,
    TimingScoreService,
    TimingScoresRepository,
  ],
})
export class TimingModule {}
