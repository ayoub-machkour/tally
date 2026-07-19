import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import { CountUpAmount } from './CountUpAmount';
import { useSelectedDateTotal, useMonthProgress, useSparklineData } from '@/store/selectors';
import { useExpenseStore } from '@/store/expenseStore';
import { formatCurrencyShort } from '@/lib/currency';
import { colors, typography, spacing, shadows } from '@/ui/tokens';

// Lerp between two hex colors by t (0→1)
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

// ─── Mini bar chart ───────────────────────────────────────────────────────────
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
          <View key={i} style={[miniStyles.bar, { height: h, opacity }]} />
        );
      })}
    </View>
  );
}

const miniStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', height: 44, gap: 4 },
  bar: { width: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.7)' },
});

// ─── Hero card ─────────────────────────────────────────────────────────────────
export function TodayHero(): React.ReactElement {
  const currency = useExpenseStore((s) => s.settings.currency);
  const todayTotal = useSelectedDateTotal();
  const { total: monthTotal, progress, comfortLine } = useMonthProgress();
  const sparkData = useSparklineData(7);

  const progressWidth = Math.min(progress, 100);
  const t = Math.min(1, Math.max(0, progress / 100));

  // Budget ring: violet → red (this is the ONLY thing that changes with budget %)
  const ringColor = lerpColor('#7C5CE8', '#DC2626', t);
  // Progress bar gradient end color
  const barEndColor = lerpColor('#9B80E8', '#DC2626', t);

  return (
    <View style={styles.container}>
      {/* Budget ring wrapper — glows violet→red */}
      <View style={[styles.ring, { borderColor: ringColor, shadowColor: ringColor }]}>

        {/* Glass card */}
        <View style={styles.card}>

          {/* ── Glass layers (stacked, all absolute) ── */}
          {/* 1. Deep base gradient */}
          <LinearGradient
            colors={['#13102A', '#0A0814']}
            style={StyleSheet.absoluteFill}
          />

          {/* 2. Inner glass sheen — light catches the top-left */}
          <LinearGradient
            colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.6, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* 3. Top specular line — simulates the glass rim */}
          <View style={styles.specularTop} />

          {/* 4. Left specular edge */}
          <LinearGradient
            colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.specularLeft}
          />

          {/* ── Content ── */}
          <View style={styles.cardBody}>
            <View style={styles.leftCol}>
              <Animated.Text style={styles.spentLabel}>SPENT TODAY</Animated.Text>
              <CountUpAmount
                value={todayTotal}
                prefix={currency}
                style={styles.heroAmount}
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
              <Animated.Text style={[styles.progressLabel, { color: barEndColor }]}>
                {Math.round(progressWidth)}%
              </Animated.Text>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={[colors.accentDim, barEndColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${progressWidth}%` as `${number}%` }]}
              />
            </View>
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

  // Budget-reactive glowing ring around the card
  ring: {
    borderRadius: 26,
    borderWidth: 1.5,
    // shadowColor set dynamically
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 10,
  },

  // Liquid glass card
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    // Inner rim: subtle white border for the glass edge feel
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },

  // Specular highlights
  specularTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  specularLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 1,
  },

  cardBody: {
    flexDirection: 'row',
    paddingHorizontal: spacing['5'],
    paddingTop: spacing['5'],
    paddingBottom: spacing['4'],
    gap: spacing['4'],
    alignItems: 'flex-end',
  },
  leftCol: { flex: 1, gap: spacing['1'] },
  rightCol: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing['2'],
    paddingBottom: 2,
  },

  spentLabel: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.xs,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1,
  },
  heroAmount: {
    fontFamily: typography.serifFamily,
    fontSize: 52,
    color: '#FFFFFF',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
    lineHeight: 52 * 1.05,
  },
  comfortText: {
    fontFamily: typography.sansFamily,
    fontSize: typography.size.xs,
    color: 'rgba(255,255,255,0.38)',
  },
  last7Label: {
    fontFamily: typography.sansMedium,
    fontSize: 9,
    color: 'rgba(255,255,255,0.35)',
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
    color: 'rgba(255,255,255,0.45)',
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
