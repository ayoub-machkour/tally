import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '@/app/navigation';
import { useExpenseStore } from '@/store/expenseStore';
import { colors, typography, spacing, radii, animation } from '@/ui/tokens';

const absoluteFillStyles = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };
import type { CurrencySymbol } from '@/domain/types';

const CURRENCIES: { symbol: CurrencySymbol; label: string; flag: string }[] = [
  { symbol: '$',  label: 'USD', flag: '🇺🇸' },
  { symbol: '€',  label: 'EUR', flag: '🇪🇺' },
  { symbol: '£',  label: 'GBP', flag: '🇬🇧' },
  { symbol: '₹',  label: 'INR', flag: '🇮🇳' },
  { symbol: 'DH', label: 'MAD', flag: '🇲🇦' },
];

const COMFORT_MIN = 100;
const COMFORT_MAX = 5000;
const COMFORT_STEP = 50;

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Step1'>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function StepperButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}): React.ReactElement {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      style={[styles.stepperBtn, animStyle]}
      onPressIn={() => { scale.value = withSpring(0.88, animation.spring); }}
      onPressOut={() => { scale.value = withSpring(1, animation.spring); }}
      onPress={onPress}
      accessibilityLabel={label === '−' ? 'Decrease comfort line' : 'Increase comfort line'}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Animated.Text style={styles.stepperLabel}>{label}</Animated.Text>
    </AnimatedPressable>
  );
}

export function OnboardingStep1Screen({ navigation }: Props): React.ReactElement {
  const insets = useSafeAreaInsets();
  const updateSettings = useExpenseStore((s) => s.updateSettings);

  const [currency, setCurrency] = useState<CurrencySymbol>('$');
  const [comfortLine, setComfortLine] = useState(1000);

  const handleDecrease = (): void => {
    setComfortLine((v) => Math.max(COMFORT_MIN, v - COMFORT_STEP));
  };

  const handleIncrease = (): void => {
    setComfortLine((v) => Math.min(COMFORT_MAX, v + COMFORT_STEP));
  };

  const handleStart = async (): Promise<void> => {
    await updateSettings({ currency, comfortLine, onboarded: true });
  };

  const handleSkip = async (): Promise<void> => {
    await updateSettings({ onboarded: true });
  };

  const _ = navigation; // used for potential back navigation

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.heroTop, colors.heroMid]}
        style={absoluteFillStyles}
      />
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing['12'], paddingBottom: insets.bottom + spacing['8'] },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Animated.Text style={styles.stepLabel}>Step 2 of 2</Animated.Text>
          <Animated.Text style={styles.title}>Set your preferences</Animated.Text>
          <Animated.Text style={styles.subtitle}>
            You can change these anytime in Settings.
          </Animated.Text>
        </View>

        {/* Currency picker */}
        <View style={styles.section}>
          <Animated.Text style={styles.sectionLabel}>Currency</Animated.Text>
          <View style={styles.currencyRow}>
            {CURRENCIES.map((c) => (
              <Pressable
                key={c.symbol}
                style={[styles.currencyChip, currency === c.symbol && styles.currencyChipActive]}
                onPress={() => setCurrency(c.symbol)}
                accessibilityRole="radio"
                accessibilityLabel={`${c.label} ${c.flag}`}
                accessibilityState={{ checked: currency === c.symbol }}
              >
                <Animated.Text style={styles.currencyFlag}>{c.flag}</Animated.Text>
                <Animated.Text
                  style={[
                    styles.currencySymbol,
                    currency === c.symbol && styles.currencySymbolActive,
                  ]}
                >
                  {c.symbol}
                </Animated.Text>
                <Animated.Text
                  style={[
                    styles.currencyLabel,
                    currency === c.symbol && styles.currencyLabelActive,
                  ]}
                >
                  {c.label}
                </Animated.Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Comfort line */}
        <View style={styles.section}>
          <Animated.Text style={styles.sectionLabel}>Monthly comfort line</Animated.Text>
          <Animated.Text style={styles.sectionHint}>
            The amount you aim to stay under each month. Not a hard limit — just a guide.
          </Animated.Text>
          <View style={styles.stepper}>
            <StepperButton label="−" onPress={handleDecrease} />
            <View style={styles.stepperValue}>
              <Animated.Text style={styles.stepperCurrency}>{currency}</Animated.Text>
              <Animated.Text style={styles.stepperAmount}>
                {comfortLine.toLocaleString()}
              </Animated.Text>
            </View>
            <StepperButton label="+" onPress={handleIncrease} />
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.actions}>
          <Pressable
            style={styles.primaryBtn}
            onPress={handleStart}
            accessibilityRole="button"
            accessibilityLabel="Start tracking"
          >
            <Animated.Text style={styles.primaryBtnLabel}>Start tracking</Animated.Text>
          </Pressable>
          <Pressable
            style={styles.skipBtn}
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel="Skip for now"
          >
            <Animated.Text style={styles.skipBtnLabel}>Skip for now</Animated.Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const { width: SCREEN_W } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.heroTop },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.35,
  },
  orb1: {
    width: SCREEN_W * 0.8,
    height: SCREEN_W * 0.8,
    backgroundColor: colors.heroOrb1,
    top: -SCREEN_W * 0.3,
    left: -SCREEN_W * 0.1,
  },
  orb2: {
    width: SCREEN_W * 0.6,
    height: SCREEN_W * 0.6,
    backgroundColor: colors.heroOrb2,
    bottom: 0,
    right: -SCREEN_W * 0.2,
  },
  scroll: {
    paddingHorizontal: spacing['6'],
    gap: spacing['8'],
  },
  header: { gap: spacing['2'] },
  stepLabel: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.sm,
    color: colors.accentDim,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: typography.serifFamily,
    fontSize: 36,
    color: colors.heroText,
    letterSpacing: -1,
    lineHeight: 36 * 1.1,
  },
  subtitle: {
    fontFamily: typography.sansFamily,
    fontSize: typography.size.sm,
    color: colors.heroMuted,
    lineHeight: typography.size.sm * 1.6,
  },
  section: {
    backgroundColor: colors.glassLight,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: spacing['6'],
    gap: spacing['4'],
  },
  sectionLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.size.base,
    color: colors.heroText,
  },
  sectionHint: {
    fontFamily: typography.sansFamily,
    fontSize: typography.size.sm,
    color: colors.heroMuted,
    lineHeight: typography.size.sm * 1.55,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: spacing['2'],
    flexWrap: 'wrap',
  },
  currencyChip: {
    flex: 1,
    minWidth: 60,
    alignItems: 'center',
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['2'],
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 2,
  },
  currencyChipActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}30`,
  },
  currencyFlag: { fontSize: 20 },
  currencySymbol: {
    fontFamily: typography.serifFamily,
    fontSize: typography.size.lg,
    color: colors.heroMuted,
  },
  currencySymbolActive: { color: colors.heroText },
  currencyLabel: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.xs,
    color: colors.heroMuted,
  },
  currencyLabelActive: { color: colors.accentDim },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing['4'],
  },
  stepperBtn: {
    width: 52,
    height: 52,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  stepperLabel: {
    fontFamily: typography.sansFamily,
    fontSize: 22,
    color: colors.heroText,
    lineHeight: 26,
  },
  stepperValue: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: spacing['1'],
  },
  stepperCurrency: {
    fontFamily: typography.serifFamily,
    fontSize: typography.size.xl,
    color: colors.heroMuted,
  },
  stepperAmount: {
    fontFamily: typography.serifFamily,
    fontSize: 40,
    color: colors.heroText,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  actions: { gap: spacing['3'] },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: radii.xl,
    paddingVertical: spacing['5'],
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  primaryBtnLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.size.md,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  skipBtn: {
    paddingVertical: spacing['4'],
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  skipBtnLabel: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.sm,
    color: colors.heroMuted,
  },
});
