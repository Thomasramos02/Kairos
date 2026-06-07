import { Inject, Injectable } from '@nestjs/common';
import { DiscoveredBusiness } from '../../businesses/models/business.model';
import {
  DigitalSignalDetection,
  DomainRegistrationClient,
  DigitalSignalHttpClient,
  WebsiteFetchResult,
} from '../models/digital-signal-detection.model';
import { buildWebsiteCandidateUrls } from './business-website-candidate.builder';
import { extractDomainNameFromUrl } from './domain-name.extractor';
import { isRecentlyRegisteredDomain } from './recent-domain-registration.detector';
import { analyzeWebsiteHtml } from './website-html-analyzer';

@Injectable()
export class DigitalSignalDetectorService {
  constructor(
    @Inject('DigitalSignalHttpClient')
    private readonly httpClient: DigitalSignalHttpClient,
    @Inject('DomainRegistrationClient')
    private readonly domainRegistrationClient: DomainRegistrationClient,
  ) {}

  async detectSignals(
    business: DiscoveredBusiness,
  ): Promise<readonly DigitalSignalDetection[]> {
    const website = await this.findReachableWebsite(business);

    if (website === null) {
      return [createWebsiteMissingSignal(business.legalName)];
    }

    return [
      ...(await this.detectDomainSignals(website)),
      ...analyzeReachableWebsite(website),
    ];
  }

  private async findReachableWebsite(
    business: DiscoveredBusiness,
  ): Promise<WebsiteFetchResult | null> {
    for (const candidateUrl of buildWebsiteCandidateUrls(business.legalName, business.city)) {
      const website = await this.httpClient.fetchHtml(candidateUrl);

      if (website !== null) {
        return website;
      }
    }

    return null;
  }

  private async detectDomainSignals(
    website: WebsiteFetchResult,
  ): Promise<readonly DigitalSignalDetection[]> {
    const domainName = extractDomainNameFromUrl(website.finalUrl);
    const registration = await this.domainRegistrationClient.lookupDomain(domainName);

    if (registration === null || registration.registeredAt === null) {
      return [];
    }

    if (!isRecentlyRegisteredDomain(registration.registeredAt, new Date())) {
      return [];
    }

    return [createRecentDomainSignal(registration.sourceName)];
  }
}

function createWebsiteMissingSignal(businessName: string): DigitalSignalDetection {
  return {
    signalName: 'website-missing',
    sourceName: `candidate domain check for ${businessName}`.slice(0, 120),
    confidenceScore: 85,
  };
}

function analyzeReachableWebsite(
  website: WebsiteFetchResult,
): readonly DigitalSignalDetection[] {
  const analysis = analyzeWebsiteHtml(website.html);

  return [
    ...(analysis.isIncomplete ? [createIncompleteSignal(website)] : []),
    ...(analysis.technologies.length > 0
      ? [createTechnologySignal(website, analysis.technologies)]
      : []),
    ...(analysis.hasRecentlyLaunchedStore ? [createStoreSignal(website)] : []),
    ...(analysis.hasIncompleteLocalPresence ? [createLocalPresenceSignal(website)] : []),
    ...(analysis.contactMethods.length > 0
      ? [createContactSignal(website, analysis.contactMethods)]
      : []),
    ...createSocialSignals(website, analysis),
  ];
}

function createIncompleteSignal(
  website: WebsiteFetchResult,
): DigitalSignalDetection {
  return {
    signalName: 'website-incomplete',
    sourceName: website.finalUrl.slice(0, 120),
    confidenceScore: 75,
    metadata: { websiteUrl: website.finalUrl },
  };
}

function createTechnologySignal(
  website: WebsiteFetchResult,
  technologies: readonly string[],
): DigitalSignalDetection {
  return {
    signalName: 'website-technology-detected',
    sourceName: website.finalUrl.slice(0, 120),
    confidenceScore: 70,
    metadata: { technologies, websiteUrl: website.finalUrl },
  };
}

function createStoreSignal(website: WebsiteFetchResult): DigitalSignalDetection {
  return {
    signalName: 'online-store-recently-launched',
    sourceName: website.finalUrl.slice(0, 120),
    confidenceScore: 70,
    metadata: { websiteUrl: website.finalUrl },
  };
}

function createRecentDomainSignal(sourceName: string): DigitalSignalDetection {
  return {
    signalName: 'domain-recently-registered',
    sourceName: sourceName.slice(0, 120),
    confidenceScore: 80,
  };
}

function createLocalPresenceSignal(
  website: WebsiteFetchResult,
): DigitalSignalDetection {
  return {
    signalName: 'local-presence-incomplete',
    sourceName: website.finalUrl.slice(0, 120),
    confidenceScore: 65,
    metadata: { websiteUrl: website.finalUrl },
  };
}

function createContactSignal(
  website: WebsiteFetchResult,
  contactMethods: ReturnType<typeof analyzeWebsiteHtml>['contactMethods'],
): DigitalSignalDetection {
  return {
    signalName: 'business-contact-detected',
    sourceName: website.finalUrl.slice(0, 120),
    confidenceScore: resolveContactConfidence(contactMethods),
    metadata: { contactMethods, websiteUrl: website.finalUrl },
  };
}

function resolveContactConfidence(
  contactMethods: ReturnType<typeof analyzeWebsiteHtml>['contactMethods'],
): number {
  const topConfidence = Math.max(
    ...contactMethods.map((contact) => contact.confidenceScore),
  );

  return Math.min(90, topConfidence + contactMethods.length * 3);
}

function createSocialSignals(
  website: WebsiteFetchResult,
  analysis: ReturnType<typeof analyzeWebsiteHtml>,
): readonly DigitalSignalDetection[] {
  if (analysis.hasMisalignedSocialPresence) {
    return [createMissingSocialPresenceSignal(website)];
  }

  return [createSocialProfileSignal(website, analysis.socialProfiles)];
}

function createMissingSocialPresenceSignal(
  website: WebsiteFetchResult,
): DigitalSignalDetection {
  return {
    signalName: 'social-presence-misaligned',
    sourceName: website.finalUrl.slice(0, 120),
    confidenceScore: 60,
    metadata: { websiteUrl: website.finalUrl },
  };
}

function createSocialProfileSignal(
  website: WebsiteFetchResult,
  socialProfiles: ReturnType<typeof analyzeWebsiteHtml>['socialProfiles'],
): DigitalSignalDetection {
  return {
    signalName: 'social-profile-detected',
    sourceName: website.finalUrl.slice(0, 120),
    confidenceScore: 70,
    metadata: { socialProfiles, websiteUrl: website.finalUrl },
  };
}
