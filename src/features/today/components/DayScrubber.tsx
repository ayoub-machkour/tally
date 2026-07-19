import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useExpenseStore } from '@/store/expenseStore';
import { useScrubberData } from '@/store/selectors';
import { shortDayLabel, todayString } from '@/lib/dates';
import { colors, typography, spacing, radii } from '@/ui/tokens';

const PILL_SIZE = 44;
const PILL_GAP = 8;
const ITEM_WIDTH = PILL_SIZE + PILL_GAP;
const PADDING_START = spacing['4'];

export function DayScrubber(): React.ReactElement {
  const selectedDate = useExpenseStore((s) => s.selectedDate);
  const setSelectedDate = useExpenseStore((s) => s.setSelectedDate);
  const scrubData = useScrubberData();
  const scrollRef = useRef<ScrollView>(null);
  const hasScrolled = useRef(false);
  const today = todayString();

  // Scroll so today (last item) is visible at the right edge on first load
  useEffect(() => {
    if (hasScrolled.current || scrubData.length === 0) return;
    hasScrolled.current = true;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: false });
    }, 60);
    return () => clearTimeout(timer);
  }, [scrubData]);

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
      >
        {scrubData.map((item) => {
          const isSelected = item.date === selectedDate;
          const isToday = item.date === today;
          const dayLabel = shortDayLabel(item.date);
          const dayNum = item.date.split('-')[2];
          const hasSpend = item.total > 0;

          return (
            <Pressable
              key={item.date}
              style={[
                styles.item,
                isSelected && styles.itemSelected,
              ]}
              onPress={() => handleSelect(item.date)}
              accessibilityRole="button"
              accessibilityLabel={`${item.date}${hasSpend ? ` — ${item.total.toFixed(2)}` : ''}`}
              accessibilityState={{ selected: isSelected }}
              hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
            >
              {/* Day letter */}
              <Animated.Text
                style={[
                  styles.dayLetter,
                  isSelected && styles.dayLetterActive,
                  isToday && !isSelected && styles.dayLetterToday,
                ]}
              >
                {dayLabel}
              </Animated.Text>

              {/* Day number */}
              <Animated.Text
                style={[
                  styles.dayNum,
                  isSelected && styles.dayNumActive,
                  isToday && !isSelected && styles.dayNumToday,
                ]}
              >
                {dayNum}
              </Animated.Text>

              {/* Spend indicator line */}
              {hasSpend && (
                <View
                  style={[
                    styles.spendLine,
                    isSelected && styles.spendLineSelected,
                  ]}
                />
              )}
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
    paddingVertical: spacing['3'],
  },
  scrollContent: {
    paddingHorizontal: PADDING_START,
    gap: PILL_GAP,
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    width: PILL_SIZE,
    height: PILL_SIZE + 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line,
    paddingBottom: 8,
  },
  itemSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  dayLetter: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.xs,
    color: colors.muted,
    lineHeight: 14,
  },
  dayLetterActive: {
    color: 'rgba(255,255,255,0.6)',
  },
  dayLetterToday: {
    color: colors.accent,
  },
  dayNum: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.size.sm,
    color: colors.ink,
    lineHeight: 16,
  },
  dayNumActive: {
    color: '#FFFFFF',
  },
  dayNumToday: {
    color: colors.accent,
  },
  spendLine: {
    position: 'absolute',
    bottom: 4,
    width: 20,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.accent,
  },
  spendLineSelected: {
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
});
