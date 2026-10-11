import { Redirect, Stack, useSegments } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import AppBackground from '@/components/AppBackground';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/lib/auth';

export default function RootLayout() {
  const { session, loading } = useAuth();
  const segments = useSegments();

  if (loading) {
    return (
      <AppBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </AppBackground>
    );
  }

  const path = segments?.[0];
  const inAuthGroup = path === 'login' || path === 'register';
  const inTabsGroup = path === '(tabs)';

  return (
    <AppBackground>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Unauthenticated users land on the CampusQR portal. */}
        {!session && inTabsGroup && <Redirect href="/campus" />}
        {session && inAuthGroup && <Redirect href="/(tabs)" />}
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="campus" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});