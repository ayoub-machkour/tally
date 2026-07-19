import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TodayHero } from './components/TodayHero';
import { DayScrubber } from './components/DayScrubber';
import { ExpenseRow } from './components/ExpenseRow';
import { EmptyState } from './components/EmptyState';
import { AddExpenseSheet } from '@/features/add-expense/AddExpenseSheet';
import { SettingsSheet } from '@/features/settings/SettingsSheet';
import { Toast } from '@/ui/Toast';
import { useSelectedDateExpenses } from '@/store/selectors';
import { useExpenseStore } from '@/store/expenseStore';
import { colors, typography, spacing, radii, shadows } from '@/ui/tokens';
import type { Expense } from '@/domain/types';

export function TodayScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [addOpen, setAddOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const dayExpenses = useSelectedDateExpenses();
  const toastMessage = useExpenseStore((s) => s.toastMessage);
  const toastVisible = useExpenseStore((s) => s.toastVisible);
  const hideToast = useExpenseStore((s) => s.hideToast);
  const selectedDate = useExpenseStore((s) => s.selectedDate);

  const isNoSpendDay = dayExpenses.length === 0;
  // A "true" no-spend day = past days with no expenses (not today with no expenses yet)
  const today = new Date().toISOString().slice(0, 10);
  const isPastNoSpend = selectedDate < today && isNoSpendDay;

  const renderExpense = useCallback(
    ({ item }: { item: Expense }) => <ExpenseRow expense={item} />,
    [],
  );

  const keyExtractor = useCallback((item: Expense) => item.id, []);

  // Sort by time descending for display
  const sorted = [...dayExpenses].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <View style={styles.container}>
      {/* Main list with hero + scrubber as headers */}
      <FlatList
        data={sorted}
        keyExtractor={keyExtractor}
        renderItem={renderExpense}
        ListHeaderComponent={
          <>
            <TodayHero />
            <DayScrubber />
            {isNoSpendDay && (
              <View style={styles.emptyWrapper}>
                <EmptyState isNoSpendDay={isPastNoSpend} />
              </View>
            )}
          </>
        }
        style={styles.list}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
        bounces={true}
      />

      {/* Top right: settings icon */}
      <Pressable
        style={[styles.settingsBtn, { top: insets.top + spacing['3'] }]}
        onPress={() => setSettingsOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Open settings"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Animated.Text style={styles.settingsIcon}>⚙</Animated.Text>
      </Pressable>

      {/* FAB — Add expense */}
      <View style={[styles.fab, { bottom: insets.bottom + 90 }]}>
        <Pressable
          style={styles.fabBtn}
          onPress={() => setAddOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Add expense"
        >
          <Animated.Text style={styles.fabIcon}>+</Animated.Text>
        </Pressable>
      </View>

      {/* Bottom sheets */}
      <AddExpenseSheet
        visible={addOpen}
        onClose={() => setAddOpen(false)}
      />
      <SettingsSheet
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Toast */}
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onHide={hideToast}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  list: {
    flex: 1,
  },
  emptyWrapper: {
    flex: 1,
    minHeight: 300,
  },
  settingsBtn: {
    position: 'absolute',
    right: spacing['5'],
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  settingsIcon: {
    fontSize: 22,
    color: colors.heroText,
  },
  fab: {
    position: 'absolute',
    right: spacing['5'],
    zIndex: 10,
  },
  fabBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 32,
    fontFamily: typography.sansFamily,
  },
});
