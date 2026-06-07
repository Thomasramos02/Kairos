import { OfferedService } from '../../../domain/offered-service';

export type { OfferedService };

export type DigitalSignalName =
  | 'website-missing'
  | 'domain-recently-registered'
  | 'website-incomplete'
  | 'local-presence-incomplete'
  | 'social-presence-misaligned'
  | 'social-profile-detected'
  | 'online-store-recently-launched'
  | 'website-technology-detected'
  | 'business-contact-detected';

export type DigitalSignalImpact = {
  readonly signalName: DigitalSignalName;
  readonly offeredService: OfferedService;
  readonly impactScore: number;
};

export type SocialNetworkName =
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'tiktok'
  | 'twitter'
  | 'x'
  | 'youtube';

export type DigitalSignalSocialProfile = {
  readonly network: SocialNetworkName;
  readonly url: string;
};

export type BusinessContactMethod = {
  readonly type:
    | 'phone'
    | 'email'
    | 'contact-form'
    | 'address'
    | 'agent'
    | 'officer'
    | 'license';
  readonly value: string;
  readonly source: 'registry' | 'website' | 'license' | 'county-btr';
  readonly confidenceScore: number;
  readonly label?: string;
};

export type DigitalSignalMetadata = {
  readonly contactMethods?: readonly BusinessContactMethod[];
  readonly socialProfiles?: readonly DigitalSignalSocialProfile[];
  readonly technologies?: readonly string[];
  readonly websiteUrl?: string;
};
