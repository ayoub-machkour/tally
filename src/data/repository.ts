// ─── Repository — sole point of contact with AsyncStorage ─────────────────────
// No other module should import AsyncStorage.

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Expense, Settings, AppMeta } from '@/domain/types';
import { roundAmount } from '@/lib/currency';

const KEYS = {
  META:     'tally:meta',
  SETTINGS: 'tally:settings',
  EXPENSES: 'tally:expenses',
} as const;

const CURRENT_VERSION = 1;

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: Settings = {
  currency: '$',
  comfortLine: 1000,
  onboarded: false,
};

const DEFAULT_META: AppMeta = {
  version: CURRENT_VERSION,
  seeded: false,
};

// ─── Meta ─────────────────────────────────────────────────────────────────────

export async function getMeta(): Promise<AppMeta> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.META);
    if (!raw) return { ...DEFAULT_META };
    return JSON.parse(raw) as AppMeta;
  } catch {
    return { ...DEFAULT_META };
  }
}

export async function saveMeta(meta: AppMeta): Promise<void> {
  await AsyncStorage.setItem(KEYS.META, JSON.stringify(meta));
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as Settings;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export async function getAllExpenses(): Promise<Expense[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.EXPENSES);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Expense[];
    return parsed.map((e) => ({ ...e, amount: roundAmount(e.amount) }));
  } catch {
    return [];
  }
}

export async function saveExpense(expense: Expense): Promise<void> {
  const all = await getAllExpenses();
  const updated = [...all, { ...expense, amount: roundAmount(expense.amount) }];
  await AsyncStorage.setItem(KEYS.EXPENSES, JSON.stringify(updated));
}

export async function deleteExpense(id: string): Promise<void> {
  const all = await getAllExpenses();
  const updated = all.filter((e) => e.id !== id);
  await AsyncStorage.setItem(KEYS.EXPENSES, JSON.stringify(updated));
}

export async function saveAllExpenses(expenses: Expense[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
}

// ─── Nuke ─────────────────────────────────────────────────────────────────────

export async function eraseAllData(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.META);
  await AsyncStorage.removeItem(KEYS.SETTINGS);
  await AsyncStorage.removeItem(KEYS.EXPENSES);
}

// ─── Boot hydration ───────────────────────────────────────────────────────────

export interface HydratedData {
  expenses: Expense[];
  settings: Settings;
  meta: AppMeta;
}

/**
 * Single call to load everything on app start.
 * Also runs migrations if needed.
 */
export async function hydrateApp(): Promise<HydratedData> {
  const [expenses, settings, meta] = await Promise.all([
    getAllExpenses(),
    getSettings(),
    getMeta(),
  ]);

  const migratedMeta = await runMigrations(meta, expenses, settings);

  return { expenses, settings, meta: migratedMeta };
}

// ─── Migrations ───────────────────────────────────────────────────────────────

async function runMigrations(
  meta: AppMeta,
  _expenses: Expense[],
  _settings: Settings,
): Promise<AppMeta> {
  if (meta.version === CURRENT_VERSION) return meta;

  // Future migrations go here:
  // if (meta.version < 2) { ... await migrate_v1_to_v2(); }

  const updated: AppMeta = { ...meta, version: CURRENT_VERSION };
  await saveMeta(updated);
  return updated;
}
