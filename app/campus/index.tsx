import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Ionicons from '@expo/vector-icons/Ionicons';

import AnimatedPressable from '@/components/AnimatedPressable';
import { useAuth } from '@/lib/auth';
import { defaultTabFor, useCampusRole } from '@/lib/campusqr/roles';

/**
 * Landing splash (mockup layout, black & pink): pink hero (~55% of the
 * screen) with QR mark + "CCTC", wave divider into a black auth section
 * ("QR ATTENDANCE", "Scan • Attend • Succeed", GET STARTED → login).
 *
 * Already-signed-in users never see the buttons: the splash instantly
 * forwards them to their default tab.
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

  // Static entrance (no looping motion per request): fade/rise once.
  const intro = useRef(new Animated.Value(0)).current;
  const pillIntro = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0)).current;

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
  }, [intro, pillIntro]);

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

  // Tap GET STARTED: navigate WITH the fade so the splash exit overlaps
  // login's entrance — no blank frame.
  const go = () => {
    if (navigating.current) return;
    navigating.current = true;
    didLeave.current = true;
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
  const headerScale = exitScale;
  const footerScale = exitScale;

  return (
    <View style={styles.root}>
      {/* Pink hero (~55% of the screen) with QR mark + CCTC. */}
      <Animated.View
        style={[
          styles.hero,
          { paddingTop: insets.top, opacity: headerOpacity, transform: [{ translateY: headerY }, { scale: headerScale }] },
        ]}
      >
        <View style={styles.markCircle}>
          <Ionicons name="qr-code" size={72} color="#C2436F" />
        </View>
        <Text style={styles.brand}>CCTC</Text>
      </Animated.View>

      {/* Wave divider into the black section. */}
      <View style={styles.waveWrap} aria-hidden>
        <Svg width={W} height={64} viewBox={`0 0 ${W} 64`} preserveAspectRatio="none">
          <Path
            d={`M0,40 C${W * 0.22},12 ${W * 0.38},12 ${W * 0.55},32 C${W * 0.72},52 ${W * 0.88},44 ${W},28 L${W},64 L0,64 Z`}
            fill="#111111"
          />
        </Svg>
      </View>

      {/* Black section: tagline + GET STARTED only. */}
      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: insets.bottom + 32, opacity: footerOpacity, transform: [{ translateY: footerY }, { scale: footerScale }] },
        ]}
      >
        <Text style={styles.appName}>QR ATTENDANCE</Text>
        <Text style={styles.tagline}>Scan • Attend • Succeed</Text>
        <AnimatedPressable
          style={styles.pillButton}
          onPress={go}
          glowColor="#E85D8A"
          accessibilityRole="button"
          accessibilityLabel="Get started — go to Log In"
        >
          <Text style={styles.pillText}>GET STARTED</Text>
        </AnimatedPressable>
      </Animated.View>
    </View>
  );
}

const W = Dimensions.get('window').width;
const H = Dimensions.get('window').height;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6A9C6' },
  /** Taller pink panel so pink dominates black (~55 / 45). */
  hero: {
    height: Math.round(H * 0.55),
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24, paddingBottom: 24,
  },
  markCircle: {
    width: 148, height: 148, borderRadius: 74,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  brand: { fontSize: 30, fontStyle: 'italic', fontWeight: '800', color: '#C2436F', letterSpacing: 1 },
  waveWrap: { backgroundColor: '#F6A9C6', marginBottom: -1 },
  sheet: {
    flex: 1, backgroundColor: '#111111',
    paddingHorizontal: 32, alignItems: 'center',
    // Push QR ATTENDANCE / tagline / GET STARTED lower on the screen.
    justifyContent: 'center', paddingBottom: 24,
  },
  appName: { fontSize: 23, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.2, textAlign: 'center' },
  tagline: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginTop: 8 },
  pillButton: {
    marginTop: 24, borderRadius: 999, minHeight: 52, minWidth: 230,
    paddingVertical: 15, paddingHorizontal: 40,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F6A9C6',
    shadowColor: '#E85D8A', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45, shadowRadius: 18, elevation: 10,
  },
  pillText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: 1, textAlign: 'center' },
});


