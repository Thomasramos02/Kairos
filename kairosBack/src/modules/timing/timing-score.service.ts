import { Injectable } from '@nestjs/common';
import { TimingScoreInput, TimingScoreResult } from './models/timing-score.model';
import { calculateTimingScore } from './services/timing-score-calculator';

@Injectable()
export class TimingScoreService {
  calculate(timingScoreInput: TimingScoreInput): TimingScoreResult {
    return calculateTimingScore(timingScoreInput);
  }
}
