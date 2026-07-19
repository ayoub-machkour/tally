import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CountUpAmount } from './CountUpAmount';
import { Sparkline } from './Sparkline';
import { useSelectedDateTotal, useMonthProgress, useSparklineData } from '@/store/selectors';
import { useExpenseStore } from '@/store/expenseStore';
import { formatCurrencyShort } from '@/lib/currency';
import { shortMonthDay } from '@/lib/dates';
import { colors, typography, spacing } from '@/ui/tokens';

const absoluteFillStyles = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };

const { width: SCREEN_W } = Dimensions.get('window');

export function TodayHero(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const currency = useExpenseStore((s) => s.settings.currency);
  const selectedDate = useExpenseStore((s) => s.selectedDate);
  const todayTotal = useSelectedDateTotal();
  const { total: monthTotal, progress, comfortLine } = useMonthProgress();
  const sparkData = useSparklineData(7);

  const isOverBudget = progress > 100;
  const progressColor = isOverBudget ? colors.danger : colors.accentDim;
  const progressWidth = Math.min(progress, 100);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing['4'] }]}>
      <LinearGradient
        colors={[colors.heroTop, colors.heroMid]}
        style={absoluteFillStyles}
      />
      {/* Orbs */}
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />

      <View style={styles.inner}>
        {/* Date label */}
        <Animated.Text style={styles.dateLabel}>
          {shortMonthDay(selectedDate)}
        </Animated.Text>

        {/* Big count-up amount */}
        <CountUpAmount
          value={todayTotal}
          prefix={currency}
          style={styles.heroAmount}
        />

        <Animated.Text style={styles.heroSub}>spent today</Animated.Text>

        {/* Progress bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Animated.Text style={styles.progressLabel}>
              This month
            </Animated.Text>
            <Animated.Text style={[styles.progressLabel, isOverBudget && styles.overBudget]}>
              {formatCurrencyShort(monthTotal, currency)} / {formatCurrencyShort(comfortLine, currency)}
            </Animated.Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressWidth}%`, backgroundColor: progressColor },
              ]}
            />
          </View>
        </View>

        {/* Sparkline */}
        <View style={styles.sparkRow}>
          <Animated.Text style={styles.sparkLabel}>7-day</Animated.Text>
          <Sparkline
            data={sparkData}
            width={SCREEN_W * 0.45}
            height={28}
            color={colors.accentDim}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.heroTop,
    paddingBottom: spacing['6'],
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.35,
  },
  orb1: {
    width: SCREEN_W * 0.7,
    height: SCREEN_W * 0.7,
    backgroundColor: colors.heroOrb1,
    top: -SCREEN_W * 0.25,
    right: -SCREEN_W * 0.2,
  },
  orb2: {
    width: SCREEN_W * 0.5,
    height: SCREEN_W * 0.5,
    backgroundColor: colors.heroOrb2,
    bottom: -SCREEN_W * 0.1,
    left: -SCREEN_W * 0.15,
  },
  inner: {
    paddingHorizontal: spacing['6'],
    gap: spacing['3'],
  },
  dateLabel: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.sm,
    color: colors.heroMuted,
    letterSpacing: 0.3,
  },
  heroAmount: {
    fontFamily: typography.serifFamily,
    fontSize: 56,
    color: colors.heroText,
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
    lineHeight: 56 * 1.05,
  },
  heroSub: {
    fontFamily: typography.sansFamily,
    fontSize: typography.size.sm,
    color: colors.heroMuted,
    marginTop: -spacing['2'],
  },
  progressSection: {
    gap: spacing['2'],
    marginTop: spacing['2'],
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.xs,
    color: colors.heroMuted,
    fontVariant: ['tabular-nums'],
  },
  overBudget: {
    color: colors.danger,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  sparkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing['2'],
  },
  sparkLabel: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.xs,
    color: colors.heroMuted,
    letterSpacing: 0.3,
  },
});
