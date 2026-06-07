import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
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
}
