import {
  DomainRegistrationClient,
  DomainRegistrationLookup,
  DigitalSignalHttpClient,
  WebsiteFetchResult,
} from '../models/digital-signal-detection.model';
import { DiscoveredBusiness } from '../../businesses/models/business.model';
import { DigitalSignalDetectorService } from './digital-signal-detector.service';

class MissingWebsiteHttpClient implements DigitalSignalHttpClient {
  async fetchHtml(_url: string): Promise<WebsiteFetchResult | null> {
    return null;
  }
}

class ShopifyWebsiteHttpClient implements DigitalSignalHttpClient {
  async fetchHtml(url: string): Promise<WebsiteFetchResult | null> {
    return {
      requestedUrl: url,
      finalUrl: url,
      statusCode: 200,
      html: '<html><script src="cdn.shopify.com"></script></html>'.repeat(80),
    };
  }
}

class IncompleteWebsiteHttpClient implements DigitalSignalHttpClient {
  async fetchHtml(url: string): Promise<WebsiteFetchResult | null> {
    return {
      requestedUrl: url,
      finalUrl: url,
      statusCode: 200,
      html: '<html>Coming soon</html>',
    };
  }
}

class SocialWebsiteHttpClient implements DigitalSignalHttpClient {
  async fetchHtml(url: string): Promise<WebsiteFetchResult | null> {
    return {
      requestedUrl: url,
      finalUrl: url,
      statusCode: 200,
      html: '<a href="https://instagram.com/sunrisebakery">Instagram</a>'.repeat(80),
    };
  }
}

class ContactWebsiteHttpClient implements DigitalSignalHttpClient {
  async fetchHtml(url: string): Promise<WebsiteFetchResult | null> {
    return {
      requestedUrl: url,
      finalUrl: url,
      statusCode: 200,
      html: [
        '<a href="mailto:hello@sunrisebakery.com">Email</a>',
        '<a href="tel:+13055551234">Phone</a>',
      ].join('').repeat(80),
    };
  }
}

class MissingDomainRegistrationClient implements DomainRegistrationClient {
  async lookupDomain(_domainName: string): Promise<DomainRegistrationLookup | null> {
    return null;
  }
}

class RecentDomainRegistrationClient implements DomainRegistrationClient {
  async lookupDomain(domainName: string): Promise<DomainRegistrationLookup | null> {
    return {
      domainName,
      registeredAt: new Date(),
      sourceName: `rdap.org/domain/${domainName}`,
    };
  }
}

describe('DigitalSignalDetectorService', () => {
  it('detects missing websites from unreachable candidates', async () => {
    const detector = new DigitalSignalDetectorService(
      new MissingWebsiteHttpClient(),
      new MissingDomainRegistrationClient(),
    );
    const signals = await detector.detectSignals(createBusiness());

    expect(signals).toEqual([
      {
        signalName: 'website-missing',
        sourceName: 'candidate domain check for Sunrise Bakery LLC',
        confidenceScore: 85,
      },
    ]);
  });

  it('detects Shopify stores from reachable HTML', async () => {
    const detector = new DigitalSignalDetectorService(
      new ShopifyWebsiteHttpClient(),
      new MissingDomainRegistrationClient(),
    );
    const signals = await detector.detectSignals(createBusiness());

    expect(signals.map((signal) => signal.signalName)).toContain(
      'online-store-recently-launched',
    );
    expect(signals.map((signal) => signal.signalName)).toContain(
      'website-technology-detected',
    );
  });

  it('detects incomplete websites from placeholder HTML', async () => {
    const detector = new DigitalSignalDetectorService(
      new IncompleteWebsiteHttpClient(),
      new MissingDomainRegistrationClient(),
    );
    const signals = await detector.detectSignals(createBusiness());

    expect(signals.map((signal) => signal.signalName)).toContain(
      'website-incomplete',
    );
  });

  it('detects recently registered domains from RDAP data', async () => {
    const detector = new DigitalSignalDetectorService(
      new IncompleteWebsiteHttpClient(),
      new RecentDomainRegistrationClient(),
    );
    const signals = await detector.detectSignals(createBusiness());

    expect(signals.map((signal) => signal.signalName)).toContain(
      'domain-recently-registered',
    );
  });

  it('returns social profile metadata when a website links to social profiles', async () => {
    const detector = new DigitalSignalDetectorService(
      new SocialWebsiteHttpClient(),
      new MissingDomainRegistrationClient(),
    );
    const signals = await detector.detectSignals(createBusiness());
    const socialSignal = signals.find(
      (signal) => signal.signalName === 'social-profile-detected',
    );

    expect(socialSignal?.metadata?.socialProfiles).toEqual([
      { network: 'instagram', url: 'https://instagram.com/sunrisebakery' },
    ]);
  });

  it('returns contact metadata when a website publishes contact options', async () => {
    const detector = new DigitalSignalDetectorService(
      new ContactWebsiteHttpClient(),
      new MissingDomainRegistrationClient(),
    );
    const signals = await detector.detectSignals(createBusiness());
    const contactSignal = signals.find(
      (signal) => signal.signalName === 'business-contact-detected',
    );

    expect(contactSignal?.metadata?.contactMethods).toEqual([
      {
        confidenceScore: 85,
        source: 'website',
        type: 'email',
        value: 'hello@sunrisebakery.com',
      },
      {
        confidenceScore: 80,
        source: 'website',
        type: 'phone',
        value: '+13055551234',
      },
    ]);
  });
});

function createBusiness(): DiscoveredBusiness {
  return {
    id: 'biz_1',
    sourceDocumentNumber: 'L26000000001',
    legalName: 'Sunrise Bakery LLC',
    state: 'FL',
    city: 'Miami',
    industry: 'food-service',
    archivedAt: null,
    lifecycleStage: 'candidate',
    registeredAt: new Date('2026-01-01T00:00:00.000Z'),
    sourceName: 'Florida public registry',
  };
}
