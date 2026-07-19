import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '@/app/navigation';
import { colors, typography, spacing, radii, animation } from '@/ui/tokens';

const absoluteFillStyles = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Step0'>;
};

export function OnboardingStep0Screen({ navigation }: Props): React.ReactElement {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();

  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const buttonY = useSharedValue(20);

  useEffect(() => {
    const dur = reducedMotion ? 0 : animation.slow;
    titleOpacity.value = withDelay(200, withTiming(1, { duration: dur }));
    titleY.value = withDelay(200, withTiming(0, { duration: dur }));
    subtitleOpacity.value = withDelay(500, withTiming(1, { duration: dur }));
    buttonOpacity.value = withDelay(800, withTiming(1, { duration: animation.normal }));
    buttonY.value = withDelay(800, withSpring(0, { damping: 18, stiffness: 200 }));
  }, [reducedMotion, titleOpacity, titleY, subtitleOpacity, buttonOpacity, buttonY]);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));
  const subtitleStyle = useAnimatedStyle(() => ({ opacity: subtitleOpacity.value }));
  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonY.value }],
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.heroTop, colors.heroMid]}
        style={absoluteFillStyles}
      />

      {/* Blurred orbs */}
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />
      <View style={[styles.orb, styles.orb3]} />

      <View style={[styles.content, { paddingTop: insets.top + spacing['16'] }]}>
        {/* Wordmark */}
        <Animated.View style={titleStyle}>
          <Animated.Text style={styles.wordmark}>tally</Animated.Text>
        </Animated.View>

        {/* Hero tagline */}
        <Animated.View style={[styles.heroBlock, titleStyle]}>
          <Animated.Text style={styles.heroLine1}>Know where</Animated.Text>
          <Animated.Text style={styles.heroLine2}>it goes.</Animated.Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          Log a spend in 2 taps.{'\n'}No accounts. No cloud. Just clarity.
        </Animated.Text>
      </View>

      {/* CTA */}
      <Animated.View
        style={[
          styles.cta,
          { paddingBottom: Math.max(insets.bottom + spacing['8'], spacing['12']) },
          buttonStyle,
        ]}
      >
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate('Step1')}
          accessibilityRole="button"
          accessibilityLabel="Get started"
        >
          <Animated.Text style={styles.buttonLabel}>Get started</Animated.Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.heroTop,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.45,
  },
  orb1: {
    width: SCREEN_W * 0.9,
    height: SCREEN_W * 0.9,
    backgroundColor: colors.heroOrb1,
    top: -SCREEN_W * 0.2,
    right: -SCREEN_W * 0.25,
  },
  orb2: {
    width: SCREEN_W * 0.7,
    height: SCREEN_W * 0.7,
    backgroundColor: colors.heroOrb2,
    bottom: SCREEN_H * 0.1,
    left: -SCREEN_W * 0.2,
  },
  orb3: {
    width: SCREEN_W * 0.5,
    height: SCREEN_W * 0.5,
    backgroundColor: colors.heroOrb3,
    top: SCREEN_H * 0.35,
    right: -SCREEN_W * 0.1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing['8'],
    gap: spacing['6'],
  },
  wordmark: {
    fontFamily: typography.serifItalic,
    fontSize: typography.size.lg,
    color: colors.accentDim,
    letterSpacing: 1,
  },
  heroBlock: {
    marginTop: spacing['8'],
    gap: -8,
  },
  heroLine1: {
    fontFamily: typography.serifFamily,
    fontSize: 52,
    lineHeight: 52 * 1.05,
    color: colors.heroText,
    letterSpacing: -1.5,
  },
  heroLine2: {
    fontFamily: typography.serifItalic,
    fontSize: 52,
    lineHeight: 52 * 1.05,
    color: colors.heroText,
    letterSpacing: -1.5,
  },
  subtitle: {
    fontFamily: typography.sansFamily,
    fontSize: typography.size.base,
    lineHeight: typography.size.base * 1.6,
    color: colors.heroMuted,
    marginTop: spacing['4'],
  },
  cta: {
    paddingHorizontal: spacing['8'],
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radii.xl,
    paddingVertical: spacing['5'],
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  buttonLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.size.md,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});
