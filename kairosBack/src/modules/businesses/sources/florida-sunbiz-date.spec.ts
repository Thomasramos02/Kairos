import {
  formatSunbizDailyDate,
  listRecentSunbizBusinessDates,
} from './florida-sunbiz-date';

describe('formatSunbizDailyDate', () => {
  it('formats dates using Sunbiz daily file naming', () => {
    expect(formatSunbizDailyDate(new Date('2026-06-03T00:00:00.000Z'))).toBe(
      '20260603',
    );
  });
});

describe('listRecentSunbizBusinessDates', () => {
  it('skips weekends', () => {
    const dates = listRecentSunbizBusinessDates(
      new Date('2026-06-08T00:00:00.000Z'),
      4,
    );

    expect(dates.map(formatSunbizDailyDate)).toEqual(['20260608', '20260605']);
  });

  it('throws an exception with context for invalid lookback windows', () => {
    expect(() =>
      listRecentSunbizBusinessDates(new Date('2026-06-08T00:00:00.000Z'), 0),
    ).toThrow(/expected > 0/);
  });
});
