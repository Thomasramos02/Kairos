import { BadRequestException } from '@nestjs/common';
import { isOfferedService } from '../../../domain/offered-service';
import { resolveCoverageStatus } from '../../../domain/us-state';
import { CreateMarketTargetRequest } from '../dto/market-target.dto';

export function assertCreateMarketTargetRequest(
  request: CreateMarketTargetRequest,
): void {
  assertSupportedCountry(request.country);
  assertSupportedState(request.state);
  assertText(request.industry, 'industry');
  assertText(request.desiredCustomerType, 'desiredCustomerType');
  assertOfferedService(request.offeredService);
}

function assertSupportedCountry(country: string): void {
  if (country !== 'US') {
    throw new BadRequestException(
      `Invalid country: received "${country}"; expected "US"`,
    );
  }
}

function assertSupportedState(state: string): void {
  if (resolveCoverageStatus(state) === 'unavailable') {
    throw new BadRequestException(
      `Invalid state: received "${state}"; expected supported US state code`,
    );
  }
}

function assertText(value: string, fieldName: string): void {
  if (value.trim().length === 0) {
    throw new BadRequestException(
      `Invalid ${fieldName}: received "${value}"; expected non-empty text`,
    );
  }
}

function assertOfferedService(offeredService: string): void {
  if (!isOfferedService(offeredService)) {
    throw new BadRequestException(
      `Invalid offeredService: received "${offeredService}"; expected supported service`,
    );
  }
}
