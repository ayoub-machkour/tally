import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { colors, typography, spacing, radii } from '@/ui/tokens';

interface Props {
  isNoSpendDay?: boolean;
}

export function EmptyState({ isNoSpendDay = false }: Props): React.ReactElement {
  return (
    <View style={styles.container}>
      {/* Big "0" badge */}
      <View style={styles.zeroBadge}>
        <Animated.Text style={styles.zeroText}>0</Animated.Text>
      </View>

      <View style={styles.textBlock}>
        <Animated.Text style={styles.title}>
          {isNoSpendDay ? 'No-spend day' : 'Nothing here yet'}
        </Animated.Text>
        <Animated.Text style={styles.subtitle}>
          {isNoSpendDay
            ? 'A clean day — count it as a win.'
            : 'Tap + to log your first expense.'}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['12'],
    gap: spacing['6'],
  },
  zeroBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zeroText: {
    fontFamily: typography.serifFamily,
    fontSize: 44,
    color: colors.muted,
    letterSpacing: -2,
    lineHeight: 52,
  },
  textBlock: {
    alignItems: 'center',
    gap: spacing['2'],
    paddingHorizontal: spacing['8'],
  },
  title: {
    fontFamily: typography.serifFamily,
    fontSize: typography.size.xl,
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: typography.sansFamily,
    fontSize: typography.size.sm,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: typography.size.sm * 1.6,
  },
});
