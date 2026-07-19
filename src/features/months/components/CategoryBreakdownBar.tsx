import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';
import { CATEGORIES, CATEGORY_COLORS_HEX } from '@/domain/categories';
import { formatCurrencyShort, formatPercent } from '@/lib/currency';
import { colors, typography, spacing, radii } from '@/ui/tokens';
import type { CategoryBreakdown } from '@/domain/types';
import type { CurrencySymbol } from '@/domain/types';

interface SegmentProps {
  pct: number;
  color: string;
  index: number;
}

function Segment({ pct, color, index }: SegmentProps): React.ReactElement {
  const width = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const delay = reducedMotion ? 0 : index * 80;
    width.value = withDelay(
      delay,
      withTiming(pct, { duration: reducedMotion ? 0 : 500 }),
    );
  }, [pct, index, reducedMotion, width]);

  const style = useAnimatedStyle(() => ({ flex: width.value / 100 }));

  return (
    <Animated.View
      style={[styles.segment, { backgroundColor: color }, style]}
    />
  );
}

interface Props {
  breakdown: CategoryBreakdown[];
  currency: CurrencySymbol;
}

export function CategoryBreakdownBar({ breakdown, currency }: Props): React.ReactElement {
  return (
    <View style={styles.container}>
      {/* Segmented bar */}
      <View style={styles.bar}>
        {breakdown.map((item, i) => (
          <Segment
            key={item.category}
            pct={item.percentage}
            color={CATEGORY_COLORS_HEX[item.category]}
            index={i}
          />
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {breakdown.map((item) => {
          const meta = CATEGORIES.find((c) => c.id === item.category);
          return (
            <View key={item.category} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: CATEGORY_COLORS_HEX[item.category] }]} />
              <Animated.Text style={styles.legendLabel} numberOfLines={1}>
                {meta?.label ?? item.category}
              </Animated.Text>
              <Animated.Text style={styles.legendPct}>
                {formatPercent(item.percentage)}
              </Animated.Text>
              <Animated.Text style={styles.legendAmount}>
                {formatCurrencyShort(item.total, currency)}
              </Animated.Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing['4'],
  },
  bar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: radii.full,
    overflow: 'hidden',
    backgroundColor: colors.line,
  },
  segment: {
    height: '100%',
  },
  legend: {
    gap: spacing['3'],
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  legendLabel: {
    flex: 1,
    fontFamily: typography.sansFamily,
    fontSize: typography.size.sm,
    color: colors.ink,
  },
  legendPct: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.sm,
    color: colors.muted,
    fontVariant: ['tabular-nums'],
    minWidth: 44,
    textAlign: 'right',
  },
  legendAmount: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.size.sm,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
    minWidth: 64,
    textAlign: 'right',
  },
});
