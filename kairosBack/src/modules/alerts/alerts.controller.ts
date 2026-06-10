import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAlertRequest } from './dto/alert.dto';
import { AlertsService } from './alerts.service';
import { AlertEvent } from './models/alert.model';

@Controller()
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post('/alerts')
  async createAlert(@Body() request: CreateAlertRequest): Promise<AlertEvent> {
    return await this.alertsService.createAlert(request);
  }

  @Get('/accounts/:accountId/alerts')
  async listByAccount(
    @Param('accountId') accountId: string,
  ): Promise<readonly AlertEvent[]> {
    return await this.alertsService.listByAccount(accountId);
  }

  @Patch('/alerts/:id/read')
  async markAsRead(@Param('id') id: string): Promise<AlertEvent> {
    return await this.alertsService.markAsRead(id);
  }

  @Delete('/alerts/:id')
  async delete(@Param('id') id: string): Promise<AlertEvent> {
    return await this.alertsService.delete(id);
  }

  @Get('/accounts/:accountId/alerts/unread-count')
  async countUnread(
    @Param('accountId') accountId: string,
  ): Promise<{ readonly count: number }> {
    const count = await this.alertsService.countUnreadByAccount(accountId);
    return { count };
  }
}
