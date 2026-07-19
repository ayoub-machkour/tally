import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import { Text, StyleSheet, type TextStyle } from 'react-native';
import { typography, animation } from '@/ui/tokens';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface Props {
  value: number;
  prefix?: string;
  style?: TextStyle;
  duration?: number;
}

export function CountUpAmount({
  value,
  prefix = '',
  style,
  duration = animation.countUp,
}: Props): React.ReactElement {
  const animatedValue = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      animatedValue.value = value;
    } else {
      animatedValue.value = withTiming(value, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [value, duration, reducedMotion, animatedValue]);

  const animatedProps = useAnimatedProps(() => {
    const displayed = animatedValue.value;
    const text = `${prefix}${displayed.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    return { text, children: undefined } as { text: string; children: undefined };
  });

  return (
    <AnimatedText
      style={[styles.base, style]}
      animatedProps={animatedProps}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: typography.serifFamily,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
});
