// ─── Date utilities ─────────────────────────────────────────────────────────
// Pure functions only. No side effects.
// Convention: all date strings are LOCAL calendar dates ("YYYY-MM-DD").
// Timestamps (createdAt) are stored as epoch ms, treated as UTC.
// We intentionally use local-time operations for calendar navigation
// so that "today" = the user's local date, not UTC.

/** "YYYY-MM-DD" as a LOCAL date string from a timestamp or Date */
export function toDateString(ts: number | Date): string {
  const d = ts instanceof Date ? ts : new Date(ts);
  // Use local date parts to avoid UTC midnight shift across timezones
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** "YYYY-MM" as a LOCAL month string from a timestamp or Date */
export function toMonthString(ts: number | Date): string {
  const d = ts instanceof Date ? ts : new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/** Today's date as "YYYY-MM-DD" (local) */
export function todayString(): string {
  return toDateString(Date.now());
}

/** Current month as "YYYY-MM" (local) */
export function currentMonthString(): string {
  return toMonthString(Date.now());
}

/**
 * Number of days in a given month.
 * @param month "YYYY-MM"
 */
export function daysInMonth(month: string): number {
  const [y, m] = month.split('-').map(Number);
  // Day 0 of next month = last day of this month
  return new Date(y, m, 0).getDate();
}

/**
 * All date strings in a month, sorted ascending.
 * @param month "YYYY-MM"
 */
export function datesInMonth(month: string): string[] {
  const count = daysInMonth(month);
  const [y, m] = month.split('-').map(Number);
  return Array.from({ length: count }, (_, i) => {
    const day = String(i + 1).padStart(2, '0');
    const mo = String(m).padStart(2, '0');
    return `${y}-${mo}-${day}`;
  });
}

/** How many days have elapsed in a month (including today, capped to total days). */
export function daysElapsedInMonth(month: string): number {
  const today = todayString();
  const [ty, tm, td] = today.split('-').map(Number);
  const [my, mm] = month.split('-').map(Number);

  if (ty === my && tm === mm) {
    return td; // today's local day-of-month
  }
  // Compare year-month strings directly (lexicographic = chronological for YYYY-MM)
  if (month > `${ty}-${String(tm).padStart(2, '0')}`) {
    return 0; // future month
  }
  return daysInMonth(month); // past month
}

/** Previous month as "YYYY-MM" — pure string arithmetic, no Date objects */
export function previousMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  if (m === 1) return `${y - 1}-12`;
  return `${y}-${String(m - 1).padStart(2, '0')}`;
}

/** Next month as "YYYY-MM" — pure string arithmetic, no Date objects */
export function nextMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  if (m === 12) return `${y + 1}-01`;
  return `${y}-${String(m + 1).padStart(2, '0')}`;
}

/**
 * Last N date strings ending at (and including) a given date.
 * Uses local-date arithmetic to avoid timezone issues.
 * @param endDate "YYYY-MM-DD"
 */
export function last14Days(endDate: string, count = 14): string[] {
  const [ey, em, ed] = endDate.split('-').map(Number);
  // Use local noon to stay firmly in the correct calendar day
  const end = new Date(ey, em - 1, ed, 12, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(end.getTime());
    d.setDate(d.getDate() - (count - 1 - i));
    return toDateString(d);
  });
}

/**
 * Short display label for a day scrubber pastille.
 * Returns "S", "M", "T", "W", "T", "F", "S" based on day of week.
 */
export function shortDayLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(y, m - 1, d).getDay()];
}

/**
 * Short month + day: "Jul 19"
 */
export function shortMonthDay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Day of week index (0=Sunday … 6=Saturday) for a date string */
export function dayOfWeek(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

/** Full month name + year: "July 2026" */
export function fullMonthYear(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
