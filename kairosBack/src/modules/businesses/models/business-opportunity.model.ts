import { DigitalSignalName } from '../../digital-signals/models/digital-signal.model';
import type { StoredBusinessSignal } from '../businesses.repository';

export const opportunityFilters = [
  'no-website-detected',
  'new-entity-under-30-days',
  'local-business',
  'high-confidence',
  'contact-detected',
] as const;

export type OpportunityFilter = (typeof opportunityFilters)[number];

export type BusinessOpportunitySummary = {
  readonly contactDetected: boolean;
  readonly digitalPresenceStatus: string;
  readonly opportunityFilters: readonly OpportunityFilter[];
  readonly opportunityReason: string;
  readonly websiteStatus: string;
};

export type BusinessOpportunityInput = {
  readonly ageDays: number;
  readonly city: string | null;
  readonly industry: string;
  readonly signals: readonly StoredBusinessSignal[];
  readonly timingScore: number;
};

export function buildBusinessOpportunitySummary(
  input: BusinessOpportunityInput,
): BusinessOpportunitySummary {
  const signalNames = new Set(input.signals.map((signal) => signal.signalName));
  const filters = buildOpportunityFilters(input, signalNames);

  return {
    contactDetected: signalNames.has('business-contact-detected'),
    digitalPresenceStatus: buildDigitalPresenceStatus(signalNames),
    opportunityFilters: filters,
    opportunityReason: buildOpportunityReason(filters),
    websiteStatus: buildWebsiteStatus(signalNames),
  };
}

export function isOpportunityFilter(value: string): value is OpportunityFilter {
  return opportunityFilters.includes(value as OpportunityFilter);
}

function buildOpportunityFilters(
  input: BusinessOpportunityInput,
  signalNames: ReadonlySet<DigitalSignalName>,
): readonly OpportunityFilter[] {
  return opportunityFilters.filter((filter) =>
    matchesOpportunityFilter(filter, input, signalNames),
  );
}

function matchesOpportunityFilter(
  filter: OpportunityFilter,
  input: BusinessOpportunityInput,
  signalNames: ReadonlySet<DigitalSignalName>,
): boolean {
  if (filter === 'no-website-detected') return signalNames.has('website-missing');
  if (filter === 'new-entity-under-30-days') return input.ageDays < 30;
  if (filter === 'local-business') return isLocalBusiness(input);
  if (filter === 'high-confidence') return input.timingScore >= 70;
  return signalNames.has('business-contact-detected');
}

function buildWebsiteStatus(signalNames: ReadonlySet<DigitalSignalName>): string {
  if (signalNames.has('website-missing')) return 'No website detected';
  if (signalNames.has('website-incomplete')) return 'Website incomplete';
  if (signalNames.has('website-technology-detected')) return 'Website detected';
  return 'Unknown website status';
}

function buildDigitalPresenceStatus(
  signalNames: ReadonlySet<DigitalSignalName>,
): string {
  if (signalNames.has('local-presence-incomplete')) return 'Local presence gap';
  if (signalNames.has('social-presence-misaligned')) return 'Weak social presence';
  if (signalNames.has('social-profile-detected')) return 'Social profile detected';
  if (signalNames.has('website-missing')) return 'Minimal online presence';
  return 'Presence not yet verified';
}

function buildOpportunityReason(filters: readonly OpportunityFilter[]): string {
  if (filters.includes('no-website-detected')) {
    return 'No website is visible yet, so a website or landing page offer is timely.';
  }

  if (filters.includes('new-entity-under-30-days')) {
    return 'The entity is still new enough that vendor decisions may be open.';
  }

  if (filters.includes('contact-detected')) {
    return 'Public contact details were found, making careful outreach possible.';
  }

  return 'Review timing, confidence, and visible digital signals before outreach.';
}

function isLocalBusiness(input: BusinessOpportunityInput): boolean {
  return input.city !== null && input.industry.trim().toLowerCase() !== 'unclassified';
}
