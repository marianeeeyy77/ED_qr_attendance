import { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedLogo from '@/components/AnimatedLogo';
import AnimatedPressable from '@/components/AnimatedPressable';
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
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  column: {
    flex: 1,
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

