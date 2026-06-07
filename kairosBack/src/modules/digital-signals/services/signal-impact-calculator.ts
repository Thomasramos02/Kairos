import {
  DigitalSignalName,
  OfferedService,
} from '../models/digital-signal.model';

const highImpactPairs = new Set<string>([
  'website-missing:website-design-development',
  'website-missing:branding',
  'domain-recently-registered:website-design-development',
  'website-incomplete:seo-local-seo',
  'local-presence-incomplete:seo-local-seo',
  'social-presence-misaligned:social-media-marketing',
  'social-profile-detected:social-media-marketing',
  'online-store-recently-launched:e-commerce-services',
  'business-contact-detected:website-design-development',
  'business-contact-detected:seo-local-seo',
  'business-contact-detected:paid-marketing',
  'business-contact-detected:social-media-marketing',
]);

export function calculateDigitalSignalImpact(
  signalName: DigitalSignalName,
  offeredService: OfferedService,
): number {
  const impactKey = `${signalName}:${offeredService}`;

  if (highImpactPairs.has(impactKey)) {
    return 90;
  }

  return 40;
}
