import { Redirect, Stack, useSegments } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

<<<<<<< HEAD
=======
import AppBackground from '@/components/AppBackground';
>>>>>>> ff02c248d1985765a235f26c5ed5a386e60bd1b5
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
<<<<<<< HEAD
  const { role } = useCampusRole();
=======
  const { role, loading: roleLoading } = useCampusRole();
>>>>>>> ff02c248d1985765a235f26c5ed5a386e60bd1b5
  const segments = useSegments();

  // Cross-cutting realtime behaviour (B5) — toasts + force sign-out.
  useGlobalSync();

<<<<<<< HEAD
  // Show the spinner only while the session is being restored on cold
  // start. Rendering it for `roleLoading` too used to unmount the whole
  // Stack mid-navigation (hard flicker), and it isn't needed: redirect
  // targets go through defaultTabFor, which returns the same tab for
  // every role, so the Stack stays mounted the entire time.
  if (loading) {
=======
  if (loading || (session && roleLoading)) {
>>>>>>> ff02c248d1985765a235f26c5ed5a386e60bd1b5
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
<<<<<<< HEAD
  // The splash (`index`/portal) is logged-out-only: authed users on it are
  // forwarded to their default tab so the pill is unreachable post-login
  // (back button, login->tabs replace race, cold start).
  //
  // `register` is EXCLUDED from the authed-on-public redirect: during
  // sign-up Supabase briefly emits a session, and hijacking the screen
  // there raced the register screen's own `replace('/campus/login')`
  // (student tabs flash + flicker instead of returning to Sign In).
  // The register screen owns its post-signup navigation.
  const redirectTo =
    !session && !isPublic
      ? '/campus'
      : session && isPublic && sub !== 'register'
=======
  const redirectTo =
    !session && !isPublic
      ? '/campus'
      : session && isPublic
>>>>>>> ff02c248d1985765a235f26c5ed5a386e60bd1b5
        ? defaultTabFor(role)
        : null;

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
<<<<<<< HEAD
          // Opaque base (matches AppBackground) so fades cross-dissolve
          // without flashing through to a transparent frame.
          contentStyle: { backgroundColor: COLORS.bgBase },
          // One motion language: soft fade everywhere (~250ms).
          animation: 'fade',
          animationDuration: 250,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
        <Stack.Screen name="register" options={{ animation: 'fade' }} />
        <Stack.Screen name="event-form" options={{ animation: 'fade' }} />
        <Stack.Screen name="qr-display" options={{ animation: 'fade' }} />
=======
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
>>>>>>> ff02c248d1985765a235f26c5ed5a386e60bd1b5
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
<<<<<<< HEAD
    <ToastProvider>
      <CampusNavigator />
    </ToastProvider>
=======
    <AppBackground>
      <ToastProvider>
        <CampusNavigator />
      </ToastProvider>
    </AppBackground>
>>>>>>> ff02c248d1985765a235f26c5ed5a386e60bd1b5
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
