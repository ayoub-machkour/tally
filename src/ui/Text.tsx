import React from 'react';
import { Text as RNText, StyleSheet, type TextProps, type TextStyle } from 'react-native';
import { colors, typography } from './tokens';

type Variant =
  | 'hero'       // 72px serif — count-up amount
  | 'display'    // 44px serif — section totals
  | 'title'      // 32px serif — card titles
  | 'heading'    // 24px sans semibold
  | 'subheading' // 20px sans medium
  | 'body'       // 15px sans regular
  | 'label'      // 13px sans medium — categories, labels
  | 'caption'    // 11px sans — timestamps, hints
  | 'amount'     // 17px sans tabular — expense list amounts
  | 'keypad';    // 32px serif — keypad display

type ColorVariant = 'ink' | 'muted' | 'accent' | 'hero' | 'heroMuted' | 'danger' | 'success';

interface Props extends TextProps {
  variant?: Variant;
  color?: ColorVariant;
  italic?: boolean;
  style?: TextStyle | TextStyle[];
  children: React.ReactNode;
}

const VARIANT_STYLES: Record<Variant, TextStyle> = {
  hero: {
    fontFamily: typography.serifFamily,
    fontSize: typography.size.hero,
    lineHeight: typography.size.hero * typography.leading.tight,
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  display: {
    fontFamily: typography.serifFamily,
    fontSize: typography.size['3xl'],
    lineHeight: typography.size['3xl'] * typography.leading.tight,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  title: {
    fontFamily: typography.serifFamily,
    fontSize: typography.size['2xl'],
    lineHeight: typography.size['2xl'] * typography.leading.snug,
  },
  heading: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.size.xl,
    lineHeight: typography.size.xl * typography.leading.snug,
    letterSpacing: -0.3,
  },
  subheading: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.lg,
    lineHeight: typography.size.lg * typography.leading.snug,
  },
  body: {
    fontFamily: typography.sansFamily,
    fontSize: typography.size.base,
    lineHeight: typography.size.base * typography.leading.normal,
  },
  label: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.sm,
    lineHeight: typography.size.sm * typography.leading.normal,
    letterSpacing: 0.1,
  },
  caption: {
    fontFamily: typography.sansFamily,
    fontSize: typography.size.xs,
    lineHeight: typography.size.xs * typography.leading.relaxed,
    letterSpacing: 0.2,
  },
  amount: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.size.md,
    lineHeight: typography.size.md * typography.leading.tight,
    fontVariant: ['tabular-nums'],
  },
  keypad: {
    fontFamily: typography.serifFamily,
    fontSize: typography.size['2xl'],
    lineHeight: typography.size['2xl'] * typography.leading.tight,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
};

const COLOR_MAP: Record<ColorVariant, string> = {
  ink:       colors.ink,
  muted:     colors.muted,
  accent:    colors.accent,
  hero:      colors.heroText,
  heroMuted: colors.heroMuted,
  danger:    colors.danger,
  success:   colors.success,
};

export function TText({
  variant = 'body',
  color = 'ink',
  italic = false,
  style,
  children,
  ...rest
}: Props): React.ReactElement {
  const fontFamily = italic
    ? typography.serifItalic
    : VARIANT_STYLES[variant].fontFamily ?? typography.sansFamily;

  return (
    <RNText
      style={[
        styles.base,
        VARIANT_STYLES[variant],
        { fontFamily, color: COLOR_MAP[color] },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
