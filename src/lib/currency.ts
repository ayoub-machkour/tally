import type { CurrencySymbol } from '@/domain/types';

/**
 * Format an amount with the currency symbol.
 * Uses tabular-numeral-friendly formatting.
 * e.g. formatCurrency(1234.5, '$') → "$1,234.50"
 */
export function formatCurrency(amount: number, currency: CurrencySymbol): string {
  const formatted = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${currency}${formatted}`;
}

/**
 * Short form: omit decimals if .00, compact large numbers.
 * e.g. formatCurrencyShort(1234, '$') → "$1,234"
 *      formatCurrencyShort(1234.5, '$') → "$1,234.50"
 */
export function formatCurrencyShort(amount: number, currency: CurrencySymbol): string {
  const isWhole = amount % 1 === 0;
  if (isWhole) {
    const formatted = amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${currency}${formatted}`;
  }
  return formatCurrency(amount, currency);
}

/**
 * Round to 2 decimal places (financial rounding).
 * Uses Number.EPSILON correction to avoid IEEE-754 edge cases like 1.005 → 1.00.
 */
export function roundAmount(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Parse a string like "12.50" into 12.5.
 * Returns 0 if invalid.
 */
export function parseAmount(str: string): number {
  const n = parseFloat(str);
  return isNaN(n) ? 0 : roundAmount(n);
}

/**
 * Format a percentage with 1 decimal: "12.3%"
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format a delta percentage with sign: "+12.3%" / "-5.0%"
 */
export function formatDeltaPercent(delta: number): string {
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${delta.toFixed(1)}%`;
}
