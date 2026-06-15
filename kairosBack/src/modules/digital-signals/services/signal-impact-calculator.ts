import {
  DigitalSignalName,
  OfferedService,
} from '../models/digital-signal.model';

const highImpactPairs = new Set<string>([
  'website-missing:website-design-development',
  'website-missing:landing-page-creation',
  'website-missing:branding',
  'website-missing:logo-design',
  'domain-recently-registered:website-design-development',
  'domain-recently-registered:landing-page-creation',
  'website-incomplete:seo-local-seo',
  'website-incomplete:landing-page-creation',
  'local-presence-incomplete:seo-local-seo',
  'local-presence-incomplete:google-business-profile-local-presence',
  'social-presence-misaligned:branding',
  'social-presence-misaligned:logo-design',
  'business-contact-detected:website-design-development',
  'business-contact-detected:seo-local-seo',
  'business-contact-detected:landing-page-creation',
  'business-contact-detected:google-business-profile-local-presence',
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
