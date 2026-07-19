import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useExpenseStore } from '@/store/expenseStore';
import { colors, typography, spacing, radii, shadows } from '@/ui/tokens';

const absoluteFillStyles = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };
import type { CurrencySymbol } from '@/domain/types';

const CURRENCIES: { symbol: CurrencySymbol; label: string }[] = [
  { symbol: '$', label: 'USD $' },
  { symbol: '€', label: 'EUR €' },
  { symbol: '£', label: 'GBP £' },
  { symbol: '₹', label: 'INR ₹' },
];

const COMFORT_MIN = 100;
const COMFORT_MAX = 10000;
const COMFORT_STEP = 50;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function SettingsSheet({ visible, onClose }: Props): React.ReactElement {
  const insets = useSafeAreaInsets();
  const settings = useExpenseStore((s) => s.settings);
  const updateSettings = useExpenseStore((s) => s.updateSettings);
  const eraseData = useExpenseStore((s) => s.eraseData);

  const [currency, setCurrency] = useState<CurrencySymbol>(settings.currency);
  const [comfortLine, setComfortLine] = useState(settings.comfortLine);

  const translateY = useSharedValue(Dimensions.get('window').height);

  React.useEffect(() => {
    if (visible) {
      setCurrency(settings.currency);
      setComfortLine(settings.comfortLine);
      translateY.value = withSpring(0, { damping: 26, stiffness: 260 });
    } else {
      translateY.value = withTiming(Dimensions.get('window').height, { duration: 280 });
    }
  }, [visible, settings, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleSave = useCallback(async () => {
    await updateSettings({ currency, comfortLine });
    onClose();
  }, [currency, comfortLine, updateSettings, onClose]);

  const handleErase = useCallback(() => {
    Alert.alert(
      'Erase all data',
      'This will permanently delete all your expenses and reset settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase',
          style: 'destructive',
          onPress: async () => {
            await eraseData();
            onClose();
          },
        },
      ],
    );
  }, [eraseData, onClose]);

  const handleReplayOnboarding = useCallback(async () => {
    await updateSettings({ onboarded: false });
    onClose();
  }, [updateSettings, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close settings" />

        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom + spacing['4'], spacing['8']) },
            sheetStyle,
          ]}
        >
          <View style={styles.handle} />

          <Animated.Text style={styles.title}>Settings</Animated.Text>

          {/* Currency */}
          <View style={styles.section}>
            <Animated.Text style={styles.sectionLabel}>Currency</Animated.Text>
            <View style={styles.currencyRow}>
              {CURRENCIES.map((c) => (
                <Pressable
                  key={c.symbol}
                  style={[styles.chip, currency === c.symbol && styles.chipActive]}
                  onPress={() => setCurrency(c.symbol)}
                  accessibilityRole="radio"
                  accessibilityLabel={c.label}
                  accessibilityState={{ checked: currency === c.symbol }}
                >
                  <Animated.Text
                    style={[styles.chipLabel, currency === c.symbol && styles.chipLabelActive]}
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
            <View style={styles.stepper}>
              <Pressable
                style={styles.stepBtn}
                onPress={() => setComfortLine((v) => Math.max(COMFORT_MIN, v - COMFORT_STEP))}
                accessibilityLabel="Decrease comfort line"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Animated.Text style={styles.stepBtnLabel}>−</Animated.Text>
              </Pressable>
              <Animated.Text style={styles.stepValue}>
                {currency}{comfortLine.toLocaleString()}
              </Animated.Text>
              <Pressable
                style={styles.stepBtn}
                onPress={() => setComfortLine((v) => Math.min(COMFORT_MAX, v + COMFORT_STEP))}
                accessibilityLabel="Increase comfort line"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Animated.Text style={styles.stepBtnLabel}>+</Animated.Text>
              </Pressable>
            </View>
          </View>

          {/* Save */}
          <Pressable
            style={styles.saveBtn}
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel="Save settings"
          >
            <Animated.Text style={styles.saveBtnLabel}>Save</Animated.Text>
          </Pressable>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Secondary actions */}
          <Pressable
            style={styles.secondaryBtn}
            onPress={handleReplayOnboarding}
            accessibilityRole="button"
            accessibilityLabel="Replay onboarding"
          >
            <Animated.Text style={styles.secondaryLabel}>Replay onboarding</Animated.Text>
          </Pressable>

          <Pressable
            style={styles.dangerBtn}
            onPress={handleErase}
            accessibilityRole="button"
            accessibilityLabel="Erase all data"
          >
            <Animated.Text style={styles.dangerLabel}>Erase my data</Animated.Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...absoluteFillStyles,
    backgroundColor: 'rgba(23,21,31,0.5)',
  },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radii['2xl'],
    borderTopRightRadius: radii['2xl'],
    paddingTop: spacing['3'],
    paddingHorizontal: spacing['5'],
    gap: spacing['4'],
    ...shadows.hero,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    alignSelf: 'center',
    marginBottom: spacing['2'],
  },
  title: {
    fontFamily: typography.serifFamily,
    fontSize: typography.size['2xl'],
    color: colors.ink,
    letterSpacing: -0.5,
    paddingHorizontal: spacing['1'],
  },
  section: {
    gap: spacing['3'],
  },
  sectionLabel: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.sm,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: spacing['2'],
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentBg,
  },
  chipLabel: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.sm,
    color: colors.muted,
  },
  chipLabelActive: {
    color: colors.accent,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing['2'],
  },
  stepBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
    borderRadius: radii.lg,
  },
  stepBtnLabel: {
    fontSize: 20,
    color: colors.ink,
    fontFamily: typography.sansFamily,
  },
  stepValue: {
    fontFamily: typography.serifFamily,
    fontSize: typography.size.xl,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: radii.xl,
    paddingVertical: spacing['4'],
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  saveBtnLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.size.base,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: spacing['2'],
  },
  secondaryBtn: {
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['1'],
    minHeight: 44,
    justifyContent: 'center',
  },
  secondaryLabel: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.base,
    color: colors.muted,
  },
  dangerBtn: {
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['1'],
    minHeight: 44,
    justifyContent: 'center',
  },
  dangerLabel: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.base,
    color: colors.danger,
  },
});
