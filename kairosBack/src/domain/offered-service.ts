export const offeredServices = [
  'website-design-development',
  'branding',
  'seo-local-seo',
  'paid-marketing',
  'social-media-marketing',
  'e-commerce-services',
] as const;

export type OfferedService = (typeof offeredServices)[number];

export function isOfferedService(value: string): value is OfferedService {
  return offeredServices.includes(value as OfferedService);
}
