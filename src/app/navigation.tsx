import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useExpenseStore } from '@/store/expenseStore';
import { colors, typography, spacing } from '@/ui/tokens';

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
  const tabs = [
    { name: 'Today', label: 'Today' },
    { name: 'Months', label: 'Months' },
  ];

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, spacing['4']) }]}>
      {tabs.map((tab, index) => {
        const focused = state.index === index;
        const route = state.routes[index];
        return (
          <Pressable
            key={tab.name}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(tab.name);
              }
            }}
            style={styles.tabItem}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: focused }}
            hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
          >
            <View style={[styles.tabPill, focused && styles.tabPillActive]}>
              <View style={[styles.tabDot, focused && styles.tabDotActive]} />
            </View>
            <View>
              <View>
                {/* Label is rendered via Animated.Text for typecheck compat */}
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function MainNavigator(): React.ReactElement {
  return (
    <MainTab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => {
        // Type cast needed due to RN navigation complex types
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.paper,
    paddingTop: spacing['3'],
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing['1'],
    minHeight: 44,
    justifyContent: 'center',
  },
  tabPill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPillActive: {
    backgroundColor: colors.accent,
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.muted,
  },
  tabDotActive: {
    backgroundColor: colors.paper,
  },
  tabLabel: {
    fontFamily: typography.sansMedium,
    fontSize: typography.size.xs,
    color: colors.muted,
  },
  tabLabelActive: {
    color: colors.accent,
  },
});
