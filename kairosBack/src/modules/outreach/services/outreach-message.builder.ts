import { OutreachSuggestionRequest } from '../models/outreach.model';

const offeredServiceLabels = {
  'website-design-development': 'website design and development',
  'landing-page-creation': 'a focused landing page',
  branding: 'brand clarity',
  'logo-design': 'a clearer logo and visual identity',
  'seo-local-seo': 'local SEO',
  'google-business-profile-local-presence': 'Google Business Profile and local presence setup',
} as const;

const digitalSignalLabels = {
  'website-missing': 'I could not find a clear website connected to the business',
  'domain-recently-registered': 'the domain looks newly registered',
  'website-incomplete': 'the website looks early or unfinished',
  'local-presence-incomplete': 'the local presence looks incomplete',
  'social-presence-misaligned': 'the social presence looks hard to connect',
  'social-profile-detected': 'the social profiles are available for context',
  'online-store-recently-launched': 'the online store looks newly launched',
  'website-technology-detected': 'the website stack is visible',
  'business-contact-detected': 'a public business contact option is visible',
} as const;

const timingStageLabels = {
  'too-early': 'still looks early',
  'warming-up': 'looks like it is getting organized',
  'best-window': 'looks like it may be in a timely outreach window',
  'cooling-down': 'may still be worth a focused follow-up',
  'old-lead': 'is no longer brand new, but the signal may still matter',
} as const;

export function buildOutreachMessage(
  request: OutreachSuggestionRequest,
): string {
  const businessName = normalizeRequiredText(
    request.businessName,
    'businessName',
  );
  const signalContext = digitalSignalLabels[request.signalName];
  const offeredService = offeredServiceLabels[request.offeredService];
  const timingContext = buildTimingContext(request);

  return [
    `Hi ${businessName}, I noticed ${signalContext} while checking newly registered businesses${timingContext}.`,
    `If you are still setting things up, ${offeredService} may help make the first customer touchpoints easier to trust.`,
    buildSignalImpactSentence(request),
    'Would it be useful if I sent over one or two specific improvements I would prioritize first?',
  ].join(' ');
}

function buildTimingContext(request: OutreachSuggestionRequest): string {
  if (request.timingStage === undefined) {
    return ''
  }

  return `, and the business ${timingStageLabels[request.timingStage]}`;
}

function buildSignalImpactSentence(request: OutreachSuggestionRequest): string {
  const signalImpact = request.signalImpact?.trim();

  if (signalImpact !== undefined && signalImpact.length > 0) {
    return `That signal stood out because ${signalImpact}.`;
  }

  const timingReason = request.timingReason?.trim();

  if (timingReason === undefined || timingReason.length === 0) {
    return 'I wanted to reach out with a focused suggestion rather than a generic pitch.';
  }

  return `The timing caught my attention because ${timingReason}.`;
}

function normalizeRequiredText(value: string, fieldName: string): string {
  const normalizedValue = value.trim();

  if (normalizedValue.length === 0) {
    throw new Error(
      `Invalid ${fieldName}: received "${value}"; expected non-empty text`,
    );
  }

  return normalizedValue;
}
