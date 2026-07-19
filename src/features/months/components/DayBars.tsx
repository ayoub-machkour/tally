import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from 'react-native-svg';
import { colors, typography, spacing, radii } from '@/ui/tokens';
import { formatCurrency } from '@/lib/currency';
import type { DailyTotal, CurrencySymbol } from '@/domain/types';

const CHART_H = 90;

interface Props {
  dailyTotals: DailyTotal[];
  peakDate?: string;
  currency: CurrencySymbol;
}

export function DayBars({ dailyTotals, peakDate, currency }: Props): React.ReactElement {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [chartWidth, setChartWidth] = useState(0);

  const handlePress = useCallback((i: number) => {
    setSelectedIndex((prev) => (prev === i ? null : i));
  }, []);

  const selected = selectedIndex !== null ? dailyTotals[selectedIndex] : null;
  const count = dailyTotals.length;
  const maxValue = Math.max(...dailyTotals.map((d) => d.total), 1);

  // Compute (x, y) for each data point once chartWidth is known
  const pts =
    chartWidth > 0 && count > 0
      ? dailyTotals.map((d, i) => {
          const x = count === 1 ? chartWidth / 2 : (i / (count - 1)) * chartWidth;
          const ratio = d.total / maxValue;
          const y = CHART_H - Math.max(d.total > 0 ? 10 : 0, ratio * (CHART_H - 10));
          return { x, y, ...d };
        })
      : [];

  const linePath =
    pts.length > 0
      ? pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
      : '';

  const areaPath =
    pts.length > 0
      ? [
          `M ${pts[0].x.toFixed(1)} ${CHART_H}`,
          ...pts.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`),
          `L ${pts[count - 1].x.toFixed(1)} ${CHART_H}`,
          'Z',
        ].join(' ')
      : '';

  return (
    <View style={styles.container}>
      {/* Info chip */}
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
          <Animated.Text style={styles.infoHint}>Tap a point to see details</Animated.Text>
        </View>
      )}

      {/* Chart + x-axis */}
      <View
        style={styles.chartWrapper}
        onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
      >
        {chartWidth > 0 && pts.length > 0 && (
          <>
            <Svg width={chartWidth} height={CHART_H}>
              <Defs>
                <SvgGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={colors.accent} stopOpacity="0.28" />
                  <Stop offset="1" stopColor={colors.accent} stopOpacity="0" />
                </SvgGradient>
              </Defs>

              {/* Gradient fill */}
              <Path d={areaPath} fill="url(#areaFill)" />

              {/* Line */}
              <Path
                d={linePath}
                stroke={colors.accent}
                strokeWidth="1.8"
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="none"
              />

              {/* Visible dots */}
              {pts.map((p, i) => {
                const isSel = i === selectedIndex;
                const isPeak = p.date === peakDate;
                return (
                  <Circle
                    key={`dot-${p.date}`}
                    cx={p.x}
                    cy={p.y}
                    r={isSel ? 5.5 : isPeak ? 4.5 : 3}
                    fill={isSel || isPeak ? colors.accent : colors.accentDim}
                    stroke={isSel ? '#FFFFFF' : 'none'}
                    strokeWidth={2}
                  />
                );
              })}

              {/* Invisible larger touch targets */}
              {pts.map((p, i) => (
                <Circle
                  key={`touch-${p.date}`}
                  cx={p.x}
                  cy={p.y}
                  r={14}
                  fill="transparent"
                  onPress={() => handlePress(i)}
                />
              ))}
            </Svg>

            {/* X-axis labels */}
            <View style={[styles.xAxis, { width: chartWidth }]}>
              {pts.map((p, i) => {
                const dayNum = parseInt(p.date.split('-')[2], 10);
                const show = dayNum === 1 || dayNum % 5 === 0;
                if (!show) return null;
                return (
                  <View
                    key={p.date}
                    style={[styles.xLabelWrapper, { left: p.x - 10 }]}
                  >
                    <Animated.Text
                      style={[styles.xLabel, i === selectedIndex && styles.xLabelActive]}
                    >
                      {dayNum}
                    </Animated.Text>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  chartWrapper: {
    width: '100%',
  },
  xAxis: {
    position: 'relative',
    height: 16,
    marginTop: 2,
  },
  xLabelWrapper: {
    position: 'absolute',
    width: 20,
    alignItems: 'center',
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
