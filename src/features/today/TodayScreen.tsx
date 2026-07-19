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
import { colors, typography, spacing } from '@/ui/tokens';
import type { Expense } from '@/domain/types';

function getTodayLabel(): string {
  const d = new Date();
  const day = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const month = d.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  return `${day}, ${month} ${d.getDate()}`;
}

export function TodayScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const addSheetOpen = useExpenseStore((s) => s.addSheetOpen);
  const closeAddSheet = useExpenseStore((s) => s.closeAddSheet);
  const dayExpenses = useSelectedDateExpenses();
  const toastMessage = useExpenseStore((s) => s.toastMessage);
  const toastVisible = useExpenseStore((s) => s.toastVisible);
  const hideToast = useExpenseStore((s) => s.hideToast);
  const selectedDate = useExpenseStore((s) => s.selectedDate);

  const isNoSpendDay = dayExpenses.length === 0;
  const today = new Date().toISOString().slice(0, 10);
  const isPastNoSpend = selectedDate < today && isNoSpendDay;

  const renderExpense = useCallback(
    ({ item }: { item: Expense }) => <ExpenseRow expense={item} />,
    [],
  );

  const keyExtractor = useCallback((item: Expense) => item.id, []);

  const sorted = [...dayExpenses].sort((a, b) => b.createdAt - a.createdAt);

  const dateLabel = getTodayLabel();

  return (
    <View style={styles.container}>
      {/* Fixed header: "tally" italic + date + settings gear */}
      <View style={[styles.header, { paddingTop: insets.top + spacing['2'] }]}>
        <View>
          <Animated.Text style={styles.logoText}>tally</Animated.Text>
          <Animated.Text style={styles.headerDate}>{dateLabel}</Animated.Text>
        </View>
        <Pressable
          style={styles.settingsBtn}
          onPress={() => setSettingsOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Animated.Text style={styles.settingsIcon}>⚙</Animated.Text>
        </Pressable>
      </View>

      {/* Scrollable content */}
      <FlatList
        data={sorted}
        keyExtractor={keyExtractor}
        renderItem={renderExpense}
        ListHeaderComponent={
          <>
            <TodayHero />
            <DayScrubber />
            <View style={{ height: spacing['3'] }} />
            {isNoSpendDay && (
              <View style={styles.emptyWrapper}>
                <EmptyState isNoSpendDay={isPastNoSpend} />
              </View>
            )}
          </>
        }
        style={styles.list}
        contentContainerStyle={{ paddingBottom: insets.bottom + 130 }}
        showsVerticalScrollIndicator={false}
        bounces={true}
      />

      {/* Sheets */}
      <AddExpenseSheet
        visible={addSheetOpen}
        onClose={closeAddSheet}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing['5'],
    paddingBottom: spacing['2'],
  },
  logoText: {
    fontFamily: typography.serifItalic,
    fontSize: 34,
    color: colors.ink,
    letterSpacing: -1,
    lineHeight: 38,
  },
  headerDate: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.xs,
    color: colors.muted,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing['1'],
  },
  settingsIcon: {
    fontSize: 22,
    color: colors.muted,
  },
  list: {
    flex: 1,
  },
  emptyWrapper: {
    flex: 1,
    minHeight: 260,
  },
});
