import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import { colors, typography, animation } from '@/ui/tokens';
import type { DailyTotal } from '@/domain/types';

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_H = 80;
const CHART_PAD = 24;
const BAR_GAP = 1.5;

interface BarProps {
  value: number;
  maxValue: number;
  index: number;
  isPeak: boolean;
  barWidth: number;
}

function Bar({ value, maxValue, index, isPeak, barWidth }: BarProps): React.ReactElement {
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
    backgroundColor: isPeak ? colors.accent : colors.accentDim,
    opacity: isPeak ? 1 : 0.45,
  }));

  return (
    <View style={[styles.barWrapper, { width: barWidth }]}>
      <Animated.View style={[styles.bar, barStyle, { width: barWidth - BAR_GAP, borderRadius: Math.max(2, barWidth / 3) }]} />
    </View>
  );
}

interface Props {
  dailyTotals: DailyTotal[];
  peakDate?: string;
}

export function DayBars({ dailyTotals, peakDate }: Props): React.ReactElement {
  const maxValue = Math.max(...dailyTotals.map((d) => d.total), 1);
  const count = dailyTotals.length;
  const availableW = SCREEN_W - CHART_PAD * 2;
  const barWidth = availableW / Math.max(count, 1);

  return (
    <View style={styles.container}>
      <View style={[styles.chartArea, { height: CHART_H }]}>
        {dailyTotals.map((d, i) => (
          <Bar
            key={d.date}
            value={d.total}
            maxValue={maxValue}
            index={i}
            isPeak={d.date === peakDate}
            barWidth={barWidth}
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
                <Animated.Text style={styles.xLabel}>{dayNum}</Animated.Text>
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
    marginTop: 4,
  },
  xLabel: {
    fontFamily: typography.sansFamily,
    fontSize: 9,
    color: colors.muted,
    fontVariant: ['tabular-nums'],
  },
});
