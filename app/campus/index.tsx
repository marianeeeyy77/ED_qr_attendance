<<<<<<< HEAD
import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
=======
import { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
>>>>>>> ff02c248d1985765a235f26c5ed5a386e60bd1b5
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedLogo from '@/components/AnimatedLogo';
import AnimatedPressable from '@/components/AnimatedPressable';
<<<<<<< HEAD
import { BTN, COLORS, RADIUS } from '@/constants/colors';
import { useAuth } from '@/lib/auth';
import { defaultTabFor, useCampusRole } from '@/lib/campusqr/roles';

/**
 * Landing splash — press the pill button to go to Log In (tapping elsewhere does nothing).
 * Layout: 20%-larger mark centered top-middle, bold title + secondary
 * subtitle, high-contrast pill button near the bottom. On tap the brand
 * + pill glide up + fade while login fades in (campus/_layout `fade`)
 * for one smooth handoff.
 *
 * Already-signed-in users never see the pill: the splash instantly
 * forwards them to their default tab (covers cold starts with a
 * persisted session and the login->tabs replace race).
 */
export default function CampusLandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const { role, loading: roleLoading } = useCampusRole();
  const navigating = useRef(false);
  const didLeave = useRef(false);
  const forwarded = useRef(false);

  // Authed users skip the splash entirely: forward to the default tab as
  // soon as the session (and role) is ready. Guards the login->tabs
  // replace race and cold starts with a persisted session.
  useEffect(() => {
    if (forwarded.current || !session || roleLoading) return;
    forwarded.current = true;
    navigating.current = true;
    didLeave.current = true;
    router.replace(defaultTabFor(role));
  }, [session, role, roleLoading, router]);

  // 0 -> 1 on mount (staggered entrance), 0 -> 1 on tap (exit).
  const intro = useRef(new Animated.Value(0)).current;
  const pillIntro = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0)).current;
  // Subtle breathing scale on the pill so it reads as tappable.
  const pillPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(intro, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    Animated.timing(pillIntro, {
      toValue: 1,
      duration: 500,
      delay: 120,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pillPulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pillPulse, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => {
      pulse.stop();
    };
  }, [intro, pillIntro, pillPulse]);

  // If the user backs out of login, restore the splash visible state.
  // Skipped after an authed auto-forward (forwarded stays latched) so the
  // pill can't re-arm while signed in.
  useFocusEffect(
    useCallback(() => {
      if (forwarded.current) return undefined;
      if (didLeave.current) {
        didLeave.current = false;
        navigating.current = false;
        enter.setValue(0);
        intro.setValue(1);
        pillIntro.setValue(1);
      }
      return undefined;
    }, [enter, intro, pillIntro])
  );

  // Tap to continue: navigate WITH the fade (not after it) so the splash
  // exit overlaps login's entrance — no blank frame between screens.
  // The exit is short (~180ms); the pill pulse is frozen on tap so the
  // button can't jump a frame before leaving.
  const handleEnter = () => {
    if (navigating.current) return;
    navigating.current = true;
    didLeave.current = true;
    pillPulse.stopAnimation();
    pillPulse.setValue(0);
    Animated.timing(enter, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    router.push('/campus/login');
  };

  // Entrance: rise -> 0. Exit: rise 0 -> -36. Added together.
  const introY = intro.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
  const pillIntroY = pillIntro.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
  const exitY = enter.interpolate({ inputRange: [0, 1], outputRange: [0, -36] });
  const headerY = Animated.add(introY, exitY);
  const footerY = Animated.add(pillIntroY, exitY);

  // Entrance: 0 -> 1. Exit: 1 -> 0. Multiplied together.
  const exitOpacity = enter.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const headerOpacity = Animated.multiply(intro, exitOpacity);
  const footerOpacity = Animated.multiply(pillIntro, exitOpacity);
  const exitScale = enter.interpolate({ inputRange: [0, 1], outputRange: [1, 0.94] });
  const pulseScale = pillPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });
  const headerScale = exitScale;
  const footerScale = Animated.multiply(exitScale, pulseScale);

  return (
    <View style={styles.root}>
      <View style={[styles.column, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        {/* Logo (20% larger) + bold title + secondary subtitle, top-middle. */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerY }, { scale: headerScale }],
            },
          ]}
        >
          <AnimatedLogo size={115} iconSize={58} />
          <Text style={styles.appName}>School Attendance System</Text>
          <Text style={styles.tagline}>Fast &amp; Easy Attendance</Text>
        </Animated.View>

        {/* High-contrast pill near the bottom. */}
        <Animated.View
          style={[
            styles.footer,
            {
              opacity: footerOpacity,
              transform: [{ translateY: footerY }, { scale: footerScale }],
            },
          ]}
        >
          <AnimatedPressable
            style={styles.pillButton}
            onPress={handleEnter}
            glowColor={COLORS.primary}
            accessibilityRole="button"
            accessibilityLabel="Tap to Continue to Log In"
          >
            <Text style={styles.pillText}>Tap to Continue</Text>
          </AnimatedPressable>
        </Animated.View>
      </View>
    </View>
=======
import { COLORS, SLATE } from '@/constants/colors';

/**
 * Landing portal — one-stage intro morph built with core `Animated` (native
 * driver, no new deps): tapping anywhere makes the QR mark + "School
 * Attendance System" translate UP (no zoom — same size) with a smooth ease
 * while "Tap to Continue" fades out and the "Welcome Back" card fades + rises
 * in. Log In / Create an Account push their auth screens directly.
 */
const FALLBACK_CARD_HEIGHT = 340;

export default function CampusLandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [entered, setEntered] = useState(false);
  // Natural card height (used only to center the intro; not animated).
  const [cardHeight, setCardHeight] = useState(FALLBACK_CARD_HEIGHT);
  const enter = useRef(new Animated.Value(0)).current;

  // Tap to continue: logo+title rise, tap hint out, card in.
  const handleEnter = () => {
    if (entered) return;
    setEntered(true);
    Animated.timing(enter, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  // Header starts pushed down toward center (intro), then rests above the card.
  const headerDrop = cardHeight / 2 + 24;
  const headerY = enter.interpolate({ inputRange: [0, 1], outputRange: [headerDrop, 0] });
  const tapOpacity = enter.interpolate({ inputRange: [0, 0.5], outputRange: [1, 0] });
  const cardOpacity = enter.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const cardY = enter.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

  return (
    <Pressable style={styles.root} onPress={handleEnter}>
      <View style={[styles.column, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        {/* Logo + title — rise on tap. Same size throughout. */}
        <Animated.View style={[styles.header, { transform: [{ translateY: headerY }] }]}>
          <AnimatedLogo size={96} iconSize={48} />
          <Text style={styles.appName}>School Attendance System</Text>
          <Animated.Text style={[styles.tapToContinue, { opacity: tapOpacity }]}>Tap to Continue</Animated.Text>
        </Animated.View>

        {/* Welcome Back card — fades + rises in on Stage 1, out on Stage 2. */}
        <Animated.View
          pointerEvents={entered ? 'auto' : 'none'}
          style={[styles.cardWrap, { opacity: cardOpacity, transform: [{ translateY: cardY }] }]}
          onLayout={(e) => setCardHeight(e.nativeEvent.layout.height)}
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>Sign in to Campus QR Attendance</Text>

            <AnimatedPressable
              style={styles.loginButton}
              onPress={() => router.push('/campus/login')}
              glowColor={COLORS.primary}
              accessibilityLabel="Log In"
            >
              <Text style={styles.loginText}>Log In</Text>
            </AnimatedPressable>

            <AnimatedPressable
              style={styles.createButton}
              onPress={() => router.push('/campus/register')}
              glowColor={COLORS.accent}
              accessibilityLabel="Create an Account"
            >
              <Text style={styles.createText}>Create an Account</Text>
            </AnimatedPressable>
          </View>
        </Animated.View>
      </View>
    </Pressable>
>>>>>>> ff02c248d1985765a235f26c5ed5a386e60bd1b5
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  column: {
    flex: 1,
<<<<<<< HEAD
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  header: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 16,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  footer: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
    paddingBottom: 8,
  },
  pillButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    minHeight: BTN.primary,
    minWidth: 220,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 8,
  },
  pillText: {
    color: COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});


=======
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 12,
  },
  tapToContinue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: 0.5,
  },
  cardWrap: {
    width: '100%',
    maxWidth: 480,
  },
  card: {
    backgroundColor: SLATE.landingCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 24,
    alignItems: 'stretch',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minHeight: 48,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  loginText: {
    color: COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  createButton: {
    backgroundColor: COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.accentDeep,
    borderRadius: 12,
    minHeight: 48,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});

>>>>>>> ff02c248d1985765a235f26c5ed5a386e60bd1b5
