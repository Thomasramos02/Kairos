import { assertCreateMarketTargetRequest } from './market-target.validator';

describe('assertCreateMarketTargetRequest', () => {
  it('accepts valid target markets', () => {
    expect(() =>
      assertCreateMarketTargetRequest({
        accountId: 'user_1',
        country: 'US',
        state: 'CT',
        industry: 'restaurants',
        desiredCustomerType: 'new local businesses',
        offeredService: 'website-design-development',
      }),
    ).not.toThrow();
  });

  it('accepts next and experimental coverage targets for user preference', () => {
    for (const state of ['RI', 'FL', 'WA', 'OR', 'IA']) {
      expect(() =>
        assertCreateMarketTargetRequest({
          accountId: 'user_1',
          country: 'US',
          desiredCustomerType: 'new local businesses',
          industry: 'restaurants',
          offeredService: 'website-design-development',
          state,
        }),
      ).not.toThrow();
    }
  });

  it('throws an exception with context for invalid states', () => {
    expect(() =>
      assertCreateMarketTargetRequest({
        accountId: 'user_1',
        country: 'US',
        state: 'ZZ',
        industry: 'restaurants',
        desiredCustomerType: 'new local businesses',
        offeredService: 'branding',
      }),
    ).toThrow(/expected supported US state code/);
  });

  it('throws an exception for states outside the listable source scope', () => {
    expect(() =>
      assertCreateMarketTargetRequest({
        country: 'US',
        desiredCustomerType: 'Web designers',
        industry: 'Healthcare',
        offeredService: 'website-design-development',
        state: 'GA',
        accountId: 'account_1',
      }),
    ).toThrow(/expected supported US state code/);
  });
});
