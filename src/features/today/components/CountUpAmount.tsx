import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import { TextInput, StyleSheet, type TextStyle } from 'react-native';
import { typography, animation } from '@/ui/tokens';

// AnimatedTextInput works reliably on Android New Architecture (RN 0.86+)
// where the `text` prop on AnimatedText no longer functions correctly.
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

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
    return { value: text };
  });

  return (
    <AnimatedTextInput
      style={[styles.base, style]}
      animatedProps={animatedProps}
      editable={false}
      underlineColorAndroid="transparent"
      caretHidden
      selectTextOnFocus={false}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: typography.serifFamily,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
    padding: 0,
    margin: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
});
