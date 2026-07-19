import type { CategoryId } from './types';

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  emoji: string;
  /** OKLCH color string for display */
  color: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'food',
    label: 'Eating out',
    emoji: '🍽️',
    color: 'oklch(68% 0.18 32)',    // warm orange
  },
  {
    id: 'coffee',
    label: 'Coffee',
    emoji: '☕',
    color: 'oklch(62% 0.12 55)',    // amber
  },
  {
    id: 'groceries',
    label: 'Groceries',
    emoji: '🛒',
    color: 'oklch(65% 0.17 145)',   // green
  },
  {
    id: 'transport',
    label: 'Transport',
    emoji: '🚇',
    color: 'oklch(65% 0.16 240)',   // blue
  },
  {
    id: 'bills',
    label: 'Bills',
    emoji: '📄',
    color: 'oklch(60% 0.14 280)',   // indigo
  },
  {
    id: 'fun',
    label: 'Fun',
    emoji: '🎉',
    color: 'oklch(68% 0.20 320)',   // violet-pink
  },
  {
    id: 'shopping',
    label: 'Shopping',
    emoji: '🛍️',
    color: 'oklch(67% 0.18 355)',   // rose
  },
  {
    id: 'other',
    label: 'Other',
    emoji: '•',
    color: 'oklch(60% 0.04 280)',   // muted purple-grey
  },
];

/** Fallback hex values for platforms that don't support OKLCH */
export const CATEGORY_COLORS_HEX: Record<CategoryId, string> = {
  food:       '#E8773A',
  coffee:     '#C49A3C',
  groceries:  '#4CAF6C',
  transport:  '#4A8FD4',
  bills:      '#7B61C4',
  fun:        '#C454B0',
  shopping:   '#E04870',
  other:      '#8A7AAA',
};

export function getCategoryMeta(id: CategoryId): CategoryMeta {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}
