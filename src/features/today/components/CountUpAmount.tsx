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

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface Props {
  value: number;
  prefix?: string;
  style?: TextStyle;
  duration?: number;
}

function fmt(value: number, prefix: string): string {
  return `${prefix}${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export function CountUpAmount({
  value,
  prefix = '',
  style,
  duration = animation.countUp,
}: Props): React.ReactElement {
  const reducedMotion = useReducedMotion();

  // ── Instant path ────────────────────────────────────────────────────────────
  // When duration=0 or reducedMotion: render a plain React-controlled TextInput.
  // React updates it on the same render frame — zero Reanimated bridge overhead.
  if (reducedMotion || duration === 0) {
    return (
      <TextInput
        style={[styles.base, style]}
        value={fmt(value, prefix)}
        editable={false}
        underlineColorAndroid="transparent"
        caretHidden
        selectTextOnFocus={false}
      />
    );
  }

  // ── Animated path (count-up) ────────────────────────────────────────────────
  return <CountUpAnimated value={value} prefix={prefix} style={style} duration={duration} />;
}

// Separated so hooks are never called on the instant path (avoids hook-order issues)
function CountUpAnimated({
  value,
  prefix,
  style,
  duration,
}: Required<Props>): React.ReactElement {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, duration, animatedValue]);

  const animatedProps = useAnimatedProps(() => {
    const displayed = animatedValue.value;
    return {
      value: `${prefix}${displayed.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
    };
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
