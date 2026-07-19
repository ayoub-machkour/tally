import 'react-native-reanimated';
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { AppNavigator } from '@/app/navigation';
import { useExpenseStore } from '@/store/expenseStore';

// Keep splash visible while fonts/data load
SplashScreen.preventAutoHideAsync();

export default function App(): React.ReactElement | null {
  const hydrate = useExpenseStore((s) => s.hydrate);
  const hydrated = useExpenseStore((s) => s.hydrated);

  const [fontsLoaded] = useFonts({
    'InstrumentSerif-Regular': require('./assets/fonts/InstrumentSerif-Regular.ttf'),
    'InstrumentSerif-Italic': require('./assets/fonts/InstrumentSerif-Italic.ttf'),
    'InstrumentSans-Regular': require('./assets/fonts/InstrumentSans-Regular.ttf'),
    'InstrumentSans-Medium': require('./assets/fonts/InstrumentSans-Medium.ttf'),
    'InstrumentSans-SemiBold': require('./assets/fonts/InstrumentSans-SemiBold.ttf'),
    'InstrumentSans-Bold': require('./assets/fonts/InstrumentSans-Bold.ttf'),
  });

  // Hydrate store on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Hide splash when ready
  useEffect(() => {
    if (fontsLoaded && hydrated) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, hydrated]);

  if (!fontsLoaded || !hydrated) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
