import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import { colors, animation } from '@/ui/tokens';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface Props {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

function buildLinePath(data: number[], w: number, h: number, progress: number): string {
  'worklet';
  if (data.length === 0) return '';
  let maxVal = 1;
  for (let i = 0; i < data.length; i++) {
    if (data[i] > maxVal) maxVal = data[i];
  }
  const minVal = 0;
  const range = maxVal - minVal || 1;
  const stepX = w / (data.length > 1 ? data.length - 1 : 1);
  const pad = 4;

  const points = data.map((v, i) => ({
    x: i * stepX,
    y: h - pad - ((v - minVal) / range) * (h - pad * 2),
  }));

  // Partial draw based on progress
  const drawCount = Math.max(2, Math.floor(progress * points.length));
  const visible = points.slice(0, drawCount);

  return visible
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
}

export function Sparkline({
  data,
  width = 120,
  height = 36,
  color = colors.accentDim,
}: Props): React.ReactElement {
  const progress = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    progress.value = 0;
    if (reducedMotion) {
      progress.value = 1;
    } else {
      progress.value = withTiming(1, {
        duration: animation.draw,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [data, reducedMotion, progress]);

  const animatedProps = useAnimatedProps(() => ({
    d: buildLinePath(data, width, height, progress.value),
  }));

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={color} stopOpacity={0.3} />
            <Stop offset="1" stopColor={color} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <AnimatedPath
          animatedProps={animatedProps}
          stroke="url(#sparkGrad)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
