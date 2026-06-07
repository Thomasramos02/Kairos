import {
  DigitalSignalMetadata,
  DigitalSignalName,
} from './digital-signal.model';

export type DigitalSignalDetection = {
  readonly signalName: DigitalSignalName;
  readonly sourceName: string;
  readonly confidenceScore: number;
  readonly metadata?: DigitalSignalMetadata;
};

export type WebsiteFetchResult = {
  readonly requestedUrl: string;
  readonly finalUrl: string;
  readonly statusCode: number;
  readonly html: string;
};

export type DigitalSignalHttpClient = {
  fetchHtml(url: string): Promise<WebsiteFetchResult | null>;
};

export type DomainRegistrationLookup = {
  readonly domainName: string;
  readonly registeredAt: Date | null;
  readonly sourceName: string;
};

export type DomainRegistrationClient = {
  lookupDomain(domainName: string): Promise<DomainRegistrationLookup | null>;
};
