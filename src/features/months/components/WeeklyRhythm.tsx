import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import { colors, typography, spacing, animation } from '@/ui/tokens';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const BAR_H = 60;

interface BarProps {
  value: number;
  maxValue: number;
  label: string;
  index: number;
  isPeak: boolean;
}

function RhythmBar({ value, maxValue, label, index, isPeak }: BarProps): React.ReactElement {
  const height = useSharedValue(0);
  const reducedMotion = useReducedMotion();
  const targetH = maxValue > 0 ? Math.max(4, (value / maxValue) * BAR_H) : 4;

  useEffect(() => {
    const delay = reducedMotion ? 0 : index * 50;
    height.value = withDelay(
      delay,
      withTiming(targetH, {
        duration: reducedMotion ? 0 : animation.draw,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [targetH, index, reducedMotion, height]);

  const barStyle = useAnimatedStyle(() => ({ height: height.value }));

  return (
    <View style={styles.dayCol}>
      <View style={[styles.barTrack, { height: BAR_H }]}>
        <Animated.View
          style={[
            styles.bar,
            barStyle,
            isPeak && styles.barPeak,
          ]}
        />
      </View>
      <Animated.Text style={[styles.dayLabel, isPeak && styles.dayLabelPeak]}>
        {label}
      </Animated.Text>
    </View>
  );
}

interface Props {
  rhythm: number[]; // 7 values, index 0 = Sunday
}

export function WeeklyRhythm({ rhythm }: Props): React.ReactElement {
  const maxValue = Math.max(...rhythm, 1);
  const peakIndex = rhythm.indexOf(Math.max(...rhythm));

  return (
    <View style={styles.container}>
      {rhythm.map((v, i) => (
        <RhythmBar
          key={i}
          value={v}
          maxValue={maxValue}
          label={DAY_LABELS[i]}
          index={i}
          isPeak={i === peakIndex && v > 0}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['5'],
    gap: spacing['2'],
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
    gap: spacing['2'],
  },
  barTrack: {
    width: '100%',
    maxWidth: 28,
    justifyContent: 'flex-end',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.line,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    backgroundColor: colors.accentDim,
    opacity: 0.55,
  },
  barPeak: {
    backgroundColor: colors.accent,
    opacity: 1,
  },
  dayLabel: {
    fontFamily: typography.sansFamily,
    fontSize: 10,
    color: colors.muted,
    textAlign: 'center',
  },
  dayLabelPeak: {
    color: colors.accent,
    fontFamily: typography.sansSemiBold,
  },
});
