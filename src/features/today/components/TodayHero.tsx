import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import { CountUpAmount } from './CountUpAmount';
import { useSelectedDateTotal, useMonthProgress, useSparklineData } from '@/store/selectors';
import { useExpenseStore } from '@/store/expenseStore';
import { formatCurrencyShort } from '@/lib/currency';
import { colors, typography, spacing, shadows } from '@/ui/tokens';

// Lerp between two hex colors by factor t (0→1)
function lerpColor(from: string, to: string, t: number): string {
  const f = [parseInt(from.slice(1, 3), 16), parseInt(from.slice(3, 5), 16), parseInt(from.slice(5, 7), 16)];
  const e = [parseInt(to.slice(1, 3), 16), parseInt(to.slice(3, 5), 16), parseInt(to.slice(5, 7), 16)];
  return (
    '#' +
    [0, 1, 2]
      .map((i) => Math.max(0, Math.min(255, Math.round(f[i] + (e[i] - f[i]) * t))).toString(16).padStart(2, '0'))
      .join('')
  );
}

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
            style={[miniStyles.bar, { height: h, backgroundColor: '#FFFFFF', opacity }]}
          />
        );
      })}
    </View>
  );
}

const miniStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', height: 44, gap: 4 },
  bar: { width: 7, borderRadius: 4 },
});

// ─── Hero card ────────────────────────────────────────────────────────────────
export function TodayHero(): React.ReactElement {
  const currency = useExpenseStore((s) => s.settings.currency);
  const todayTotal = useSelectedDateTotal();
  const { total: monthTotal, progress, comfortLine } = useMonthProgress();
  const sparkData = useSparklineData(7);

  const progressWidth = Math.min(progress, 100);
  const t = Math.min(1, Math.max(0, progress / 100));

  // Gradient: light violet → red (readable on dark hero bg)
  // accentDim (#9B80E8) → danger (#DC2626)
  const budgetColor = lerpColor('#9B80E8', '#DC2626', t);
  // Gradient fill color pair for the progress bar
  const gradientStart = colors.accentDim;   // '#9B80E8'
  const gradientEnd = budgetColor;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <LinearGradient
          colors={[colors.heroTop, colors.heroMid]}
          style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
        />
        <View style={[styles.orb, styles.orb1]} />
        <View style={[styles.orb, styles.orb2]} />

        {/* Main body */}
        <View style={styles.cardBody}>
          <View style={styles.leftCol}>
            <Animated.Text style={styles.spentLabel}>SPENT TODAY</Animated.Text>
            <CountUpAmount
              value={todayTotal}
              prefix={currency}
              style={[styles.heroAmount, { color: budgetColor }]}
              duration={0}
            />
            <Animated.Text style={styles.comfortText}>
              {formatCurrencyShort(monthTotal, currency)} of{' '}
              {formatCurrencyShort(comfortLine, currency)} comfort
            </Animated.Text>
          </View>

          <View style={styles.rightCol}>
            <MiniBarChart data={sparkData} />
            <Animated.Text style={styles.last7Label}>LAST 7 DAYS</Animated.Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressArea}>
          <View style={styles.progressRow}>
            <Animated.Text style={styles.progressLabel}>This month</Animated.Text>
            <Animated.Text style={[styles.progressLabel, { color: budgetColor }]}>
              {Math.round(progressWidth)}%
            </Animated.Text>
          </View>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={[gradientStart, gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${progressWidth}%` as `${number}%` }]}
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
  orb: { position: 'absolute', borderRadius: 999, opacity: 0.4 },
  orb1: { width: 180, height: 180, backgroundColor: colors.heroOrb1, top: -50, right: -30 },
  orb2: { width: 120, height: 120, backgroundColor: colors.heroOrb2, bottom: -30, left: -20 },
  cardBody: {
    flexDirection: 'row',
    paddingHorizontal: spacing['5'],
    paddingTop: spacing['5'],
    paddingBottom: spacing['4'],
    gap: spacing['4'],
    alignItems: 'flex-end',
  },
  leftCol: { flex: 1, gap: spacing['1'] },
  rightCol: { alignItems: 'center', justifyContent: 'flex-end', gap: spacing['2'], paddingBottom: 2 },
  spentLabel: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.xs,
    color: colors.heroMuted,
    letterSpacing: 1,
  },
  heroAmount: {
    fontFamily: typography.serifFamily,
    fontSize: 52,
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
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.xs,
    color: colors.heroMuted,
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
