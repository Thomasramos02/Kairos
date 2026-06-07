import { Injectable } from '@nestjs/common';
import { TimingStageHistoryEntry } from './models/timing-stage-history.model';
import { TimingHistoryRepository } from './timing-history.repository';

@Injectable()
export class TimingHistoryService {
  constructor(private readonly timingHistoryRepository: TimingHistoryRepository) {}

  async listByBusiness(
    businessId: string,
  ): Promise<readonly TimingStageHistoryEntry[]> {
    return await this.timingHistoryRepository.listByBusiness(businessId);
  }
}
