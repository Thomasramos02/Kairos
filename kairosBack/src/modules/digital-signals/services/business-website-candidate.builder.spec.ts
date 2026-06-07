import { buildWebsiteCandidateUrls } from './business-website-candidate.builder';

describe('buildWebsiteCandidateUrls', () => {
  it('builds candidate URLs from business names', () => {
    expect(buildWebsiteCandidateUrls('Sunrise Bakery LLC')).toEqual([
      'https://sunrisebakery.com',
      'https://www.sunrisebakery.com',
      'https://sunrise-bakery.com',
      'https://www.sunrise-bakery.com',
    ]);
  });

  it('adds city-aware website candidates when a city is known', () => {
    expect(buildWebsiteCandidateUrls('Sunrise Bakery LLC', 'Miami')).toContain(
      'https://sunrisebakerymiami.com',
    );
  });

  it('throws an exception with context when no candidate can be built', () => {
    expect(() => buildWebsiteCandidateUrls('LLC')).toThrow(
      /expected words for domain candidate/,
    );
  });
});
