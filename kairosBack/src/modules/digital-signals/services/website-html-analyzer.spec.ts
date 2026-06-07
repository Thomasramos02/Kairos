import { analyzeWebsiteHtml } from './website-html-analyzer';

describe('analyzeWebsiteHtml', () => {
  it('detects incomplete websites', () => {
    expect(analyzeWebsiteHtml('<html>Coming soon</html>').isIncomplete).toBe(true);
  });

  it('detects Shopify technology and store signal', () => {
    const html = '<html><script src="cdn.shopify.com"></script></html>'.repeat(80);
    const analysis = analyzeWebsiteHtml(html);

    expect(analysis.technologies).toContain('Shopify');
    expect(analysis.hasRecentlyLaunchedStore).toBe(true);
  });

  it('detects incomplete local presence when address markers are absent', () => {
    const html = '<html><main>Fresh bread every morning</main></html>'.repeat(80);

    expect(analyzeWebsiteHtml(html).hasIncompleteLocalPresence).toBe(true);
  });

  it('detects aligned local presence when schema, address and phone exist', () => {
    const html =
      '<script type="application/ld+json">LocalBusiness</script>' +
      '<p>123 Main Street Suite 4, Miami FL</p><p>305-555-1234</p>';

    expect(analyzeWebsiteHtml(html.repeat(80)).hasIncompleteLocalPresence).toBe(
      false,
    );
  });

  it('detects missing social links as misaligned social presence', () => {
    const html = '<html><main>No social links here</main></html>'.repeat(80);

    expect(analyzeWebsiteHtml(html).hasMisalignedSocialPresence).toBe(true);
  });

  it('detects social presence when a known profile link exists', () => {
    const html = '<a href="https://instagram.com/sunrisebakery">Instagram</a>';

    expect(analyzeWebsiteHtml(html.repeat(80)).hasMisalignedSocialPresence).toBe(
      false,
    );
  });

  it('extracts known social profile links', () => {
    const html = [
      '<a href="https://instagram.com/sunrisebakery">Instagram</a>',
      '<a href="https://www.facebook.com/sunrisebakery">Facebook</a>',
    ].join('');

    expect(analyzeWebsiteHtml(html.repeat(80)).socialProfiles).toEqual([
      { network: 'instagram', url: 'https://instagram.com/sunrisebakery' },
      { network: 'facebook', url: 'https://www.facebook.com/sunrisebakery' },
    ]);
  });

  it('extracts public email, phone and contact form methods', () => {
    const html = [
      '<a href="mailto:hello@sunrisebakery.com">Email us</a>',
      '<a href="tel:+13055551234">Call</a>',
      '<a href="/contact">Contact</a>',
    ].join('');

    expect(analyzeWebsiteHtml(html.repeat(80)).contactMethods).toEqual([
      {
        confidenceScore: 85,
        source: 'website',
        type: 'email',
        value: 'hello@sunrisebakery.com',
      },
      {
        confidenceScore: 80,
        source: 'website',
        type: 'phone',
        value: '+13055551234',
      },
      {
        confidenceScore: 65,
        source: 'website',
        type: 'contact-form',
        value: '/contact',
      },
    ]);
  });
});
