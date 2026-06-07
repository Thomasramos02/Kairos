import { extractDomainNameFromUrl } from './domain-name.extractor';

describe('extractDomainNameFromUrl', () => {
  it('extracts domain names from absolute URLs', () => {
    expect(extractDomainNameFromUrl('https://www.sunrisebakery.com')).toBe(
      'sunrisebakery.com',
    );
  });

  it('throws an exception with context for invalid URLs', () => {
    expect(() => extractDomainNameFromUrl('sunrisebakery.com')).toThrow(
      /expected absolute URL/,
    );
  });
});
