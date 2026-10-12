import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppBackground from '@/components/AppBackground';

/**
 * Root layout. CampusQR Attend is the entire app now — the legacy
 * `(tabs)` home and the old root `login`/`register` screens have been
 * removed. The root route (`index`) forwards into the CampusQR portal,
 * and all auth/role routing lives inside the `campus` area.
 *
 * `SafeAreaProvider` is mounted here so `useSafeAreaInsets()` returns real
 * values on native (notches, home indicators); without it every inset is 0
 * and content renders under the status bar.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppBackground>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="campus" />
        </Stack>
      </AppBackground>
    </SafeAreaProvider>
  );
}
