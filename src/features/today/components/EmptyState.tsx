import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import { colors, typography, spacing } from '@/ui/tokens';

interface Props {
  isNoSpendDay?: boolean;
}

function OrbitDot({
  radius,
  size,
  color,
  speed,
  offset,
}: {
  radius: number;
  size: number;
  color: string;
  speed: number;
  offset: number;
}): React.ReactElement {
  const angle = useSharedValue(offset);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!reducedMotion) {
      angle.value = withRepeat(
        withTiming(offset + Math.PI * 2, { duration: speed, easing: Easing.linear }),
        -1,
        false,
      );
    }
  }, [angle, offset, speed, reducedMotion]);

  const animStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    transform: [
      { translateX: Math.cos(angle.value) * radius - size / 2 },
      { translateY: Math.sin(angle.value) * radius - size / 2 },
    ],
    left: '50%',
    top: '50%',
  }));

  return <Animated.View style={animStyle} />;
}

export function EmptyState({ isNoSpendDay = false }: Props): React.ReactElement {
  const titleOpacity = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    titleOpacity.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(1, { duration: reducedMotion ? 0 : 400 }),
    );
  }, [isNoSpendDay, titleOpacity, reducedMotion]);

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));

  return (
    <View style={styles.container}>
      {/* Orbit illustration */}
      <View style={styles.orbit}>
        <OrbitDot radius={42} size={8}  color={colors.accent}    speed={4000} offset={0} />
        <OrbitDot radius={42} size={5}  color={colors.accentDim} speed={4000} offset={Math.PI * 0.67} />
        <OrbitDot radius={42} size={6}  color={colors.accentDim} speed={4000} offset={Math.PI * 1.33} />
        <OrbitDot radius={60} size={10} color={colors.line}       speed={7000} offset={Math.PI * 0.5} />
        <OrbitDot radius={60} size={6}  color={colors.surface}    speed={7000} offset={Math.PI * 1.5} />
        {/* Center dot */}
        <View style={styles.centerDot} />
      </View>

      <Animated.View style={[styles.text, titleStyle]}>
        {isNoSpendDay ? (
          <>
            <Animated.Text style={styles.title}>A no-spend day</Animated.Text>
            <Animated.Text style={styles.subtitle}>
              Count it as a win.
            </Animated.Text>
          </>
        ) : (
          <>
            <Animated.Text style={styles.title}>Nothing yet today</Animated.Text>
            <Animated.Text style={styles.subtitle}>
              Tap + to log your first expense.
            </Animated.Text>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['16'],
    gap: spacing['8'],
  },
  orbit: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
    opacity: 0.6,
  },
  text: {
    alignItems: 'center',
    gap: spacing['2'],
  },
  title: {
    fontFamily: typography.serifFamily,
    fontSize: typography.size.xl,
    color: colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.sansFamily,
    fontSize: typography.size.sm,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: typography.size.sm * 1.6,
  },
});
