import { Injectable } from '@nestjs/common';
import { BusinessRegistrySource } from './business-registry-source';
import { ConnecticutBusinessRegistryClient } from './connecticut-business-registry.client';
import { IowaBusinessEntityClient } from './iowa-business-entity.client';
import { OregonActiveBusinessesClient } from './oregon-active-businesses.client';
import { RhodeIslandWeeklyCorporationsClient } from './rhode-island-weekly-corporations.client';
import { SeattleBusinessLicenseClient } from './seattle-business-license.client';

@Injectable()
export class BusinessRegistrySourceResolver {
  constructor(
    private readonly connecticutClient: ConnecticutBusinessRegistryClient,
    private readonly iowaClient: IowaBusinessEntityClient,
    private readonly oregonClient: OregonActiveBusinessesClient,
    private readonly rhodeIslandClient: RhodeIslandWeeklyCorporationsClient,
    private readonly seattleClient: SeattleBusinessLicenseClient,
  ) {}

  resolveSource(state: string): BusinessRegistrySource {
    const normalizedState = state.trim().toUpperCase();

    if (normalizedState === 'CT') {
      return this.connecticutClient;
    }

    if (normalizedState === 'RI') {
      return this.rhodeIslandClient;
    }

    if (normalizedState === 'WA') {
      return this.seattleClient;
    }

    if (normalizedState === 'OR') {
      return this.oregonClient;
    }

    if (normalizedState === 'IA') {
      return this.iowaClient;
    }

    throw new Error(
      `Unsupported business registry state: received "${state}"; expected CT, RI, WA, OR or IA`,
    );
  }
}
