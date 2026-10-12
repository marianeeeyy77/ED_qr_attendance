import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from '@/components/AnimatedPressable';
import FadeInView from '@/components/FadeInView';
import { COLORS, SLATE } from '@/constants/colors';

/**
 * Landing portal: warm Bone welcome card with a QR logo, "Welcome Back",
 * and Log In + Create an Account actions.
 */
export default function CampusLandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <FadeInView style={styles.center}>
        <View style={styles.iconBubble}>
          <Text style={styles.iconGlyph}>▩</Text>
        </View>
        <Text style={styles.appName}>School Attendance System</Text>
        <Text style={styles.subtitle}>Secure QR-powered campus attendance</Text>
      </FadeInView>

      <FadeInView delay={60} style={styles.cardWrap}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>
          <Text style={styles.cardSubtitle}>Sign in to your account</Text>

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
      </FadeInView>

      <Text style={styles.footer}>Developed by: Leonard V. Abatayo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBubble: {
    width: 96,
    height: 96,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
  iconGlyph: {
    fontSize: 52,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 4,
  },
  cardWrap: {
    width: '100%',
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
  footer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
});

