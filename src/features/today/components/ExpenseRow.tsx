import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { Expense } from '@/domain/types';
import { getCategoryMeta, CATEGORY_COLORS_HEX } from '@/domain/categories';
import { useExpenseStore } from '@/store/expenseStore';
import { formatCurrency } from '@/lib/currency';
import { colors, typography, spacing, radii, animation } from '@/ui/tokens';

interface Props {
  expense: Expense;
}

export function ExpenseRow({ expense }: Props): React.ReactElement {
  const [expanded, setExpanded] = useState(false);
  const removeExpense = useExpenseStore((s) => s.removeExpense);
  const currency = useExpenseStore((s) => s.settings.currency);
  const reducedMotion = useReducedMotion();
  const catMeta = getCategoryMeta(expense.category);
  const catColor = CATEGORY_COLORS_HEX[expense.category];

  const deleteHeight = useSharedValue(0);
  const deleteOpacity = useSharedValue(0);

  const toggleExpand = useCallback(() => {
    const next = !expanded;
    setExpanded(next);
    if (reducedMotion) {
      deleteHeight.value = next ? 44 : 0;
      deleteOpacity.value = next ? 1 : 0;
    } else {
      deleteHeight.value = withSpring(next ? 48 : 0, { damping: 18, stiffness: 220 });
      deleteOpacity.value = withTiming(next ? 1 : 0, { duration: animation.fast });
    }
    if (next) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    }
  }, [expanded, reducedMotion, deleteHeight, deleteOpacity]);

  const deleteRowStyle = useAnimatedStyle(() => ({
    height: deleteHeight.value,
    opacity: deleteOpacity.value,
    overflow: 'hidden',
  }));

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete expense',
      `Delete ${formatCurrency(expense.amount, currency)} from ${catMeta.label}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeExpense(expense.id),
        },
      ],
    );
  }, [expense, catMeta.label, currency, removeExpense]);

  const hour = new Date(expense.createdAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={styles.row}
        onPress={toggleExpand}
        accessibilityRole="button"
        accessibilityLabel={`${catMeta.label} ${expense.note || ''} ${formatCurrency(expense.amount, currency)} at ${hour}. Tap to expand.`}
        accessibilityHint="Double tap to show delete option"
      >
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
      </Pressable>

      {/* Delete reveal */}
      <Animated.View style={deleteRowStyle}>
        <Pressable
          style={styles.deleteBtn}
          onPress={handleDelete}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${catMeta.label} expense`}
        >
          <Animated.Text style={styles.deleteBtnLabel}>Delete</Animated.Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['4'],
    gap: spacing['4'],
    minHeight: 64,
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
  deleteBtn: {
    marginHorizontal: spacing['5'],
    marginBottom: spacing['2'],
    backgroundColor: colors.dangerBg,
    borderRadius: radii.md,
    paddingVertical: spacing['3'],
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  deleteBtnLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.size.sm,
    color: colors.danger,
  },
});
