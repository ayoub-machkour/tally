import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Alert, Text, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import type { Expense } from '@/domain/types';
import { getCategoryMeta, CATEGORY_COLORS_HEX } from '@/domain/categories';
import { useExpenseStore } from '@/store/expenseStore';
import { formatCurrency } from '@/lib/currency';
import { colors, typography, spacing, radii } from '@/ui/tokens';

interface Props {
  expense: Expense;
}

export function ExpenseRow({ expense }: Props): React.ReactElement {
  const swipeableRef = useRef<Swipeable>(null);
  const removeExpense = useExpenseStore((s) => s.removeExpense);
  const currency = useExpenseStore((s) => s.settings.currency);
  const catMeta = getCategoryMeta(expense.category);
  const catColor = CATEGORY_COLORS_HEX[expense.category];

  const handleDelete = useCallback(() => {
    swipeableRef.current?.close();
    Alert.alert(
      'Delete expense',
      `Delete ${formatCurrency(expense.amount, currency)} from ${catMeta.label}?`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => swipeableRef.current?.close() },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeExpense(expense.id),
        },
      ],
    );
  }, [expense, catMeta.label, currency, removeExpense]);

  const handleSwipeOpen = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => null);
  }, []);

  const renderRightActions = useCallback(() => (
    <Pressable style={styles.deleteAction} onPress={handleDelete}>
      <Text style={styles.trashIcon}>🗑</Text>
      <Text style={styles.deleteLabel}>Delete</Text>
    </Pressable>
  ), [handleDelete]);

  const hour = new Date(expense.createdAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <View style={styles.outerWrapper}>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        onSwipeableOpen={handleSwipeOpen}
        overshootRight={false}
        friction={2}
        rightThreshold={60}
        containerStyle={styles.swipeContainer}
      >
        <View style={styles.row}>
          {/* Category dot */}
          <View style={[styles.catDot, { backgroundColor: catColor }]}>
            <Animated.Text style={styles.catEmoji}>{catMeta.emoji}</Animated.Text>
          </View>

          {/* Details */}
          <View style={styles.details}>
            <Animated.Text style={styles.categoryLabel} numberOfLines={1}>
              {catMeta.label}
            </Animated.Text>
            {expense.note ? (
              <Animated.Text style={styles.note} numberOfLines={1}>
                {expense.note}
              </Animated.Text>
            ) : null}
          </View>

          {/* Right */}
          <View style={styles.right}>
            <Animated.Text style={styles.amount}>
              {formatCurrency(expense.amount, currency)}
            </Animated.Text>
            <Animated.Text style={styles.time}>{hour}</Animated.Text>
          </View>
        </View>
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    marginHorizontal: spacing['4'],
    marginBottom: spacing['2'],
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
  },
  swipeContainer: {
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['4'],
    gap: spacing['3'],
    minHeight: 64,
    backgroundColor: '#FFFFFF',
  },
  catDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  catEmoji: {
    fontSize: 18,
    lineHeight: 22,
  },
  details: {
    flex: 1,
    gap: 2,
  },
  categoryLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.size.base,
    color: colors.ink,
    lineHeight: typography.size.base * 1.3,
  },
  note: {
    fontFamily: typography.sansFamily,
    fontSize: typography.size.sm,
    color: colors.muted,
    lineHeight: typography.size.sm * 1.4,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.size.base,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  time: {
    fontFamily: typography.sansFamily,
    fontSize: typography.size.xs,
    color: colors.muted,
    fontVariant: ['tabular-nums'],
  },
  // ── Swipe delete action ──────────────────────────────────────────────────────
  deleteAction: {
    width: 80,
    backgroundColor: colors.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  trashIcon: {
    fontSize: 20,
  },
  deleteLabel: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.xs,
    color: colors.danger,
  },
});
