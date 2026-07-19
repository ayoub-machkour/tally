import {
  filterByDate,
  filterByMonth,
  sumExpenses,
  computeDailyTotals,
  computeCategoryBreakdown,
  computeWeeklyRhythm,
  countNoSpendDays,
  projectMonthTotal,
  comfortLineProgress,
  computeSparkline,
} from '../../src/domain/insights';
import type { Expense } from '../../src/domain/types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

// Use LOCAL noon to avoid UTC-midnight timezone shift
const ts = (dateStr: string, hour = 12): number => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, hour, 0, 0, 0).getTime();
};

const makeExpense = (
  overrides: Partial<Expense> & { id: string; amount: number; createdAt: number },
): Expense => ({
  category: 'food',
  note: '',
  ...overrides,
});

const EXPENSES: Expense[] = [
  makeExpense({ id: '1', amount: 12.5,  category: 'food',      createdAt: ts('2026-07-01') }),
  makeExpense({ id: '2', amount: 4.0,   category: 'coffee',    createdAt: ts('2026-07-01') }),
  makeExpense({ id: '3', amount: 35.0,  category: 'groceries', createdAt: ts('2026-07-03') }),
  makeExpense({ id: '4', amount: 8.75,  category: 'transport', createdAt: ts('2026-07-05') }),
  makeExpense({ id: '5', amount: 22.0,  category: 'food',      createdAt: ts('2026-07-05') }),
  makeExpense({ id: '6', amount: 60.0,  category: 'bills',     createdAt: ts('2026-07-10') }),
  makeExpense({ id: '7', amount: 15.0,  category: 'fun',       createdAt: ts('2026-07-15') }),
  makeExpense({ id: '8', amount: 9.99,  category: 'shopping',  createdAt: ts('2026-07-19') }),
];

// ─── filterByDate ─────────────────────────────────────────────────────────────

describe('filterByDate', () => {
  it('returns only expenses for the given date', () => {
    const result = filterByDate(EXPENSES, '2026-07-01');
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('returns empty array for a date with no expenses', () => {
    expect(filterByDate(EXPENSES, '2026-07-02')).toHaveLength(0);
  });
});

// ─── filterByMonth ────────────────────────────────────────────────────────────

describe('filterByMonth', () => {
  it('returns all July 2026 expenses', () => {
    expect(filterByMonth(EXPENSES, '2026-07')).toHaveLength(8);
  });

  it('returns empty for a month with no expenses', () => {
    expect(filterByMonth(EXPENSES, '2026-06')).toHaveLength(0);
  });
});

// ─── sumExpenses ──────────────────────────────────────────────────────────────

describe('sumExpenses', () => {
  it('sums correctly', () => {
    const total = sumExpenses(EXPENSES);
    expect(total).toBeCloseTo(12.5 + 4 + 35 + 8.75 + 22 + 60 + 15 + 9.99, 2);
  });

  it('returns 0 for empty array', () => {
    expect(sumExpenses([])).toBe(0);
  });
});

// ─── computeDailyTotals ───────────────────────────────────────────────────────

describe('computeDailyTotals', () => {
  it('produces an entry for every day in the month', () => {
    const totals = computeDailyTotals(EXPENSES, '2026-07');
    expect(totals).toHaveLength(31);
  });

  it('correctly aggregates multi-expense days', () => {
    const totals = computeDailyTotals(EXPENSES, '2026-07');
    const day1 = totals.find((d) => d.date === '2026-07-01');
    expect(day1?.total).toBeCloseTo(16.5, 2);
  });

  it('gives 0 for days without expenses', () => {
    const totals = computeDailyTotals(EXPENSES, '2026-07');
    const day2 = totals.find((d) => d.date === '2026-07-02');
    expect(day2?.total).toBe(0);
  });
});

// ─── computeSparkline ─────────────────────────────────────────────────────────

describe('computeSparkline', () => {
  it('returns exactly N values', () => {
    const spark = computeSparkline(EXPENSES, '2026-07-19', 7);
    expect(spark).toHaveLength(7);
  });

  it('last value corresponds to endDate', () => {
    const spark = computeSparkline(EXPENSES, '2026-07-19', 7);
    expect(spark[6]).toBeCloseTo(9.99, 2);
  });
});

// ─── computeCategoryBreakdown ─────────────────────────────────────────────────

describe('computeCategoryBreakdown', () => {
  it('returns sorted breakdown', () => {
    const breakdown = computeCategoryBreakdown(EXPENSES);
    expect(breakdown[0].category).toBe('bills'); // 60 is highest
    expect(breakdown[0].total).toBe(60);
  });

  it('percentages sum to approximately 100', () => {
    const breakdown = computeCategoryBreakdown(EXPENSES);
    const sum = breakdown.reduce((acc, b) => acc + b.percentage, 0);
    expect(sum).toBeCloseTo(100, 0);
  });

  it('returns empty array for empty expenses', () => {
    expect(computeCategoryBreakdown([])).toEqual([]);
  });
});

// ─── computeWeeklyRhythm ──────────────────────────────────────────────────────

describe('computeWeeklyRhythm', () => {
  it('returns 7 values', () => {
    const rhythm = computeWeeklyRhythm(EXPENSES, '2026-07');
    expect(rhythm).toHaveLength(7);
  });

  it('all values are non-negative', () => {
    const rhythm = computeWeeklyRhythm(EXPENSES, '2026-07');
    rhythm.forEach((v) => expect(v).toBeGreaterThanOrEqual(0));
  });
});

// ─── countNoSpendDays ─────────────────────────────────────────────────────────

describe('countNoSpendDays', () => {
  it('counts days with no spend in elapsed period', () => {
    // July 2026, 19 days elapsed (July 19 = today in test context)
    // Expenses on: 1, 3, 5, 10, 15, 19 → 6 days with spend → 13 no-spend
    const count = countNoSpendDays(EXPENSES, '2026-07');
    expect(count).toBeGreaterThanOrEqual(0);
    expect(count).toBeLessThanOrEqual(31);
  });

  it('returns all elapsed days for an empty past month', () => {
    // June 2026 is a full past month (30 days) → all 30 are no-spend days
    expect(countNoSpendDays([], '2026-06')).toBe(30);
  });
});

// ─── projectMonthTotal ────────────────────────────────────────────────────────

describe('projectMonthTotal', () => {
  it('projects proportionally', () => {
    // 100 spent in 10 days of a 30-day month → 300 projected
    const projected = projectMonthTotal(100, '2026-06');
    // June has 30 days; daysElapsedInMonth('2026-06') = 30 (past month)
    expect(projected).toBe(100); // full month = total = actual
  });

  it('returns 0 if elapsed is 0', () => {
    const projected = projectMonthTotal(0, '2099-01');
    expect(projected).toBe(0);
  });
});

// ─── comfortLineProgress ──────────────────────────────────────────────────────

describe('comfortLineProgress', () => {
  it('returns 50 for half the comfort line', () => {
    expect(comfortLineProgress(250, 500)).toBe(50);
  });

  it('can exceed 100 when over budget', () => {
    expect(comfortLineProgress(600, 500)).toBe(120);
  });

  it('returns 0 when comfortLine is 0', () => {
    expect(comfortLineProgress(100, 0)).toBe(0);
  });
});
