import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import { CountUpAmount } from './CountUpAmount';
import { useSelectedDateTotal, useMonthProgress, useSparklineData } from '@/store/selectors';
import { useExpenseStore } from '@/store/expenseStore';
import { formatCurrencyShort } from '@/lib/currency';
import { colors, typography, spacing } from '@/ui/tokens';

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

// ─── Mini sparkline (dark bars — readable on light glass) ─────────────────────
function MiniBarChart({ data }: { data: number[] }): React.ReactElement {
  let maxVal = 1;
  for (let i = 0; i < data.length; i++) if (data[i] > maxVal) maxVal = data[i];
  const BAR_H = 36;
  return (
    <View style={mini.wrap}>
      {data.map((v, i) => {
        const isLatest = i === data.length - 1;
        const h = Math.max(3, Math.round((v / maxVal) * BAR_H));
        return (
          <View
            key={i}
            style={[
              mini.bar,
              {
                height: h,
                backgroundColor: isLatest ? colors.accent : colors.ink,
                opacity: isLatest ? 0.9 : 0.18 + (v / maxVal) * 0.35,
              },
            ]}
          />
        );
      })}
    </View>
  );
}
const mini = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-end', height: 36, gap: 3 },
  bar:  { width: 6, borderRadius: 3 },
});

// ─── Hero card ────────────────────────────────────────────────────────────────
export function TodayHero(): React.ReactElement {
  const currency   = useExpenseStore((s) => s.settings.currency);
  const todayTotal = useSelectedDateTotal();
  const { total: monthTotal, progress, comfortLine } = useMonthProgress();
  const sparkData  = useSparklineData(7);

  const progressWidth = Math.min(progress, 100);
  const t = Math.min(1, Math.max(0, progress / 100));

  // Glow ring shifts violet → red as budget fills
  const glowColor = lerpColor('#7C5CE8', '#DC2626', t);
  // Very subtle red wash builds up inside glass at high budget
  const budgetWash = t * 0.07;

  return (
    <View style={styles.container}>

      {/*
        ── Outer glow shadow (budget-reactive colour) ──────────────────────────
        The shadow IS the liquid glass "glow" effect — it picks up the budget %.
        On iOS this renders as a soft coloured halo. Android gets elevation only.
      */}
      <View style={[styles.glow, { shadowColor: glowColor }]}>

        {/*
          ── Glass card ─────────────────────────────────────────────────────────
          Light, semi-transparent white surface.
          True liquid glass: the cream paper (#F7F5F1) shows faintly through it,
          giving that warm refracted look.
        */}
        <View style={styles.glass}>

          {/* Layer 1 — white glass base */}
          <LinearGradient
            colors={['rgba(255,255,255,0.82)', 'rgba(255,255,255,0.64)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.4, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Layer 2 — diagonal light refraction (top-left bright, bottom-right dim) */}
          <LinearGradient
            colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Layer 3 — budget tint: clear → barely-there red wash */}
          {budgetWash > 0.005 && (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(220,38,38,${budgetWash})` }]}
            />
          )}

          {/* Layer 4 — top specular line (brightest: where light hits the rim) */}
          <View style={styles.specTop} />

          {/* Layer 5 — left specular edge (fades down) */}
          <LinearGradient
            colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.specLeft}
          />

          {/* ── Card content ────────────────────────────────────────────────── */}
          <View style={styles.body}>
            <View style={styles.left}>
              <Animated.Text style={styles.eyebrow}>SPENT TODAY</Animated.Text>
              <CountUpAmount
                value={todayTotal}
                prefix={currency}
                style={styles.amount}
                duration={0}
              />
              <Animated.Text style={styles.comfort}>
                {formatCurrencyShort(monthTotal, currency)} of{' '}
                {formatCurrencyShort(comfortLine, currency)} comfort
              </Animated.Text>
            </View>

            <View style={styles.right}>
              <MiniBarChart data={sparkData} />
              <Animated.Text style={styles.last7}>LAST 7 DAYS</Animated.Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressArea}>
            <View style={styles.progressRow}>
              <Animated.Text style={styles.progressLabel}>This month</Animated.Text>
              <Animated.Text style={[styles.progressLabel, t > 0.6 && { color: glowColor }]}>
                {Math.round(progressWidth)}%
              </Animated.Text>
            </View>
            <View style={styles.track}>
              <LinearGradient
                colors={[colors.accentDim, glowColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.fill, { width: `${progressWidth}%` as `${number}%` }]}
              />
            </View>
          </View>

        </View>{/* /glass */}
      </View>{/* /glow */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['3'],
    paddingBottom: spacing['2'],
  },

  // Outer shell — carries the coloured glow shadow
  glow: {
    borderRadius: 28,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },

  // Liquid glass surface
  glass: {
    borderRadius: 26,
    overflow: 'hidden',
    // Hair-thin bright white border = glass edge catching light
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.92)',
  },

  // Top specular — single bright pixel where light hits the glass rim
  specTop: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },

  // Left specular edge
  specLeft: {
    position: 'absolute',
    top: 12,
    bottom: 12,
    left: 0,
    width: 1,
  },

  // Content
  body: {
    flexDirection: 'row',
    paddingHorizontal: spacing['5'],
    paddingTop: spacing['5'],
    paddingBottom: spacing['4'],
    gap: spacing['4'],
    alignItems: 'flex-end',
  },
  left:  { flex: 1, gap: spacing['1'] },
  right: { alignItems: 'center', justifyContent: 'flex-end', gap: spacing['2'], paddingBottom: 2 },

  eyebrow: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.xs,
    color: colors.muted,
    letterSpacing: 1,
  },
  amount: {
    fontFamily: typography.serifFamily,
    fontSize: 52,
    color: colors.ink,
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
    lineHeight: 52 * 1.05,
  },
  comfort: {
    fontFamily: typography.sansFamily,
    fontSize: typography.size.xs,
    color: colors.muted,
  },
  last7: {
    fontFamily: typography.sansMedium,
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 0.8,
  },

  progressArea: {
    paddingHorizontal: spacing['5'],
    paddingBottom: spacing['5'],
    gap: spacing['2'],
  },
  progressRow:  { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.xs,
    color: colors.muted,
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.07)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
});