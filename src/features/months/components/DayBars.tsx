import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';
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
import type { DailyTotal } from '@/domain/types';
import type { CurrencySymbol } from '@/domain/types';

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_H = 80;
const CHART_PAD = 24;
const BAR_GAP = 1.5;

interface BarProps {
  value: number;
  maxValue: number;
  index: number;
  isPeak: boolean;
  isSelected: boolean;
  barWidth: number;
  onPress: () => void;
}

function Bar({ value, maxValue, index, isPeak, isSelected, barWidth, onPress }: BarProps): React.ReactElement {
  const height = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  const targetH = maxValue > 0 ? Math.max(2, (value / maxValue) * CHART_H) : 0;

  useEffect(() => {
    const delay = reducedMotion ? 0 : index * 12;
    const dur = reducedMotion ? 0 : animation.draw;
    height.value = withDelay(delay, withTiming(targetH, { duration: dur, easing: Easing.out(Easing.cubic) }));
  }, [targetH, index, reducedMotion, height]);

  const barStyle = useAnimatedStyle(() => ({
    height: height.value,
    backgroundColor: isSelected ? colors.accent : (isPeak ? colors.accent : colors.accentDim),
    opacity: isSelected ? 1 : (isPeak ? 1 : 0.45),
  }));

  return (
    <Pressable
      style={[styles.barWrapper, { width: barWidth }]}
      onPress={onPress}
      hitSlop={{ top: 4, bottom: 0, left: 0, right: 0 }}
    >
      <Animated.View style={[styles.bar, barStyle, { width: barWidth - BAR_GAP, borderRadius: Math.max(2, barWidth / 3) }]} />
    </Pressable>
  );
}

interface Props {
  dailyTotals: DailyTotal[];
  peakDate?: string;
  currency: CurrencySymbol;
}

export function DayBars({ dailyTotals, peakDate, currency }: Props): React.ReactElement {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const maxValue = Math.max(...dailyTotals.map((d) => d.total), 1);
  const count = dailyTotals.length;
  const availableW = SCREEN_W - CHART_PAD * 2;
  const barWidth = availableW / Math.max(count, 1);

  const handlePress = useCallback((i: number) => {
    setSelectedIndex((prev) => (prev === i ? null : i));
  }, []);

  const selected = selectedIndex !== null ? dailyTotals[selectedIndex] : null;

  return (
    <View style={styles.container}>
      {/* Info chip for selected bar */}
      {selected ? (
        <View style={styles.infoChip}>
          <Animated.Text style={styles.infoDate}>
            {selected.date.slice(5).replace('-', '/')}
          </Animated.Text>
          <Animated.Text style={styles.infoAmount}>
            {formatCurrency(selected.total, currency)}
          </Animated.Text>
        </View>
      ) : (
        <View style={styles.infoChipPlaceholder}>
          <Animated.Text style={styles.infoHint}>Tap a bar to see details</Animated.Text>
        </View>
      )}

      <View style={[styles.chartArea, { height: CHART_H }]}>
        {dailyTotals.map((d, i) => (
          <Bar
            key={d.date}
            value={d.total}
            maxValue={maxValue}
            index={i}
            isPeak={d.date === peakDate}
            isSelected={i === selectedIndex}
            barWidth={barWidth}
            onPress={() => handlePress(i)}
          />
        ))}
      </View>
      {/* X-axis: show day numbers every 5 */}
      <View style={styles.xAxis}>
        {dailyTotals.map((d, i) => {
          const dayNum = parseInt(d.date.split('-')[2], 10);
          const showLabel = dayNum === 1 || dayNum % 5 === 0;
          return (
            <View key={d.date} style={{ width: barWidth, alignItems: 'center' }}>
              {showLabel && (
                <Animated.Text style={[styles.xLabel, i === selectedIndex && styles.xLabelActive]}>
                  {dayNum}
                </Animated.Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: CHART_PAD,
    gap: spacing['2'],
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
  },
  infoDate: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.xs,
    color: colors.accent,
    fontVariant: ['tabular-nums'],
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
  },
  infoHint: {
    fontFamily: typography.sansFamily,
    fontSize: typography.size.xs,
    color: colors.muted,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: CHART_H,
  },
  bar: {
    minHeight: 2,
  },
  xAxis: {
    flexDirection: 'row',
    marginTop: 2,
  },
  xLabel: {
    fontFamily: typography.sansFamily,
    fontSize: 9,
    color: colors.muted,
    fontVariant: ['tabular-nums'],
  },
  xLabelActive: {
    color: colors.accent,
    fontFamily: typography.sansSemiBold,
  },
});
