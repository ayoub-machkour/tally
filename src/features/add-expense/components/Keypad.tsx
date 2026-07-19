import React, { useCallback } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radii, animation } from '@/ui/tokens';

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '⌫'],
];

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function KeyButton({ label, onPress }: { label: string; onPress: () => void }): React.ReactElement {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const isBackspace = label === '⌫';
  const isDot = label === '.';

  return (
    <AnimatedPressable
      style={[styles.key, isBackspace && styles.keyBackspace, animStyle]}
      onPressIn={() => {
        scale.value = withSpring(0.88, animation.spring);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, animation.spring);
      }}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={isBackspace ? 'Delete' : isDot ? 'Decimal point' : label}
    >
      <Animated.Text
        style={[
          styles.keyLabel,
          isBackspace && styles.keyLabelMuted,
          isDot && styles.keyLabelMuted,
        ]}
      >
        {label}
      </Animated.Text>
    </AnimatedPressable>
  );
}

export function Keypad({ value, onChange }: Props): React.ReactElement {
  const handleKey = useCallback(
    (key: string) => {
      if (key === '⌫') {
        onChange(value.slice(0, -1));
        return;
      }
      if (key === '.') {
        if (value.includes('.')) return;
        onChange(value === '' ? '0.' : `${value}.`);
        return;
      }
      // Prevent more than 2 decimal places
      const parts = value.split('.');
      if (parts[1] && parts[1].length >= 2) return;
      // Prevent leading zeros
      if (value === '0' && key !== '.') {
        onChange(key);
        return;
      }
      // Prevent insane amounts
      if (value.replace('.', '').length >= 7) return;
      onChange(`${value}${key}`);
    },
    [value, onChange],
  );

  return (
    <View style={styles.container}>
      {KEYS.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((key) => (
            <KeyButton key={key} label={key} onPress={() => handleKey(key)} />
          ))}
        </View>
      ))}
    </View>
  );
}

const { width: SCREEN_W } = Dimensions.get('window');
const KEY_W = (SCREEN_W - spacing['6'] * 2 - spacing['3'] * 2) / 3;

const styles = StyleSheet.create({
  container: {
    gap: spacing['2'],
    paddingHorizontal: spacing['6'],
  },
  row: {
    flexDirection: 'row',
    gap: spacing['3'],
  },
  key: {
    width: KEY_W,
    height: KEY_W * 0.62,
    minHeight: 52,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyBackspace: {
    backgroundColor: colors.line,
  },
  keyLabel: {
    fontFamily: typography.serifFamily,
    fontSize: 24,
    color: colors.ink,
    lineHeight: 28,
  },
  keyLabelMuted: {
    color: colors.muted,
    fontFamily: typography.sansFamily,
  },
});
