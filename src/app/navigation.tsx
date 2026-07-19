import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useExpenseStore } from '@/store/expenseStore';
import { colors, typography, spacing, radii, shadows } from '@/ui/tokens';

// Screens
import { OnboardingStep0Screen } from '@/features/onboarding/components/Step0Screen';
import { OnboardingStep1Screen } from '@/features/onboarding/components/Step1Screen';
import { TodayScreen } from '@/features/today/TodayScreen';
import { MonthsScreen } from '@/features/months/MonthsScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

export type OnboardingStackParamList = {
  Step0: undefined;
  Step1: undefined;
};

export type MainTabParamList = {
  Today: undefined;
  Months: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

function OnboardingNavigator(): React.ReactElement {
  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <OnboardingStack.Screen name="Step0" component={OnboardingStep0Screen} />
      <OnboardingStack.Screen name="Step1" component={OnboardingStep1Screen} />
    </OnboardingStack.Navigator>
  );
}

function TabBar({
  state,
  navigation,
}: {
  state: { index: number; routes: { name: string; key: string }[] };
  navigation: { emit: (e: { type: string; target: string; canPreventDefault: boolean }) => { defaultPrevented: boolean }; navigate: (name: string) => void };
}): React.ReactElement {
  const insets = useSafeAreaInsets();
  const openAddSheet = useExpenseStore((s) => s.openAddSheet);

  const navigateTo = (name: string, index: number) => {
    const route = state.routes[index];
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (state.index !== index && !event.defaultPrevented) {
      navigation.navigate(name);
    }
  };

  const handleAddPress = () => {
    openAddSheet();
    // Navigate to Today so AddExpenseSheet (in TodayScreen) can render
    if (state.index !== 0) {
      navigation.navigate('Today');
    }
  };

  const todayActive = state.index === 0;
  const monthsActive = state.index === 1;

  return (
    <View
      style={[
        styles.tabBarOuter,
        { paddingBottom: Math.max(insets.bottom + spacing['2'], spacing['5']) },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.tabBarPill}>
        {/* Today tab */}
        <Pressable
          style={[styles.tabBtn, todayActive && styles.tabBtnActive]}
          onPress={() => navigateTo('Today', 0)}
          accessibilityRole="tab"
          accessibilityLabel="Today"
          accessibilityState={{ selected: todayActive }}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Text style={[styles.tabBtnLabel, todayActive && styles.tabBtnLabelActive]}>
            Today
          </Text>
        </Pressable>

        {/* Add expense button (center) */}
        <Pressable
          style={styles.addBtn}
          onPress={handleAddPress}
          accessibilityRole="button"
          accessibilityLabel="Add expense"
        >
          <Text style={styles.addBtnLabel}>+</Text>
        </Pressable>

        {/* Months tab */}
        <Pressable
          style={[styles.tabBtn, monthsActive && styles.tabBtnActive]}
          onPress={() => navigateTo('Months', 1)}
          accessibilityRole="tab"
          accessibilityLabel="Months"
          accessibilityState={{ selected: monthsActive }}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Text style={[styles.tabBtnLabel, monthsActive && styles.tabBtnLabelActive]}>
            Months
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function MainNavigator(): React.ReactElement {
  return (
    <MainTab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => {
        const p = props as Parameters<typeof TabBar>[0];
        return <TabBar {...p} />;
      }}
    >
      <MainTab.Screen name="Today" component={TodayScreen} />
      <MainTab.Screen name="Months" component={MonthsScreen} />
    </MainTab.Navigator>
  );
}

export function AppNavigator(): React.ReactElement {
  const onboarded = useExpenseStore((s) => s.settings.onboarded);
  const hydrated = useExpenseStore((s) => s.hydrated);

  if (!hydrated) return <View style={styles.splash} />;

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!onboarded ? (
          <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <RootStack.Screen name="Main" component={MainNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.heroTop,
  },
  // ── Floating pill tab bar ───────────────────────────────────────────────────
  tabBarOuter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabBarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderRadius: radii.full,
    paddingHorizontal: spacing['2'],
    paddingVertical: spacing['2'],
    gap: spacing['2'],
    ...shadows.lg,
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  tabBtn: {
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['3'],
    borderRadius: radii.full,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 84,
  },
  tabBtnActive: {
    backgroundColor: colors.ink,
  },
  tabBtnLabel: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.sm,
    color: colors.muted,
  },
  tabBtnLabelActive: {
    color: '#FFFFFF',
  },
  addBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  addBtnLabel: {
    fontSize: 28,
    color: '#FFFFFF',
    fontFamily: typography.sansFamily,
    lineHeight: 32,
    marginTop: -2,
  },
});
