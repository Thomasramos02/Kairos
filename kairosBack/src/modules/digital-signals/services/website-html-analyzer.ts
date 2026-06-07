import {
  BusinessContactMethod,
  DigitalSignalSocialProfile,
} from '../models/digital-signal.model';

export type WebsiteTechnologyAnalysis = {
  readonly isIncomplete: boolean;
  readonly technologies: readonly string[];
  readonly hasRecentlyLaunchedStore: boolean;
  readonly hasIncompleteLocalPresence: boolean;
  readonly hasMisalignedSocialPresence: boolean;
  readonly contactMethods: readonly BusinessContactMethod[];
  readonly socialProfiles: readonly DigitalSignalSocialProfile[];
};

export function analyzeWebsiteHtml(html: string): WebsiteTechnologyAnalysis {
  const normalizedHtml = html.toLowerCase();

  const socialProfiles = extractSocialProfiles(html);

  return {
    contactMethods: extractContactMethods(html),
    isIncomplete: isIncompleteWebsite(normalizedHtml),
    technologies: detectWebsiteTechnologies(normalizedHtml),
    hasRecentlyLaunchedStore: hasShopifySignal(normalizedHtml),
    hasIncompleteLocalPresence: hasIncompleteLocalPresence(normalizedHtml),
    hasMisalignedSocialPresence: socialProfiles.length === 0,
    socialProfiles,
  };
}

function extractContactMethods(html: string): readonly BusinessContactMethod[] {
  const contacts = new Map<string, BusinessContactMethod>();

  addEmailContacts(contacts, html);
  addPhoneContacts(contacts, html);
  addContactFormContacts(contacts, html);

  return [...contacts.values()].slice(0, 6);
}

function addEmailContacts(
  contacts: Map<string, BusinessContactMethod>,
  html: string,
): void {
  const emailMatches = html.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) ?? [];

  for (const email of emailMatches) {
    const normalizedEmail = email.toLowerCase();
    addContact(contacts, {
      confidenceScore: normalizedEmail.includes('@example.') ? 40 : 85,
      source: 'website',
      type: 'email',
      value: normalizedEmail,
    });
  }
}

function addPhoneContacts(
  contacts: Map<string, BusinessContactMethod>,
  html: string,
): void {
  const phoneMatches = html.match(/\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g) ?? [];

  for (const phone of phoneMatches) {
    addContact(contacts, {
      confidenceScore: 80,
      source: 'website',
      type: 'phone',
      value: normalizePhoneNumber(phone),
    });
  }
}

function addContactFormContacts(
  contacts: Map<string, BusinessContactMethod>,
  html: string,
): void {
  const linkMatches = html.match(/href=["']([^"']*(contact|quote|book|appointment)[^"']*)["']/gi) ?? [];

  for (const link of linkMatches) {
    const value = link.replace(/^href=["']|["']$/gi, '');
    addContact(contacts, {
      confidenceScore: 65,
      source: 'website',
      type: 'contact-form',
      value,
    });
  }
}

function addContact(
  contacts: Map<string, BusinessContactMethod>,
  contact: BusinessContactMethod,
): void {
  contacts.set(`${contact.type}:${contact.value}`, contact);
}

function normalizePhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '');

  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  return value.trim();
}

function isIncompleteWebsite(normalizedHtml: string): boolean {
  if (normalizedHtml.trim().length < 800) {
    return true;
  }

  return ['coming soon', 'under construction', 'domain for sale'].some((phrase) =>
    normalizedHtml.includes(phrase),
  );
}

function detectWebsiteTechnologies(normalizedHtml: string): readonly string[] {
  return [
    detectTechnology(normalizedHtml, 'shopify', 'Shopify'),
    detectTechnology(normalizedHtml, 'wp-content', 'WordPress'),
    detectTechnology(normalizedHtml, 'static.parastorage.com', 'Wix'),
    detectTechnology(normalizedHtml, 'squarespace', 'Squarespace'),
  ].filter((technology): technology is string => technology !== null);
}

function detectTechnology(
  normalizedHtml: string,
  marker: string,
  technologyName: string,
): string | null {
  return normalizedHtml.includes(marker) ? technologyName : null;
}

function hasShopifySignal(normalizedHtml: string): boolean {
  return normalizedHtml.includes('shopify') || normalizedHtml.includes('myshopify.com');
}

function hasIncompleteLocalPresence(normalizedHtml: string): boolean {
  const hasLocalSchema = normalizedHtml.includes('localbusiness');
  const hasPhone = /\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(
    normalizedHtml,
  );
  const hasAddress = /\b(street|st\.|avenue|ave\.|road|rd\.|boulevard|blvd|suite)\b/.test(
    normalizedHtml,
  );

  return !hasLocalSchema && (!hasPhone || !hasAddress);
}

function extractSocialProfiles(
  html: string,
): readonly DigitalSignalSocialProfile[] {
  const socialProfiles = new Map<string, DigitalSignalSocialProfile>();
  const linkPattern = /https?:\/\/[^"'<>\s]+/gi;
  const matches = html.match(linkPattern) ?? [];

  for (const url of matches) {
    addSocialProfile(socialProfiles, url);
  }

  return [...socialProfiles.values()];
}

function addSocialProfile(
  socialProfiles: Map<string, DigitalSignalSocialProfile>,
  url: string,
): void {
  const network = detectSocialNetwork(url);

  if (network === null) {
    return;
  }

  socialProfiles.set(`${network}:${url}`, { network, url });
}

function detectSocialNetwork(
  url: string,
): DigitalSignalSocialProfile['network'] | null {
  const normalizedUrl = url.toLowerCase();

  if (normalizedUrl.includes('facebook.com/')) return 'facebook';
  if (normalizedUrl.includes('instagram.com/')) return 'instagram';
  if (normalizedUrl.includes('linkedin.com/')) return 'linkedin';
  if (normalizedUrl.includes('tiktok.com/')) return 'tiktok';
  if (normalizedUrl.includes('twitter.com/')) return 'twitter';
  if (normalizedUrl.includes('youtube.com/')) return 'youtube';
  if (normalizedUrl.includes('x.com/')) return 'x';

  return null;
}
