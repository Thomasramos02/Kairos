import { calculateDigitalSignalImpact } from './signal-impact-calculator';

describe('calculateDigitalSignalImpact', () => {
  it('returns high impact for service-relevant signals', () => {
    const impactScore = calculateDigitalSignalImpact(
      'website-missing',
      'website-design-development',
    );

    expect(impactScore).toBe(90);
  });

  it('returns moderate impact for weak service matches', () => {
    const impactScore = calculateDigitalSignalImpact(
      'website-missing',
      'paid-marketing',
    );

    expect(impactScore).toBe(40);
  });
});
