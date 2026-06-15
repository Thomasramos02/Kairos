import { buildBusinessOpportunitySummary, isOpportunityFilter } from './business-opportunity.model';
import type { StoredBusinessSignal } from '../businesses.repository';

describe('buildBusinessOpportunitySummary', () => {
  it('summarizes website, contact, and opportunity filters', () => {
    const summary = buildBusinessOpportunitySummary({
      ageDays: 12,
      city: 'Miami',
      industry: 'Healthcare',
      signals: [
        createSignal('website-missing', 90),
        createSignal('business-contact-detected', 80),
      ],
      timingScore: 74,
    });

    expect(summary).toMatchObject({
      contactDetected: true,
      digitalPresenceStatus: 'Minimal online presence',
      websiteStatus: 'No website detected',
    });
    expect(summary.opportunityFilters).toEqual([
      'no-website-detected',
      'new-entity-under-30-days',
      'local-business',
      'high-confidence',
      'contact-detected',
    ]);
  });

  it('rejects unsupported opportunity filter ids', () => {
    expect(isOpportunityFilter('contact-detected')).toBe(true);
    expect(isOpportunityFilter('contact-dectected')).toBe(false);
  });
});

function createSignal(
  signalName: StoredBusinessSignal['signalName'],
  confidenceScore: number,
): StoredBusinessSignal {
  return {
    businessId: 'biz_1',
    confidenceScore,
    metadata: {},
    serviceImpact: 'impact',
    signalName,
    sourceName: 'Kairos detector',
  };
}
