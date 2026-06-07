import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TimingStageHistoryEntry } from './models/timing-stage-history.model';
import { TimingHistoryService } from './timing-history.service';

@Controller('/businesses')
@UseGuards(JwtAuthGuard)
export class TimingHistoryController {
  constructor(private readonly timingHistoryService: TimingHistoryService) {}

  @Get('/:businessId/timing-history')
  async listByBusiness(
    @Param('businessId') businessId: string,
  ): Promise<readonly TimingStageHistoryEntry[]> {
    return await this.timingHistoryService.listByBusiness(businessId);
  }
}
