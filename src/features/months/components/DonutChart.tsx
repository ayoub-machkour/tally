import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import { CATEGORY_COLORS_HEX } from '@/domain/categories';
import { animation } from '@/ui/tokens';
import type { CategoryBreakdown } from '@/domain/types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 180;
const STROKE = 24;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;
const CENTER = SIZE / 2;

interface SegmentProps {
  percentage: number;
  color: string;
  offset: number;
  index: number;
  total: number;
}

function DonutSegment({ percentage, color, offset, index, total }: SegmentProps): React.ReactElement {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    const delay = reducedMotion ? 0 : index * (animation.draw / total);
    const dur = reducedMotion ? 0 : animation.draw;
    progress.value = withDelay(delay, withTiming(1, { duration: dur, easing: Easing.out(Easing.quad) }));
    return () => { progress.value = 0; };
  }, [percentage, index, total, reducedMotion, progress]);

  const dashLength = (percentage / 100) * CIRCUMFERENCE;
  const animProps = useAnimatedProps(() => ({
    strokeDasharray: [dashLength * progress.value, CIRCUMFERENCE],
    strokeDashoffset: -(offset / 100) * CIRCUMFERENCE,
  }));

  return (
    <AnimatedCircle
      cx={CENTER}
      cy={CENTER}
      r={R}
      fill="none"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
      animatedProps={animProps}
      rotation="-90"
      origin={`${CENTER}, ${CENTER}`}
    />
  );
}

interface Props {
  breakdown: CategoryBreakdown[];
  centerLabel?: string;
  centerSublabel?: string;
}

export function DonutChart({ breakdown, centerLabel, centerSublabel }: Props): React.ReactElement {
  let cumOffset = 0;
  const total = breakdown.length;

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        <G>
          {/* Background ring */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={R}
            fill="none"
            stroke="#E8E4DD"
            strokeWidth={STROKE}
          />
          {/* Segments */}
          {breakdown.map((item, i) => {
            const seg = (
              <DonutSegment
                key={item.category}
                percentage={item.percentage}
                color={CATEGORY_COLORS_HEX[item.category]}
                offset={cumOffset}
                index={i}
                total={total}
              />
            );
            cumOffset += item.percentage;
            return seg;
          })}
        </G>
      </Svg>

      {/* Center text */}
      {centerLabel && (
        <View style={styles.center}>
          <Animated.Text style={styles.centerLabel} numberOfLines={1}>
            {centerLabel}
          </Animated.Text>
          {centerSublabel && (
            <Animated.Text style={styles.centerSublabel}>{centerSublabel}</Animated.Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: SIZE - STROKE * 2 - 8,
  },
  centerLabel: {
    fontSize: 22,
    fontFamily: 'InstrumentSerif-Regular',
    color: '#F0EDF8',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  centerSublabel: {
    fontSize: 11,
    fontFamily: 'InstrumentSans-Regular',
    color: '#9B93B8',
    textAlign: 'center',
    marginTop: 2,
  },
});
