import { create } from 'zustand';
import type { Expense, Settings, AppMeta } from '@/domain/types';
import * as repo from '@/data/repository';
import { generateSeedData } from '@/data/seed';
import { todayString, currentMonthString } from '@/lib/dates';

interface ExpenseState {
  // ── Data ──────────────────────────────────────────────────────────────────
  expenses: Expense[];
  settings: Settings;
  meta: AppMeta;

  // ── UI state ──────────────────────────────────────────────────────────────
  selectedDate: string;
  selectedMonth: string;
  hydrated: boolean;

  // ── Toast ─────────────────────────────────────────────────────────────────
  toastMessage: string;
  toastVisible: boolean;

  // ── Add-expense sheet ─────────────────────────────────────────────────────
  addSheetOpen: boolean;

  // ── Actions ───────────────────────────────────────────────────────────────
  hydrate: () => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  updateSettings: (partial: Partial<Settings>) => Promise<void>;
  setSelectedDate: (date: string) => void;
  setSelectedMonth: (month: string) => void;
  showToast: (message: string) => void;
  hideToast: () => void;
  openAddSheet: () => void;
  closeAddSheet: () => void;
  eraseData: () => Promise<void>;
  loadSeedData: () => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  expenses: [],
  settings: repo.DEFAULT_SETTINGS,
  meta: { version: 1, seeded: false },
  selectedDate: todayString(),
  selectedMonth: currentMonthString(),
  hydrated: false,
  toastMessage: '',
  toastVisible: false,
  addSheetOpen: false,

  // ── Hydrate on app start ───────────────────────────────────────────────────
  hydrate: async (): Promise<void> => {
    const data = await repo.hydrateApp();
    set({
      expenses: data.expenses,
      settings: data.settings,
      meta: data.meta,
      hydrated: true,
    });
  },

  // ── Expense CRUD ───────────────────────────────────────────────────────────
  addExpense: async (expense: Expense): Promise<void> => {
    // Optimistic update
    set((state) => ({ expenses: [...state.expenses, expense] }));
    await repo.saveExpense(expense);
  },

  removeExpense: async (id: string): Promise<void> => {
    // Optimistic update
    set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }));
    await repo.deleteExpense(id);
  },

  // ── Settings ───────────────────────────────────────────────────────────────
  updateSettings: async (partial: Partial<Settings>): Promise<void> => {
    const updated = { ...get().settings, ...partial };
    set({ settings: updated });
    await repo.saveSettings(updated);
  },

  // ── Navigation state ───────────────────────────────────────────────────────
  setSelectedDate: (date: string): void => {
    set({ selectedDate: date });
  },

  setSelectedMonth: (month: string): void => {
    set({ selectedMonth: month });
  },

  // ── Toast ──────────────────────────────────────────────────────────────────
  showToast: (message: string): void => {
    set({ toastMessage: message, toastVisible: true });
  },

  hideToast: (): void => {
    set({ toastVisible: false });
  },

  // ── Add-expense sheet ──────────────────────────────────────────────────────
  openAddSheet: (): void => {
    set({ addSheetOpen: true });
  },

  closeAddSheet: (): void => {
    set({ addSheetOpen: false });
  },

  // ── Nuclear option ─────────────────────────────────────────────────────────
  eraseData: async (): Promise<void> => {
    await repo.eraseAllData();
    set({
      expenses: [],
      settings: repo.DEFAULT_SETTINGS,
      meta: { version: 1, seeded: false },
      selectedDate: todayString(),
      selectedMonth: currentMonthString(),
    });
  },

  // ── Demo seed ──────────────────────────────────────────────────────────────
  loadSeedData: async (): Promise<void> => {
    const seed = generateSeedData();
    await repo.saveAllExpenses(seed);
    const meta = { ...get().meta, seeded: true };
    await repo.saveMeta(meta);
    set({ expenses: seed, meta });
  },
}));
