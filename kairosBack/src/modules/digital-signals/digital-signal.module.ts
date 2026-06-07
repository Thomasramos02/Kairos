import { Module } from '@nestjs/common';
import { DigitalSignalDetectorService } from './services/digital-signal-detector.service';
import { DigitalSignalImpactService } from './services/digital-signal-impact.service';
import { FetchDigitalSignalHttpClient } from './services/fetch-digital-signal-http.client';
import { RdapDomainRegistrationClient } from './services/rdap-domain-registration.client';

@Module({
  providers: [
    DigitalSignalDetectorService,
    DigitalSignalImpactService,
    {
      provide: FetchDigitalSignalHttpClient,
      useClass: FetchDigitalSignalHttpClient,
    },
    {
      provide: 'DigitalSignalHttpClient',
      useExisting: FetchDigitalSignalHttpClient,
    },
    {
      provide: RdapDomainRegistrationClient,
      useClass: RdapDomainRegistrationClient,
    },
    {
      provide: 'DomainRegistrationClient',
      useExisting: RdapDomainRegistrationClient,
    },
  ],
  exports: [DigitalSignalDetectorService, DigitalSignalImpactService],
})
export class DigitalSignalModule {}
