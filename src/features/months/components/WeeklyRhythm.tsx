import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import { colors, typography, spacing, radii, animation } from '@/ui/tokens';
import { formatCurrency } from '@/lib/currency';
import type { CurrencySymbol } from '@/domain/types';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const BAR_H = 60;

interface BarProps {
  value: number;
  maxValue: number;
  label: string;
  index: number;
  isPeak: boolean;
  isSelected: boolean;
  onPress: () => void;
}

function RhythmBar({ value, maxValue, label, index, isPeak, isSelected, onPress }: BarProps): React.ReactElement {
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

  const active = isSelected || isPeak;

  return (
    <Pressable style={styles.dayCol} onPress={onPress} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
      <View style={[styles.barTrack, { height: BAR_H }]}>
        <Animated.View
          style={[
            styles.bar,
            barStyle,
            active && styles.barPeak,
            isSelected && styles.barSelected,
          ]}
        />
      </View>
      <Animated.Text style={[styles.dayLabel, active && styles.dayLabelPeak]}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

interface Props {
  rhythm: number[]; // 7 values, index 0 = Sunday
  currency: CurrencySymbol;
}

export function WeeklyRhythm({ rhythm, currency }: Props): React.ReactElement {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const maxValue = Math.max(...rhythm, 1);
  const peakIndex = rhythm.indexOf(Math.max(...rhythm));

  const handlePress = useCallback((i: number) => {
    setSelectedIndex((prev) => (prev === i ? null : i));
  }, []);

  const selected = selectedIndex !== null ? { label: DAY_LABELS[selectedIndex], value: rhythm[selectedIndex] } : null;

  return (
    <View style={styles.wrapper}>
      {/* Info chip for selected day */}
      {selected ? (
        <View style={styles.infoChip}>
          <Animated.Text style={styles.infoDay}>{selected.label}</Animated.Text>
          <Animated.Text style={styles.infoAmount}>
            {formatCurrency(selected.value, currency)} avg
          </Animated.Text>
        </View>
      ) : (
        <View style={styles.infoChipPlaceholder}>
          <Animated.Text style={styles.infoHint}>Tap a day to see details</Animated.Text>
        </View>
      )}

      <View style={styles.container}>
        {rhythm.map((v, i) => (
          <RhythmBar
            key={i}
            value={v}
            maxValue={maxValue}
            label={DAY_LABELS[i]}
            index={i}
            isPeak={i === peakIndex && v > 0}
            isSelected={i === selectedIndex}
            onPress={() => handlePress(i)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing['3'],
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    backgroundColor: colors.accentBg,
    borderRadius: radii.full,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    alignSelf: 'flex-start',
    marginHorizontal: spacing['5'],
  },
  infoDay: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.xs,
    color: colors.accent,
  },
  infoAmount: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.size.sm,
    color: colors.accent,
    fontVariant: ['tabular-nums'],
  },
  infoChipPlaceholder: {
    height: 30,
    justifyContent: 'center',
    marginHorizontal: spacing['5'],
  },
  infoHint: {
    fontFamily: typography.sansFamily,
    fontSize: typography.size.xs,
    color: colors.muted,
  },
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
  barSelected: {
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
