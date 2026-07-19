import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, radii, shadows, spacing } from './tokens';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: 'default' | 'elevated' | 'hero';
  padding?: keyof typeof spacing;
}

export function Card({
  children,
  style,
  variant = 'default',
  padding = '6',
}: Props): React.ReactElement {
  return (
    <View style={[styles.base, styles[variant], { padding: spacing[padding] }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  default: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  elevated: {
    backgroundColor: colors.paper,
    ...shadows.md,
  },
  hero: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.glassLight,
  },
});
