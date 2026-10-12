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

  // Redirect targets are computed only — the Stack below is ALWAYS rendered
  // so the target screen exists in a mounted navigator. Returning <Redirect />
  // *instead* of the Stack unmounts the very navigator that owns `index`,
  // which crashes with:
  //   "The action 'REPLACE' with payload {"name":"index",...} was not
  //    handled by any navigator."
  const redirectTo =
    !session && !isPublic
      ? '/campus'
      : session && isPublic
        ? defaultTabFor(role)
        : null;

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          // Smooth fade+slide for pushed modal screens (event form, QR display).
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="login" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="register" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="event-form" options={{ animation: 'slide_from_bottom', presentation: 'card' }} />
        <Stack.Screen name="qr-display" options={{ animation: 'fade', presentation: 'card' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      </Stack>
      {redirectTo ? (
        <Redirect href={redirectTo as '/campus'} />
      ) : null}
    </>
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
