import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { colors, typography, spacing, radii, shadows } from '@/ui/tokens';

interface Props {
  emoji: string;
  title: string;
  value: string;
  subtitle?: string;
}

export function InsightCard({ emoji, title, value, subtitle }: Props): React.ReactElement {
  return (
    <View style={styles.card}>
      <Animated.Text style={styles.emoji}>{emoji}</Animated.Text>
      <Animated.Text style={styles.title}>{title}</Animated.Text>
      <Animated.Text style={styles.value} numberOfLines={2}>
        {value}
      </Animated.Text>
      {subtitle ? (
        <Animated.Text style={styles.subtitle}>{subtitle}</Animated.Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderRadius: radii.xl,
    padding: spacing['5'],
    gap: spacing['1'],
    minHeight: 110,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  emoji: {
    fontSize: 20,
    lineHeight: 24,
    marginBottom: spacing['1'],
  },
  title: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.xs,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontFamily: typography.serifFamily,
    fontSize: typography.size.lg,
    color: colors.ink,
    lineHeight: typography.size.lg * 1.2,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: typography.sansFamily,
    fontSize: typography.size.xs,
    color: colors.muted,
    lineHeight: typography.size.xs * 1.5,
  },
});
