import { Injectable } from '@nestjs/common';
import {
  DigitalSignalImpact,
  DigitalSignalName,
  OfferedService,
} from '../models/digital-signal.model';
import { calculateDigitalSignalImpact } from './signal-impact-calculator';

@Injectable()
export class DigitalSignalImpactService {
  calculateImpact(
    signalName: DigitalSignalName,
    offeredService: OfferedService,
  ): DigitalSignalImpact {
    const impactScore = calculateDigitalSignalImpact(signalName, offeredService);

    return {
      signalName,
      offeredService,
      impactScore,
    };
  }
}
