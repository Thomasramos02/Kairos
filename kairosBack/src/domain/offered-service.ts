export const offeredServices = [
  'website-design-development',
  'landing-page-creation',
  'branding',
  'logo-design',
  'seo-local-seo',
  'google-business-profile-local-presence',
] as const;

export type OfferedService = (typeof offeredServices)[number];

export function isOfferedService(value: string): value is OfferedService {
  return offeredServices.includes(value as OfferedService);
}
