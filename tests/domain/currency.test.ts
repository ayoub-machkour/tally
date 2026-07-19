import {
  formatCurrency,
  formatCurrencyShort,
  roundAmount,
  parseAmount,
  formatPercent,
  formatDeltaPercent,
} from '../../src/lib/currency';

describe('formatCurrency', () => {
  it('formats whole numbers with 2 decimals', () => {
    expect(formatCurrency(100, '$')).toBe('$100.00');
  });

  it('formats with thousand separators', () => {
    expect(formatCurrency(1234.5, '$')).toBe('$1,234.50');
  });

  it('formats with euro symbol', () => {
    expect(formatCurrency(99.99, '€')).toBe('€99.99');
  });
});

describe('formatCurrencyShort', () => {
  it('omits decimals for whole numbers', () => {
    expect(formatCurrencyShort(100, '$')).toBe('$100');
  });

  it('keeps decimals for non-whole numbers', () => {
    expect(formatCurrencyShort(100.5, '$')).toBe('$100.50');
  });
});

describe('roundAmount', () => {
  it('rounds to 2 decimal places', () => {
    expect(roundAmount(1.005)).toBe(1.01);
    expect(roundAmount(1.234)).toBe(1.23);
    expect(roundAmount(1.235)).toBe(1.24);
  });
});

describe('parseAmount', () => {
  it('parses valid strings', () => {
    expect(parseAmount('12.50')).toBe(12.5);
    expect(parseAmount('0')).toBe(0);
  });

  it('returns 0 for invalid strings', () => {
    expect(parseAmount('')).toBe(0);
    expect(parseAmount('abc')).toBe(0);
  });
});

describe('formatPercent', () => {
  it('formats with 1 decimal and % sign', () => {
    expect(formatPercent(12.34)).toBe('12.3%');
    expect(formatPercent(100)).toBe('100.0%');
  });
});

describe('formatDeltaPercent', () => {
  it('adds + for positive delta', () => {
    expect(formatDeltaPercent(12.3)).toBe('+12.3%');
  });

  it('shows - for negative delta', () => {
    expect(formatDeltaPercent(-5.1)).toBe('-5.1%');
  });

  it('formats zero correctly', () => {
    expect(formatDeltaPercent(0)).toBe('+0.0%');
  });
});
