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
const PADDING_START = spacing['4']; // 16px padding at start

export function DayScrubber(): React.ReactElement {
  const selectedDate = useExpenseStore((s) => s.selectedDate);
  const setSelectedDate = useExpenseStore((s) => s.setSelectedDate);
  const scrubData = useScrubberData();
  const scrollRef = useRef<ScrollView>(null);
  const hasScrolled = useRef(false);
  const today = todayString();

  // Scroll so today is at the left edge once scrubData is ready
  useEffect(() => {
    if (hasScrolled.current || scrubData.length === 0) return;
    const idx = scrubData.findIndex((d) => d.date === today);
    if (idx > 0) {
      const timer = setTimeout(() => {
        // x = idx * ITEM_WIDTH keeps the left padding visible before today's item
        scrollRef.current?.scrollTo({ x: idx * ITEM_WIDTH, y: 0, animated: false });
      }, 60);
      hasScrolled.current = true;
      return () => clearTimeout(timer);
    }
  }, [scrubData, today]);

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
          const isFuture = item.date > today;
          const dayLabel = shortDayLabel(item.date);
          const dayNum = item.date.split('-')[2];

          return (
            <Pressable
              key={item.date}
              style={[
                styles.item,
                isSelected && styles.itemSelected,
                isFuture && styles.itemFuture,
              ]}
              onPress={() => !isFuture && handleSelect(item.date)}
              disabled={isFuture}
              accessibilityRole="button"
              accessibilityLabel={`${item.date}${item.total > 0 ? ` — ${item.total.toFixed(2)}` : ''}`}
              accessibilityState={{ selected: isSelected, disabled: isFuture }}
              hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
            >
              {/* Day letter (S M T W T F S) */}
              <Animated.Text
                style={[
                  styles.dayLetter,
                  isSelected && styles.dayLetterActive,
                  isFuture && styles.dayLetterFuture,
                ]}
              >
                {dayLabel}
              </Animated.Text>

              {/* Day number */}
              <Animated.Text
                style={[
                  styles.dayNum,
                  isSelected && styles.dayNumActive,
                  isFuture && styles.dayNumFuture,
                ]}
              >
                {dayNum}
              </Animated.Text>
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
  },
  itemSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  itemFuture: {
    backgroundColor: colors.surface,
    borderColor: 'transparent',
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
  dayLetterFuture: {
    color: colors.line,
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
  dayNumFuture: {
    color: colors.line,
  },
});
