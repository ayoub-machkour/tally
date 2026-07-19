// ─── Domain Types ────────────────────────────────────────────────────────────
// Pure types: no imports from other layers. Used everywhere.

export type CategoryId =
  | 'food'
  | 'coffee'
  | 'groceries'
  | 'transport'
  | 'bills'
  | 'fun'
  | 'shopping'
  | 'other';

export interface Expense {
  /** UUID v4 */
  id: string;
  /** Stored as float, always rounded to 2 decimals */
  amount: number;
  category: CategoryId;
  /** Optional note, max 100 chars */
  note: string;
  /** Unix epoch in milliseconds */
  createdAt: number;
}

export type CurrencySymbol = '$' | '€' | '£' | '₹';

export interface Settings {
  currency: CurrencySymbol;
  /** Monthly spending target (positive number) */
  comfortLine: number;
  onboarded: boolean;
}

export interface AppMeta {
  /** Schema version, used for migrations */
  version: number;
  /** True after seed data has been loaded in dev */
  seeded: boolean;
}

// ─── Aggregate types (computed, never stored) ─────────────────────────────────

export interface DailyTotal {
  /** ISO date string: "YYYY-MM-DD" */
  date: string;
  total: number;
}

export interface CategoryBreakdown {
  category: CategoryId;
  total: number;
  percentage: number;
}

export interface MonthInsights {
  /** ISO month string: "YYYY-MM" */
  month: string;
  totalSpent: number;
  /** Previous month total, null if no data */
  previousMonthTotal: number | null;
  /** % delta vs previous month, null if no previous month */
  deltaPercent: number | null;
  dailyTotals: DailyTotal[];
  categoryBreakdown: CategoryBreakdown[];
  /** Average per day of week (0=Sun … 6=Sat) */
  weeklyRhythm: number[];
  noSpendDaysCount: number;
  /** Top spending day */
  peakDay: DailyTotal | null;
  /** Projected total at month end, based on daily average so far */
  projectedTotal: number;
  /** Days elapsed in month (capped to days in month) */
  daysElapsed: number;
  daysInMonth: number;
}
