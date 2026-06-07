import { Injectable } from '@nestjs/common';
import {
  DomainRegistrationClient,
  DomainRegistrationLookup,
} from '../models/digital-signal-detection.model';
import { parseDomainRegisteredAt } from './domain-registration-date.parser';

@Injectable()
export class RdapDomainRegistrationClient implements DomainRegistrationClient {
  async lookupDomain(domainName: string): Promise<DomainRegistrationLookup | null> {
    try {
      return await lookupDomainRegistration(domainName);
    } catch {
      return null;
    }
  }
}

async function lookupDomainRegistration(
  domainName: string,
): Promise<DomainRegistrationLookup | null> {
  const response = await fetch(`https://rdap.org/domain/${domainName}`, {
    redirect: 'follow',
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    return null;
  }

  return {
    domainName,
    registeredAt: parseDomainRegisteredAt(await response.json()),
    sourceName: `rdap.org/domain/${domainName}`.slice(0, 120),
  };
}
