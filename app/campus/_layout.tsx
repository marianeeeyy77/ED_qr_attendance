import { Redirect, Stack, useSegments } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import AppBackground from '@/components/AppBackground';
import { ToastProvider } from '@/components/CampusToast';
import { COLORS } from '@/constants/colors';
import { useCampusSession } from '@/lib/campusqr/auth';
import { defaultTabFor, useCampusRole } from '@/lib/campusqr/roles';
import { useGlobalSync } from '@/lib/campusqr/sync';

/**
 * CampusQR area: auth guard + role-aware navigation (spec C5/C6).
 *
 * Public routes (no session required): the portal landing `index`, `login`
 * and `register`. Everything else requires a session; unauthenticated users
 * are sent to the portal. Authenticated users on a public route are sent to
 * their role's default tab. Global realtime toasts + deactivation sign-out
 * are mounted here (inside ToastProvider).
 */
function CampusNavigator() {
  const { session, loading } = useCampusSession();
  const { role, loading: roleLoading } = useCampusRole();
  const segments = useSegments();

  // Cross-cutting realtime behaviour (B5) — toasts + force sign-out.
  useGlobalSync();

  if (loading || (session && roleLoading)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Segments: ['campus'] for the portal, ['campus','login'], ['campus','(tabs)',...].
  const parts = (segments ?? []) as string[];
  const sub = parts[1];
  const isPortal = sub === undefined || sub === 'index';
  const inAuth = sub === 'login' || sub === 'register';
  const isPublic = isPortal || inAuth;

  if (!session && !isPublic) {
    return <Redirect href="/campus" />;
  }
  if (session && isPublic) {
    return <Redirect href={defaultTabFor(role)} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="event-form" />
      <Stack.Screen name="qr-display" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function CampusLayout() {
  return (
    <AppBackground>
      <ToastProvider>
        <CampusNavigator />
      </ToastProvider>
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
