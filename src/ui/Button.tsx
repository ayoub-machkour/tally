import React, { useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, radii, spacing, typography, animation, minTouchTarget } from './tokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: Variant;
  size?: Size;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
  disabled = false,
  icon,
  onPress,
  ...rest
}: Props): React.ReactElement {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback((): void => {
    scale.value = withSpring(0.93, animation.spring);
  }, [scale]);

  const handlePressOut = useCallback((): void => {
    scale.value = withSpring(1, animation.spring);
  }, [scale]);

  return (
    <AnimatedPressable
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      {...rest}
    >
      {icon}
      <Animated.Text
        style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}
      >
        {label}
      </Animated.Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    gap: spacing['2'],
    borderRadius: radii.xl,
    ...minTouchTarget,
  },
  // Variants
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  ghost: {
    backgroundColor: colors.transparent,
  },
  danger: {
    backgroundColor: colors.dangerBg,
  },
  disabled: {
    opacity: 0.4,
  },
  // Sizes
  size_sm: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    minHeight: 36,
    borderRadius: radii.lg,
  },
  size_md: {
    paddingHorizontal: spacing['6'],
    paddingVertical: spacing['4'],
  },
  size_lg: {
    paddingHorizontal: spacing['8'],
    paddingVertical: spacing['5'],
  },
  // Text base
  text: {
    fontFamily: typography.sansSemiBold,
    letterSpacing: -0.1,
  },
  // Text variants
  text_primary: { color: '#FFFFFF' },
  text_secondary: { color: colors.ink },
  text_ghost: { color: colors.accent },
  text_danger: { color: colors.danger },
  // Text sizes
  textSize_sm: { fontSize: typography.size.sm },
  textSize_md: { fontSize: typography.size.base },
  textSize_lg: { fontSize: typography.size.md },
});
