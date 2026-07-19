import React, { useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useExpenseStore } from '@/store/expenseStore';
import { useScrubberData } from '@/store/selectors';
import { shortDayLabel } from '@/lib/dates';
import { colors, typography, spacing, radii } from '@/ui/tokens';

const { width: SCREEN_W } = Dimensions.get('window');
const PILL_SIZE = 44;
const PILL_GAP = 6;
const ITEM_WIDTH = PILL_SIZE + PILL_GAP;

function normalizeDot(total: number, max: number): number {
  if (max === 0) return 0;
  return Math.min(1, total / max);
}

export function DayScrubber(): React.ReactElement {
  const selectedDate = useExpenseStore((s) => s.selectedDate);
  const setSelectedDate = useExpenseStore((s) => s.setSelectedDate);
  const scrubData = useScrubberData();
  const scrollRef = useRef<ScrollView>(null);

  const maxTotal = Math.max(...scrubData.map((d) => d.total), 1);

  const handleSelect = useCallback(
    (date: string) => {
      setSelectedDate(date);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    },
    [setSelectedDate],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        onLayout={() => {
          // Scroll to end (most recent day)
          scrollRef.current?.scrollToEnd({ animated: false });
        }}
      >
        {scrubData.map((item) => {
          const isSelected = item.date === selectedDate;
          const hasSpend = item.total > 0;
          const dotNorm = normalizeDot(item.total, maxTotal);
          const dotSize = 4 + Math.round(dotNorm * 8); // 4–12px
          const dayLabel = shortDayLabel(item.date);
          const dayNum = item.date.split('-')[2];

          return (
            <Pressable
              key={item.date}
              style={[styles.item, isSelected && styles.itemSelected]}
              onPress={() => handleSelect(item.date)}
              accessibilityRole="button"
              accessibilityLabel={`${item.date}${hasSpend ? ` - spent ${item.total.toFixed(2)}` : ' - no spending'}`}
              accessibilityState={{ selected: isSelected }}
              hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
            >
              {/* Day label (M T W...) */}
              <Animated.Text style={[styles.dayLetter, isSelected && styles.dayLetterActive]}>
                {dayLabel}
              </Animated.Text>

              {/* Day number */}
              <Animated.Text style={[styles.dayNum, isSelected && styles.dayNumActive]}>
                {dayNum}
              </Animated.Text>

              {/* Spend intensity dot */}
              <View
                style={[
                  styles.dot,
                  hasSpend && {
                    width: dotSize,
                    height: dotSize,
                    borderRadius: dotSize / 2,
                    backgroundColor: isSelected ? colors.accent : colors.accentDim,
                    opacity: 0.6 + dotNorm * 0.4,
                  },
                  !hasSpend && styles.dotEmpty,
                ]}
              />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: spacing['3'],
  },
  scrollContent: {
    paddingHorizontal: (SCREEN_W - ITEM_WIDTH * 7) / 2,
    gap: PILL_GAP,
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    width: PILL_SIZE,
    height: PILL_SIZE + 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    gap: 2,
  },
  itemSelected: {
    backgroundColor: colors.accentBg,
  },
  dayLetter: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.xs,
    color: colors.muted,
    lineHeight: 14,
  },
  dayLetterActive: {
    color: colors.accent,
  },
  dayNum: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.size.sm,
    color: colors.muted,
    lineHeight: 16,
  },
  dayNumActive: {
    color: colors.ink,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dotEmpty: {
    width: 4,
    height: 4,
    backgroundColor: colors.line,
    opacity: 0.5,
  },
});
