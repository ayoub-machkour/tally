// ─── Pure insight computations ────────────────────────────────────────────────
// No I/O. No side effects. Fully testable.

import {
  daysElapsedInMonth,
  daysInMonth,
  datesInMonth,
  dayOfWeek,
  toMonthString,
  toDateString,
} from '@/lib/dates';
import { roundAmount } from '@/lib/currency';
import type {
  Expense,
  DailyTotal,
  CategoryBreakdown,
  MonthInsights,
  CategoryId,
} from './types';

// ─── Filtering ────────────────────────────────────────────────────────────────

/** Expenses that fall within a specific "YYYY-MM-DD" date */
export function filterByDate(expenses: Expense[], date: string): Expense[] {
  return expenses.filter((e) => toDateString(e.createdAt) === date);
}

/** Expenses that fall within a specific "YYYY-MM" month */
export function filterByMonth(expenses: Expense[], month: string): Expense[] {
  return expenses.filter((e) => toMonthString(e.createdAt) === month);
}

// ─── Daily aggregation ────────────────────────────────────────────────────────

/** Sum of amounts for a set of expenses */
export function sumExpenses(expenses: Expense[]): number {
  return roundAmount(expenses.reduce((acc, e) => acc + e.amount, 0));
}

/**
 * Daily totals for every day in a month.
 * Days with no expenses get total = 0.
 */
export function computeDailyTotals(expenses: Expense[], month: string): DailyTotal[] {
  const allDates = datesInMonth(month);
  const grouped = new Map<string, number>();

  for (const e of expenses) {
    const d = toDateString(e.createdAt);
    if (grouped.has(d)) {
      grouped.set(d, roundAmount((grouped.get(d) ?? 0) + e.amount));
    } else {
      grouped.set(d, roundAmount(e.amount));
    }
  }

  return allDates.map((date) => ({
    date,
    total: grouped.get(date) ?? 0,
  }));
}

/**
 * Last N daily totals ending at (and including) a given date.
 * Used for sparkline.
 */
export function computeSparkline(
  expenses: Expense[],
  endDate: string,
  days = 7,
): number[] {
  const [ey, em, ed] = endDate.split('-').map(Number);
  // Use local noon to stay in the correct calendar day regardless of timezone
  const end = new Date(ey, em - 1, ed, 12, 0, 0, 0);

  return Array.from({ length: days }, (_, i) => {
    const d = new Date(end.getTime());
    d.setDate(d.getDate() - (days - 1 - i));
    const ds = toDateString(d);
    const dayTotal = expenses
      .filter((e) => toDateString(e.createdAt) === ds)
      .reduce((acc, e) => acc + e.amount, 0);
    return roundAmount(dayTotal);
  });
}

// ─── Category breakdown ───────────────────────────────────────────────────────

export function computeCategoryBreakdown(expenses: Expense[]): CategoryBreakdown[] {
  if (expenses.length === 0) return [];

  const totals = new Map<CategoryId, number>();
  for (const e of expenses) {
    totals.set(e.category, roundAmount((totals.get(e.category) ?? 0) + e.amount));
  }

  const grandTotal = roundAmount([...totals.values()].reduce((a, b) => a + b, 0));

  return [...totals.entries()]
    .map(([category, total]) => ({
      category,
      total,
      percentage: grandTotal > 0 ? roundAmount((total / grandTotal) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

// ─── Weekly rhythm ────────────────────────────────────────────────────────────

/**
 * Average spend per day-of-week for a set of expenses.
 * Returns an array of 7 averages (index 0 = Sunday).
 */
export function computeWeeklyRhythm(expenses: Expense[], month: string): number[] {
  const allDates = datesInMonth(month);
  const dayTotals: number[] = Array(7).fill(0);
  const dayCounts: number[] = Array(7).fill(0);

  // Count all days in the month per weekday
  for (const d of allDates) {
    dayCounts[dayOfWeek(d)]++;
  }

  // Accumulate expense totals per weekday
  for (const e of expenses) {
    const d = toDateString(e.createdAt);
    const dow = dayOfWeek(d);
    dayTotals[dow] = roundAmount(dayTotals[dow] + e.amount);
  }

  // Return averages
  return dayTotals.map((total, dow) => {
    const count = dayCounts[dow];
    return count > 0 ? roundAmount(total / count) : 0;
  });
}

// ─── No-spend days ────────────────────────────────────────────────────────────

/**
 * Number of days in a month with zero expenses.
 * Only counts elapsed days (doesn't penalize future days).
 */
export function countNoSpendDays(expenses: Expense[], month: string): number {
  const elapsed = daysElapsedInMonth(month);
  if (elapsed === 0) return 0;

  const [y, m] = month.split('-').map(Number);
  const elapsedDates = Array.from({ length: elapsed }, (_, i) => {
    const day = String(i + 1).padStart(2, '0');
    const mo = String(m).padStart(2, '0');
    return `${y}-${mo}-${day}`;
  });

  const datesWithSpend = new Set(expenses.map((e) => toDateString(e.createdAt)));

  return elapsedDates.filter((d) => !datesWithSpend.has(d)).length;
}

// ─── Pacing / projection ──────────────────────────────────────────────────────

/**
 * Project end-of-month total based on current daily average.
 * If no days have elapsed, returns 0.
 */
export function projectMonthTotal(totalSoFar: number, month: string): number {
  const elapsed = daysElapsedInMonth(month);
  const total = daysInMonth(month);
  if (elapsed === 0) return 0;
  const dailyAvg = totalSoFar / elapsed;
  return roundAmount(dailyAvg * total);
}

/**
 * % of comfort line used so far this month.
 * Returns a value between 0 and (can exceed 100 if over budget).
 */
export function comfortLineProgress(totalSpent: number, comfortLine: number): number {
  if (comfortLine <= 0) return 0;
  return roundAmount((totalSpent / comfortLine) * 100);
}

// ─── Full month insights ──────────────────────────────────────────────────────

/**
 * Compute all insights for a given month.
 * @param allExpenses - ALL expenses in storage (filtering is done internally)
 * @param month - "YYYY-MM"
 */
export function computeMonthInsights(
  allExpenses: Expense[],
  month: string,
): MonthInsights {
  const monthExpenses = filterByMonth(allExpenses, month);
  const prevMonth = (() => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  })();
  const prevExpenses = filterByMonth(allExpenses, prevMonth);

  const totalSpent = sumExpenses(monthExpenses);
  const previousMonthTotal = prevExpenses.length > 0 ? sumExpenses(prevExpenses) : null;
  const deltaPercent =
    previousMonthTotal !== null && previousMonthTotal > 0
      ? roundAmount(((totalSpent - previousMonthTotal) / previousMonthTotal) * 100)
      : null;

  const dailyTotals = computeDailyTotals(monthExpenses, month);

  const peakDay =
    dailyTotals.length > 0
      ? dailyTotals.reduce((max, d) => (d.total > max.total ? d : max), dailyTotals[0])
      : null;
  const peakDayResult = peakDay && peakDay.total > 0 ? peakDay : null;

  return {
    month,
    totalSpent,
    previousMonthTotal,
    deltaPercent,
    dailyTotals,
    categoryBreakdown: computeCategoryBreakdown(monthExpenses),
    weeklyRhythm: computeWeeklyRhythm(monthExpenses, month),
    noSpendDaysCount: countNoSpendDays(monthExpenses, month),
    peakDay: peakDayResult,
    projectedTotal: projectMonthTotal(totalSpent, month),
    daysElapsed: daysElapsedInMonth(month),
    daysInMonth: daysInMonth(month),
  };
}
