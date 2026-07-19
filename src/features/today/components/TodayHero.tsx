import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient as SvgRadial, Stop, Ellipse } from 'react-native-svg';
import { CountUpAmount } from './CountUpAmount';
import { useSelectedDateTotal, useMonthProgress, useSparklineData } from '@/store/selectors';
import { useExpenseStore } from '@/store/expenseStore';
import { formatCurrencyShort } from '@/lib/currency';
import { colors, typography, spacing } from '@/ui/tokens';

// ─── Derived accent palette (from accent: #6B4FBB) ───────────────────────────
// mix(accent, #17151F, 45%)  — used as the top-right radial tint
const GRAD_TOP      = '#453475';
// mix(accent, white, 28%)   — progress bar left edge
const ACCENT_BRIGHT = '#9480CE';
// mix(accent, warm-pink, 45%) — progress bar right edge + orb 2
const ACCENT_WARM   = '#9A58A5';

// ─── Mini sparkline (7 white bars) ───────────────────────────────────────────
function MiniBarChart({ data }: { data: number[] }): React.ReactElement {
  let maxVal = 1;
  for (const v of data) if (v > maxVal) maxVal = v;
  return (
    <View style={mini.wrap}>
      {data.map((v, i) => {
        const isLatest = i === data.length - 1;
        const h = Math.max(3, Math.round((v / maxVal) * 44));
        const op = isLatest ? 1 : 0.22 + (v / maxVal) * 0.45;
        return <View key={i} style={[mini.bar, { height: h, opacity: op }]} />;
      })}
    </View>
  );
}
const mini = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-end', height: 44, gap: 4 },
  bar:  { width: 7, borderRadius: 3, backgroundColor: '#FFFFFF' },
});

// ─── Hero card ────────────────────────────────────────────────────────────────
export function TodayHero(): React.ReactElement {
  const currency      = useExpenseStore((s) => s.settings.currency);
  const todayTotal    = useSelectedDateTotal();
  const { total: monthTotal, progress, comfortLine } = useMonthProgress();
  const sparkData     = useSparklineData(7);
  const reducedMotion = useReducedMotion();

  // ── Orb float animations ──────────────────────────────────────────────────
  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      float1.value = 0;
      float2.value = 0;
      return;
    }
    // Orb 1 — 9 s cycle, ±14 px
    float1.value = withRepeat(
      withSequence(
        withTiming( 14, { duration: 4500, easing: Easing.inOut(Easing.sin) }),
        withTiming(-14, { duration: 4500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    // Orb 2 — 11 s cycle, reversed phase
    float2.value = withRepeat(
      withSequence(
        withTiming(-14, { duration: 5500, easing: Easing.inOut(Easing.sin) }),
        withTiming( 14, { duration: 5500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [reducedMotion]); // eslint-disable-line react-hooks/exhaustive-deps

  const orb1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: float1.value }],
  }));
  const orb2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: float2.value }],
  }));

  const progressWidth = Math.min(progress, 100);

  return (
    <View style={styles.container}>
      {/* Outer wrapper carries the drop shadow (can't mix shadow + overflow:hidden) */}
      <View style={styles.shadow}>
        {/* Card clips the orbs that bleed outside bounds */}
        <View style={styles.card}>

          {/* ── Background ─────────────────────────────────────────────────── */}
          {/* Layer 1 — base gradient: accent tint top-right → pure dark bottom-left */}
          <LinearGradient
            colors={[GRAD_TOP, '#17151F']}
            start={{ x: 0.88, y: 0 }}
            end={{ x: 0.18, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Layer 2 — Orb 1 (large, top-right, violet) */}
          <Animated.View style={[styles.orb1, orb1Style]} pointerEvents="none">
            <Svg width={240} height={240}>
              <Defs>
                <SvgRadial id="hero-orb1" cx="50%" cy="50%" rx="50%" ry="50%">
                  <Stop offset="0"    stopColor={colors.accent} stopOpacity="0.85" />
                  <Stop offset="0.55" stopColor={colors.accent} stopOpacity="0.28" />
                  <Stop offset="1"    stopColor={colors.accent} stopOpacity="0"    />
                </SvgRadial>
              </Defs>
              <Ellipse cx={120} cy={120} rx={120} ry={120} fill="url(#hero-orb1)" />
            </Svg>
          </Animated.View>

          {/* Layer 3 — Orb 2 (small, bottom-left, warm pinkish) */}
          <Animated.View style={[styles.orb2, orb2Style]} pointerEvents="none">
            <Svg width={140} height={140}>
              <Defs>
                <SvgRadial id="hero-orb2" cx="50%" cy="50%" rx="50%" ry="50%">
                  <Stop offset="0"   stopColor={ACCENT_WARM} stopOpacity="0.55" />
                  <Stop offset="0.6" stopColor={ACCENT_WARM} stopOpacity="0.15" />
                  <Stop offset="1"   stopColor={ACCENT_WARM} stopOpacity="0"    />
                </SvgRadial>
              </Defs>
              <Ellipse cx={70} cy={70} rx={70} ry={70} fill="url(#hero-orb2)" />
            </Svg>
          </Animated.View>

          {/* ── Content ────────────────────────────────────────────────────── */}
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

          {/* ── Progress bar ───────────────────────────────────────────────── */}
          <View style={styles.progressArea}>
            <View style={styles.progressRow}>
              <Animated.Text style={styles.progressLabel}>This month</Animated.Text>
              <Animated.Text style={styles.progressLabel}>
                {Math.round(progressWidth)}%
              </Animated.Text>
            </View>
            <View style={styles.track}>
              <LinearGradient
                colors={[ACCENT_BRIGHT, ACCENT_WARM]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.fill, { width: `${progressWidth}%` as `${number}%` }]}
              />
            </View>
          </View>

        </View>{/* /card */}
      </View>{/* /shadow */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['3'],
    paddingBottom: spacing['2'],
  },

  // Drop shadow lives outside the clipping box
  shadow: {
    borderRadius: 32,
    shadowColor: '#17151F',
    shadowOpacity: 0.28,
    shadowRadius: 48,
    shadowOffset: { width: 0, height: 24 },
    elevation: 16,
  },

  // Card clips the orbs
  card: {
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#17151F',
  },

  // Orb positioning (relative to card top-left)
  orb1: {
    position: 'absolute',
    top: -100,
    right: -70,
    width: 240,
    height: 240,
  },
  orb2: {
    position: 'absolute',
    bottom: -70,
    left: -40,
    width: 140,
    height: 140,
  },

  // ── Typography & layout ────────────────────────────────────────────────────
  body: {
    flexDirection: 'row',
    paddingHorizontal: spacing['5'],
    paddingTop: spacing['5'],
    paddingBottom: spacing['4'],
    gap: spacing['4'],
    alignItems: 'flex-end',
  },
  left:  { flex: 1, gap: spacing['1'] },
  right: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing['2'],
    paddingBottom: 2,
  },

  eyebrow: {
    fontFamily: typography.sansSemiBold ?? typography.sansMedium,
    fontSize: 11,
    letterSpacing: 1.6,
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
  },
  amount: {
    fontFamily: typography.serifFamily,
    fontSize: 58,
    color: '#FFFFFF',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
    lineHeight: 58 * 1.05,
  },
  comfort: {
    fontFamily: typography.sansFamily,
    fontSize: typography.size.xs,
    color: 'rgba(255,255,255,0.40)',
  },
  last7: {
    fontFamily: typography.sansMedium,
    fontSize: 9,
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 0.8,
  },

  progressArea: {
    paddingHorizontal: spacing['5'],
    paddingBottom: spacing['5'],
    gap: spacing['2'],
  },
  progressRow:   { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.xs,
    color: 'rgba(255,255,255,0.45)',
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
});
