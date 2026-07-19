// ─── Memoized selectors ───────────────────────────────────────────────────────
// Called from components via useMemo / useCallback to avoid re-renders.

import { useMemo } from 'react';
import { useExpenseStore } from './expenseStore';
import {
  filterByDate,
  filterByMonth,
  sumExpenses,
  computeMonthInsights,
  computeSparkline,
  comfortLineProgress,
} from '@/domain/insights';
import { last14Days } from '@/lib/dates';
import type { DailyTotal } from '@/domain/types';

// ─── Today tab selectors ──────────────────────────────────────────────────────

export function useSelectedDateExpenses() {
  const expenses = useExpenseStore((s) => s.expenses);
  const date = useExpenseStore((s) => s.selectedDate);
  return useMemo(() => filterByDate(expenses, date), [expenses, date]);
}

export function useSelectedDateTotal() {
  const dayExpenses = useSelectedDateExpenses();
  return useMemo(() => sumExpenses(dayExpenses), [dayExpenses]);
}

export function useScrubberData(): DailyTotal[] {
  const expenses = useExpenseStore((s) => s.expenses);
  const selectedDate = useExpenseStore((s) => s.selectedDate);

  return useMemo(() => {
    const dates = last14Days(selectedDate);
    return dates.map((date) => ({
      date,
      total: sumExpenses(filterByDate(expenses, date)),
    }));
  }, [expenses, selectedDate]);
}

export function useSparklineData(days = 7): number[] {
  const expenses = useExpenseStore((s) => s.expenses);
  const selectedDate = useExpenseStore((s) => s.selectedDate);
  return useMemo(
    () => computeSparkline(expenses, selectedDate, days),
    [expenses, selectedDate, days],
  );
}

export function useMonthProgress() {
  const expenses = useExpenseStore((s) => s.expenses);
  const selectedDate = useExpenseStore((s) => s.selectedDate);
  const comfortLine = useExpenseStore((s) => s.settings.comfortLine);
  const month = selectedDate.slice(0, 7);

  return useMemo(() => {
    const monthExpenses = filterByMonth(expenses, month);
    const total = sumExpenses(monthExpenses);
    const progress = comfortLineProgress(total, comfortLine);
    return { total, progress, comfortLine };
  }, [expenses, month, comfortLine]);
}

// ─── Months tab selectors ─────────────────────────────────────────────────────

export function useMonthInsights() {
  const expenses = useExpenseStore((s) => s.expenses);
  const selectedMonth = useExpenseStore((s) => s.selectedMonth);

  return useMemo(
    () => computeMonthInsights(expenses, selectedMonth),
    [expenses, selectedMonth],
  );
}
