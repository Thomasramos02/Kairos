import { resolveCreateMarketTargetCityOrRegion } from './market-targets.service';

describe('resolveCreateMarketTargetCityOrRegion', () => {
  it('keeps the canonical cityOrRegion field', () => {
    expect(
      resolveCreateMarketTargetCityOrRegion({ cityOrRegion: ' Miami ' }),
    ).toBe('Miami');
  });

  it('accepts city from frontend market target forms', () => {
    expect(resolveCreateMarketTargetCityOrRegion({ city: 'Orlando' })).toBe(
      'Orlando',
    );
  });

  it('accepts region aliases from API clients', () => {
    expect(resolveCreateMarketTargetCityOrRegion({ region: 'Tampa Bay' })).toBe(
      'Tampa Bay',
    );
  });

  it('accepts snake case city_or_region from external payloads', () => {
    expect(
      resolveCreateMarketTargetCityOrRegion({ city_or_region: 'Jacksonville' }),
    ).toBe('Jacksonville');
  });

  it('stores empty city or region values as null', () => {
    expect(resolveCreateMarketTargetCityOrRegion({ city: '   ' })).toBeNull();
  });
});
