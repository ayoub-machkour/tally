import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import { CountUpAmount } from './CountUpAmount';
import { useSelectedDateTotal, useMonthProgress, useSparklineData } from '@/store/selectors';
import { useExpenseStore } from '@/store/expenseStore';
import { formatCurrencyShort } from '@/lib/currency';
import { colors, typography, spacing, shadows } from '@/ui/tokens';

// ─── Mini bar chart (7 bars, rendered as Views) ───────────────────────────────
function MiniBarChart({ data }: { data: number[] }): React.ReactElement {
  let maxVal = 1;
  for (let i = 0; i < data.length; i++) {
    if (data[i] > maxVal) maxVal = data[i];
  }
  const BAR_H = 44;
  return (
    <View style={miniStyles.container}>
      {data.map((v, i) => {
        const isLatest = i === data.length - 1;
        const h = Math.max(4, Math.round((v / maxVal) * BAR_H));
        const opacity = isLatest ? 1 : 0.25 + (v / maxVal) * 0.5;
        return (
          <View
            key={i}
            style={[
              miniStyles.bar,
              {
                height: h,
                backgroundColor: '#FFFFFF',
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const miniStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 44,
    gap: 4,
  },
  bar: {
    width: 7,
    borderRadius: 4,
  },
});

// ─── Hero card ────────────────────────────────────────────────────────────────
export function TodayHero(): React.ReactElement {
  const currency = useExpenseStore((s) => s.settings.currency);
  const todayTotal = useSelectedDateTotal();
  const { total: monthTotal, progress, comfortLine } = useMonthProgress();
  const sparkData = useSparklineData(7);

  const isOverBudget = progress > 100;
  const progressColor = isOverBudget ? colors.danger : colors.accentDim;
  const progressWidth = Math.min(progress, 100);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Dark gradient background — overflow:hidden on card clips it */}
        <LinearGradient
          colors={[colors.heroTop, colors.heroMid]}
          style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
        />

        {/* Ambient orbs */}
        <View style={[styles.orb, styles.orb1]} />
        <View style={[styles.orb, styles.orb2]} />

        {/* Main body: left column + right column */}
        <View style={styles.cardBody}>
          {/* Left: label, big amount, comfort line */}
          <View style={styles.leftCol}>
            <Animated.Text style={styles.spentLabel}>SPENT TODAY</Animated.Text>
            <CountUpAmount
              value={todayTotal}
              prefix={currency}
              style={styles.heroAmount}
            />
            <Animated.Text style={styles.comfortText}>
              {formatCurrencyShort(monthTotal, currency)} of{' '}
              {formatCurrencyShort(comfortLine, currency)} comfort
            </Animated.Text>
          </View>

          {/* Right: mini bar chart + label */}
          <View style={styles.rightCol}>
            <MiniBarChart data={sparkData} />
            <Animated.Text style={styles.last7Label}>LAST 7 DAYS</Animated.Text>
          </View>
        </View>

        {/* Progress bar at card bottom */}
        <View style={styles.progressArea}>
          <View style={styles.progressRow}>
            <Animated.Text style={styles.progressLabel}>This month</Animated.Text>
            <Animated.Text style={[styles.progressLabel, isOverBudget && styles.overBudget]}>
              {Math.round(progressWidth)}%
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['3'],
    paddingBottom: spacing['2'],
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.heroTop,
    ...shadows.hero,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.4,
  },
  orb1: {
    width: 180,
    height: 180,
    backgroundColor: colors.heroOrb1,
    top: -50,
    right: -30,
  },
  orb2: {
    width: 120,
    height: 120,
    backgroundColor: colors.heroOrb2,
    bottom: -30,
    left: -20,
  },
  cardBody: {
    flexDirection: 'row',
    paddingHorizontal: spacing['5'],
    paddingTop: spacing['5'],
    paddingBottom: spacing['4'],
    gap: spacing['4'],
    alignItems: 'flex-end',
  },
  leftCol: {
    flex: 1,
    gap: spacing['1'],
  },
  rightCol: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing['2'],
    paddingBottom: 2,
  },
  spentLabel: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.xs,
    color: colors.heroMuted,
    letterSpacing: 1,
  },
  heroAmount: {
    fontFamily: typography.serifFamily,
    fontSize: 52,
    color: colors.heroText,
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
    lineHeight: 52 * 1.05,
  },
  comfortText: {
    fontFamily: typography.sansFamily,
    fontSize: typography.size.xs,
    color: colors.heroMuted,
  },
  last7Label: {
    fontFamily: typography.sansMedium,
    fontSize: 9,
    color: colors.heroMuted,
    letterSpacing: 0.8,
  },
  progressArea: {
    paddingHorizontal: spacing['5'],
    paddingBottom: spacing['5'],
    gap: spacing['2'],
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
});
