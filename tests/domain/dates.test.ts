import {
  toDateString,
  toMonthString,
  daysInMonth,
  datesInMonth,
  last14Days,
  shortDayLabel,
  previousMonth,
  nextMonth,
  fullMonthYear,
} from '../../src/lib/dates';

describe('toDateString', () => {
  it('formats a timestamp to YYYY-MM-DD', () => {
    const ts = new Date('2026-07-19T10:00:00Z').getTime();
    expect(toDateString(ts)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('toMonthString', () => {
  it('formats a timestamp to YYYY-MM', () => {
    const ts = new Date('2026-07-19T10:00:00Z').getTime();
    expect(toMonthString(ts)).toMatch(/^\d{4}-\d{2}$/);
  });
});

describe('daysInMonth', () => {
  it('returns 31 for July', () => {
    expect(daysInMonth('2026-07')).toBe(31);
  });

  it('returns 28 for non-leap February', () => {
    expect(daysInMonth('2025-02')).toBe(28);
  });

  it('returns 29 for leap February', () => {
    expect(daysInMonth('2024-02')).toBe(29);
  });

  it('returns 30 for June', () => {
    expect(daysInMonth('2026-06')).toBe(30);
  });
});

describe('datesInMonth', () => {
  it('returns all dates in July 2026', () => {
    const dates = datesInMonth('2026-07');
    expect(dates).toHaveLength(31);
    expect(dates[0]).toBe('2026-07-01');
    expect(dates[30]).toBe('2026-07-31');
  });
});

describe('last14Days', () => {
  it('returns 14 dates ending at endDate', () => {
    const dates = last14Days('2026-07-19');
    expect(dates).toHaveLength(14);
    expect(dates[13]).toBe('2026-07-19');
    expect(dates[0]).toBe('2026-07-06');
  });
});

describe('shortDayLabel', () => {
  it('returns correct day label', () => {
    // 2026-07-19 is a Sunday
    const label = shortDayLabel('2026-07-19');
    expect(['S', 'M', 'T', 'W', 'T', 'F', 'S']).toContain(label);
  });
});

describe('previousMonth', () => {
  it('returns previous month', () => {
    expect(previousMonth('2026-07')).toBe('2026-06');
  });

  it('handles year boundary', () => {
    expect(previousMonth('2026-01')).toBe('2025-12');
  });
});

describe('nextMonth', () => {
  it('returns next month', () => {
    expect(nextMonth('2026-07')).toBe('2026-08');
  });

  it('handles year boundary', () => {
    expect(nextMonth('2026-12')).toBe('2027-01');
  });
});

describe('fullMonthYear', () => {
  it('returns full month + year', () => {
    const result = fullMonthYear('2026-07');
    expect(result).toContain('July');
    expect(result).toContain('2026');
  });
});
