import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAlertRequest } from './dto/alert.dto';
import { AlertsRepository } from './alerts.repository';
import { AlertEvent } from './models/alert.model';
import { AlertDeliveryService } from './services/alert-delivery.service';

@Injectable()
export class AlertsService {
  constructor(
    private readonly alertsRepository: AlertsRepository,
    private readonly alertDeliveryService: AlertDeliveryService,
  ) {}

  async createAlert(request: CreateAlertRequest): Promise<AlertEvent> {
    assertAlertRequest(request);

    const alertEvent = await this.alertsRepository.createAlert(
      request.accountId,
      request.businessId,
      request.reason,
    );
    await this.alertDeliveryService.deliverAlert(alertEvent);

    return alertEvent;
  }

  async listByAccount(accountId: string): Promise<readonly AlertEvent[]> {
    return await this.alertsRepository.listByAccount(accountId);
  }
}

function assertAlertRequest(request: CreateAlertRequest): void {
  if (request.accountId.trim().length === 0 || request.businessId.trim().length === 0) {
    throw new BadRequestException(
      `Invalid alert request: received accountId "${request.accountId}" and businessId "${request.businessId}"; expected non-empty ids`,
    );
  }
}
