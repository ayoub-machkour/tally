import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DonutChart } from './components/DonutChart';
import { DayBars } from './components/DayBars';
import { WeeklyRhythm } from './components/WeeklyRhythm';
import { InsightCard } from './components/InsightCard';
import { CategoryBreakdownBar } from './components/CategoryBreakdownBar';
import { CountUpAmount } from '@/features/today/components/CountUpAmount';
import { useMonthInsights } from '@/store/selectors';
import { useExpenseStore } from '@/store/expenseStore';
import { formatCurrencyShort, formatDeltaPercent } from '@/lib/currency';
import { fullMonthYear, currentMonthString, previousMonth, nextMonth } from '@/lib/dates';
import { getCategoryMeta, CATEGORY_COLORS_HEX } from '@/domain/categories';
import { colors, typography, spacing, radii, shadows } from '@/ui/tokens';
import type { CategoryBreakdown } from '@/domain/types';

const absoluteFillStyles = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };

export function MonthsScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const insights = useMonthInsights();
  const selectedMonth = useExpenseStore((s) => s.selectedMonth);
  const setSelectedMonth = useExpenseStore((s) => s.setSelectedMonth);
  const currency = useExpenseStore((s) => s.settings.currency);
  const comfortLine = useExpenseStore((s) => s.settings.comfortLine);
  const [selectedCategory, setSelectedCategory] = useState<CategoryBreakdown | null>(null);

  const currentMonth = currentMonthString();
  const canGoBack = selectedMonth > '2000-01';
  const twoMonthsAgo = (() => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m - 3, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  })();
  const canGoFurther = selectedMonth > twoMonthsAgo;
  const canGoForward = selectedMonth < currentMonth;

  const handlePrev = useCallback(() => {
    if (canGoFurther) setSelectedMonth(previousMonth(selectedMonth));
  }, [canGoFurther, selectedMonth, setSelectedMonth]);

  const handleNext = useCallback(() => {
    if (canGoForward) setSelectedMonth(nextMonth(selectedMonth));
  }, [canGoForward, selectedMonth, setSelectedMonth]);

  const topCat = insights.categoryBreakdown[0];
  const topCatMeta = topCat ? getCategoryMeta(topCat.category) : null;

  const pacePct = comfortLine > 0
    ? Math.round((insights.projectedTotal / comfortLine) * 100)
    : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 130 }}
        bounces
      >
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <LinearGradient
            colors={[colors.heroTop, colors.heroMid]}
            style={absoluteFillStyles}
          />
          <View style={[styles.orb, styles.orb1]} />
          <View style={[styles.orb, styles.orb2]} />

          {/* Month nav */}
          <View style={styles.monthNav}>
            <Pressable
              style={[styles.navBtn, !canGoFurther && styles.navBtnDisabled]}
              onPress={handlePrev}
              disabled={!canGoFurther}
              accessibilityRole="button"
              accessibilityLabel="Previous month"
            >
              <Animated.Text style={styles.navBtnLabel}>‹</Animated.Text>
            </Pressable>
            <Animated.Text style={styles.monthTitle}>
              {fullMonthYear(selectedMonth)}
            </Animated.Text>
            <Pressable
              style={[styles.navBtn, !canGoForward && styles.navBtnDisabled]}
              onPress={handleNext}
              disabled={!canGoForward}
              accessibilityRole="button"
              accessibilityLabel="Next month"
            >
              <Animated.Text style={styles.navBtnLabel}>›</Animated.Text>
            </Pressable>
          </View>

          {/* Donut + total */}
          <View style={styles.heroContent}>
            <DonutChart
              breakdown={insights.categoryBreakdown}
              centerLabel={`${currency}${insights.totalSpent.toFixed(0)}`}
              centerSublabel="spent"
            />
            <View style={styles.heroRight}>
              <Animated.Text style={styles.totalLabel}>Total spent</Animated.Text>
              <CountUpAmount
                value={insights.totalSpent}
                prefix={currency}
                style={styles.totalAmount}
              />
              {insights.deltaPercent !== null && (
                <View style={styles.deltaRow}>
                  <Animated.Text
                    style={[
                      styles.deltaText,
                      insights.deltaPercent < 0 ? styles.deltaDown : styles.deltaUp,
                    ]}
                  >
                    {formatDeltaPercent(insights.deltaPercent)}
                  </Animated.Text>
                  <Animated.Text style={styles.deltaLabel}>vs last month</Animated.Text>
                </View>
              )}
            </View>
          </View>

          {/* ── Category legend (interactive) ── */}
          {insights.categoryBreakdown.length > 0 && (
            <View style={styles.categoryLegend}>
              {insights.categoryBreakdown.map((item) => {
                const meta = getCategoryMeta(item.category);
                const color = CATEGORY_COLORS_HEX[item.category];
                const isSelected = selectedCategory?.category === item.category;
                return (
                  <Pressable
                    key={item.category}
                    style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                    onPress={() => setSelectedCategory(isSelected ? null : item)}
                    accessibilityRole="button"
                    accessibilityLabel={`${meta.label}: ${formatCurrencyShort(item.total, currency)}`}
                  >
                    <View style={[styles.categoryDot, { backgroundColor: color }]} />
                    <Animated.Text style={[styles.categoryChipLabel, isSelected && styles.categoryChipLabelSelected]}>
                      {meta.emoji} {meta.label}
                    </Animated.Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Selected category info panel */}
          {selectedCategory && (
            <View style={styles.categoryInfo}>
              <View style={[styles.categoryInfoDot, { backgroundColor: CATEGORY_COLORS_HEX[selectedCategory.category] }]} />
              <View style={styles.categoryInfoText}>
                <Animated.Text style={styles.categoryInfoName}>
                  {getCategoryMeta(selectedCategory.category).label}
                </Animated.Text>
                <Animated.Text style={styles.categoryInfoAmount}>
                  {formatCurrencyShort(selectedCategory.total, currency)} · {selectedCategory.percentage.toFixed(1)}%
                </Animated.Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Day-by-day bars ── */}
        <View style={styles.section}>
          <Animated.Text style={styles.sectionTitle}>Day by day</Animated.Text>
          <DayBars
            dailyTotals={insights.dailyTotals}
            peakDate={insights.peakDay?.date}
            currency={currency}
          />
        </View>

        {/* ── Weekly rhythm ── */}
        <View style={styles.section}>
          <Animated.Text style={styles.sectionTitle}>Weekly rhythm</Animated.Text>
          <WeeklyRhythm rhythm={insights.weeklyRhythm} currency={currency} />
        </View>

        {/* ── Where it went ── */}
        {insights.categoryBreakdown.length > 0 && (
          <View style={styles.section}>
            <Animated.Text style={styles.sectionTitle}>Where it went</Animated.Text>
            <CategoryBreakdownBar
              breakdown={insights.categoryBreakdown}
              currency={currency}
            />
          </View>
        )}

        {/* ── Insight cards (vertical) ── */}
        <View style={styles.section}>
          <Animated.Text style={styles.sectionTitle}>Insights</Animated.Text>
          <View style={styles.insightList}>
            {topCatMeta && (
              <InsightCard
                emoji={topCatMeta.emoji}
                title="Top category"
                value={topCatMeta.label}
                subtitle={formatCurrencyShort(topCat.total, currency)}
              />
            )}
            {insights.peakDay && (
              <InsightCard
                emoji="📈"
                title="Biggest day"
                value={formatCurrencyShort(insights.peakDay.total, currency)}
                subtitle={insights.peakDay.date.slice(5)}
              />
            )}
            <InsightCard
              emoji="🎯"
              title="Month pace"
              value={`${pacePct}% of limit`}
              subtitle={`~${formatCurrencyShort(insights.projectedTotal, currency)} projected`}
            />
            <InsightCard
              emoji="🌿"
              title="No-spend days"
              value={`${insights.noSpendDaysCount} day${insights.noSpendDaysCount !== 1 ? 's' : ''}`}
              subtitle={`of ${insights.daysElapsed} elapsed`}
            />
          </View>
        </View>

        {/* Empty state */}
        {insights.totalSpent === 0 && (
          <View style={styles.empty}>
            <Animated.Text style={styles.emptyText}>No expenses this month.</Animated.Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  hero: {
    paddingBottom: spacing['6'],
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.3,
  },
  orb1: {
    width: 300,
    height: 300,
    backgroundColor: colors.heroOrb1,
    top: -100,
    right: -80,
  },
  orb2: {
    width: 200,
    height: 200,
    backgroundColor: colors.heroOrb2,
    bottom: 0,
    left: -60,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['5'],
    paddingTop: spacing['4'],
    paddingBottom: spacing['6'],
  },
  navBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.md,
  },
  navBtnDisabled: {
    opacity: 0.3,
  },
  navBtnLabel: {
    fontSize: 22,
    color: colors.heroText,
    fontFamily: typography.sansFamily,
  },
  monthTitle: {
    fontFamily: typography.serifFamily,
    fontSize: typography.size.xl,
    color: colors.heroText,
    letterSpacing: -0.5,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['6'],
    gap: spacing['4'],
  },
  heroRight: {
    flex: 1,
    gap: spacing['2'],
  },
  totalLabel: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.sm,
    color: colors.heroMuted,
  },
  totalAmount: {
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 40,
    color: colors.heroText,
    letterSpacing: -1.5,
    fontVariant: ['tabular-nums'],
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
    borderWidth: 0,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    flexWrap: 'wrap',
  },
  deltaText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.size.sm,
    fontVariant: ['tabular-nums'],
  },
  deltaUp: { color: colors.danger },
  deltaDown: { color: colors.success },
  deltaLabel: {
    fontFamily: typography.sansFamily,
    fontSize: typography.size.xs,
    color: colors.heroMuted,
  },
  // ── Category legend ────────────────────────────────────────────────────────
  categoryLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2'],
    paddingHorizontal: spacing['5'],
    paddingTop: spacing['5'],
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  categoryChipSelected: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderColor: 'rgba(255,255,255,0.4)',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryChipLabel: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.xs,
    color: colors.heroMuted,
  },
  categoryChipLabelSelected: {
    color: colors.heroText,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    marginHorizontal: spacing['5'],
    marginTop: spacing['3'],
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radii.lg,
    padding: spacing['4'],
  },
  categoryInfoDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    flexShrink: 0,
  },
  categoryInfoText: {
    flex: 1,
    gap: 2,
  },
  categoryInfoName: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.size.sm,
    color: colors.heroText,
  },
  categoryInfoAmount: {
    fontFamily: typography.sansFamily,
    fontSize: typography.size.xs,
    color: colors.heroMuted,
    fontVariant: ['tabular-nums'],
  },
  // ── Sections ──────────────────────────────────────────────────────────────
  section: {
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['5'],
    gap: spacing['4'],
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  sectionTitle: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.size.base,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  // ── Insights (vertical list) ───────────────────────────────────────────────
  insightList: {
    flexDirection: 'column',
    gap: spacing['3'],
  },
  empty: {
    padding: spacing['8'],
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: typography.sansFamily,
    fontSize: typography.size.base,
    color: colors.muted,
  },
});
