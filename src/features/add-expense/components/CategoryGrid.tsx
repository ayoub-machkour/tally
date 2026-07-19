import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { CATEGORIES, CATEGORY_COLORS_HEX } from '@/domain/categories';
import type { CategoryId } from '@/domain/types';
import { colors, typography, spacing, radii } from '@/ui/tokens';

interface Props {
  selected: CategoryId;
  onSelect: (cat: CategoryId) => void;
}

export function CategoryGrid({ selected, onSelect }: Props): React.ReactElement {
  return (
    <View style={styles.grid}>
      {CATEGORIES.map((cat) => {
        const isSelected = cat.id === selected;
        const bg = CATEGORY_COLORS_HEX[cat.id];
        return (
          <Pressable
            key={cat.id}
            style={[
              styles.item,
              isSelected && { backgroundColor: bg, borderColor: bg },
            ]}
            onPress={() => onSelect(cat.id)}
            accessibilityRole="radio"
            accessibilityLabel={cat.label}
            accessibilityState={{ checked: isSelected }}
          >
            <Animated.Text style={styles.emoji}>{cat.emoji}</Animated.Text>
            <Animated.Text
              style={[styles.label, isSelected && styles.labelSelected]}
              numberOfLines={1}
            >
              {cat.label}
            </Animated.Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2'],
    paddingHorizontal: spacing['5'],
  },
  item: {
    width: '22%',
    flexGrow: 1,
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['2'],
    borderRadius: radii.lg,
    alignItems: 'center',
    gap: spacing['1'],
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    minHeight: 64,
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 20,
    lineHeight: 24,
  },
  label: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.xs,
    color: colors.muted,
    textAlign: 'center',
  },
  labelSelected: {
    color: '#FFFFFF',
  },
});
