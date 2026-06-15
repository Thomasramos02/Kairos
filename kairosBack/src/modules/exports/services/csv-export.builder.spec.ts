import { buildBusinessesCsv } from './csv-export.builder';

describe('buildBusinessesCsv', () => {
  it('builds a CSV with required headers', () => {
    const csv = buildBusinessesCsv([
      {
        id: '1',
        sourceDocumentNumber: 'DOC123',
        companyName: 'Sunrise Bakery LLC',
        registeredAt: '2026-01-01T00:00:00.000Z',
        ageDays: 10,
        state: 'FL',
        city: 'Miami',
        industry: 'food-service',
        timingStage: 'warming-up',
        timingScore: 63,
        source: 'Florida Division of Corporations',
        recommendationStrength: 'relevant',
        reason: 'New business',
        signalsCount: 2,
        websiteStatus: 'No website detected',
        digitalPresenceStatus: 'Minimal online presence',
        contactDetected: true,
        opportunityFilters: ['no-website-detected', 'contact-detected'],
      },
    ]);

    expect(csv).toContain('id,source_document_number,company_name,registered_at,age_days');
    expect(csv).toContain('website_status,digital_presence_status,contact_detected');
    expect(csv).toContain('Sunrise Bakery LLC');
  });

  it('escapes values containing commas', () => {
    const csv = buildBusinessesCsv([
      {
        id: '2',
        sourceDocumentNumber: null,
        companyName: 'Sunrise, Bakery LLC',
        registeredAt: '2026-01-01T00:00:00.000Z',
        ageDays: 10,
        state: 'FL',
        city: null,
        industry: 'food-service',
        timingStage: 'warming-up',
        timingScore: 63,
        source: 'source',
        recommendationStrength: 'relevant',
        reason: 'reason',
        signalsCount: 0,
        websiteStatus: 'Unknown website status',
        digitalPresenceStatus: 'Presence not yet verified',
        contactDetected: false,
        opportunityFilters: [],
      },
    ]);

    expect(csv).toContain('"Sunrise, Bakery LLC"');
  });
});
