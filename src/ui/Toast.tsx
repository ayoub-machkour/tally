import React, { useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { colors, radii, shadows, spacing, typography, animation } from './tokens';

interface Props {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export function Toast({ message, visible, onHide, duration = 2200 }: Props): React.ReactElement {
  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);

  const hide = useCallback((): void => {
    onHide();
  }, [onHide]);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 18, stiffness: 220 });
      opacity.value = withTiming(1, { duration: animation.fast });
      // Auto-dismiss
      opacity.value = withDelay(
        duration - 250,
        withTiming(0, { duration: 250 }, (done) => {
          if (done) runOnJS(hide)();
        }),
      );
      translateY.value = withDelay(duration - 250, withTiming(80, { duration: 250 }));
    } else {
      translateY.value = 80;
      opacity.value = 0;
    }
  }, [visible, duration, translateY, opacity, hide]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      <View style={styles.toast}>
        <Animated.Text style={styles.text}>{message}</Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  toast: {
    backgroundColor: colors.ink,
    paddingHorizontal: spacing['6'],
    paddingVertical: spacing['3'],
    borderRadius: radii.full,
    maxWidth: 280,
    ...shadows.lg,
  },
  text: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.sm,
    color: colors.paper,
    textAlign: 'center',
  },
});
