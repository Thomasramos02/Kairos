import { buildOutreachMessage } from './outreach-message.builder';

describe('buildOutreachMessage', () => {
  it('builds contextual outreach without generic spam language', () => {
    const message = buildOutreachMessage({
      businessName: 'Sunrise Bakery LLC',
      offeredService: 'website-design-development',
      signalName: 'website-missing',
      signalImpact: 'a missing website can make early customer trust harder',
      timingStage: 'best-window',
    });

    expect(message).toContain('Sunrise Bakery LLC');
    expect(message).toContain('clear website connected to the business');
    expect(message).toContain('website design and development');
    expect(message).toContain('timely outreach window');
    expect(message).toContain('early customer trust');
    expect(message).toContain('specific improvements');
    expect(message).not.toContain('guaranteed');
    expect(message).not.toContain('limited time');
    expect(message).not.toContain('conversion');
  });

  it('throws an exception with context for blank business names', () => {
    expect(() =>
      buildOutreachMessage({
        businessName: ' ',
        offeredService: 'branding',
        signalName: 'website-missing',
      }),
    ).toThrow(/expected non-empty text/);
  });

  it('uses timing reason when signal impact is not available', () => {
    const message = buildOutreachMessage({
      businessName: 'Tampa Studio LLC',
      offeredService: 'branding',
      signalName: 'website-incomplete',
      timingReason: 'the company entered the 2 to 6 week outreach window',
      timingStage: 'warming-up',
    });

    expect(message).toContain('getting organized');
    expect(message).toContain('2 to 6 week outreach window');
    expect(message).not.toContain('will buy');
  });
});
