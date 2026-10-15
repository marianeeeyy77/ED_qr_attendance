import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BusyButton from '@/components/BusyButton';
import FieldWithIcon from '@/components/FieldWithIcon';
import Gradient from '@/components/Gradient';
import Header from '@/components/Header';
import ScreenTransition from '@/components/ScreenTransition';
import { useToast } from '@/components/CampusToast';
import { COLORS, GRADIENTS, NEUMO } from '@/constants/colors';
import { SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { signIn } from '@/lib/campusqr/auth';
import { defaultTabFor, getCurrentProfile } from '@/lib/campusqr/roles';

/** CampusQR Login (spec Phase 2): email + password, session persisted. */
export default function CampusLoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: authError } = await signIn(
        email.trim(),
        password
      );

      if (authError) {
        setError(authError.message);
        toast.error(authError.message);
        return;
      }

      const user = data.session?.user;
      const profile = user ? await getCurrentProfile(user.id) : null;
      toast.success('Signed in successfully.');
      router.replace(defaultTabFor(profile?.role ?? null));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unexpected error. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top blue gradient hero (styling-only): logo + white app title. */}
      <Gradient
        colors={GRADIENTS.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 8 }]}
      >
        <Header title="School Attendance System" animated={false} variant="hero" />
      </Gradient>
      <ScreenTransition style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Rounded white sheet overlay (spec): 32pt top corners, soft
                drop shadow, tucked over the gradient hero. */}
            <View style={styles.sheet}>
            <View style={styles.fadeBody}>
            <Text style={[styles.title, TYPOGRAPHY.display]}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to your account
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>Email</Text>
              <FieldWithIcon
                icon="mail-outline"
                containerStyle={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your.email@school.edu"
                placeholderTextColor={COLORS.textSecondary}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />

              <Text style={styles.label}>Password</Text>
              <FieldWithIcon
                icon="lock-closed-outline"
                containerStyle={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.textSecondary}
                secureTextEntry
                editable={!loading}
              />

              {error && <Text style={styles.error}>{error}</Text>}

              <View style={styles.actionContainer}>
                <BusyButton
                  title="Sign In"
                  loadingTitle="Signing In..."
                  icon="log-in-outline"
                  onPress={handleLogin}
                  loading={loading}
                />
              </View>
            </View>

            <Link href="/campus/register" style={styles.link}>
              Don&apos;t have an account? Sign Up
            </Link>
            </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      </ScreenTransition>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  /** Top blue gradient hero band (styling-only). */
  hero: {
    paddingBottom: 40,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  flex: { flex: 1 },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  /** Rounded white sheet overlay tucked over the hero (spec: radius 32). */
  sheet: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 28,
    marginTop: -32,
    ...SHADOWS.sheet,
  },
  fadeBody: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  form: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: NEUMO.title,
    letterSpacing: 0.3,
    marginBottom: 6,
    marginTop: 10,
    textAlign: 'left',
  },
  input: {
    backgroundColor: NEUMO.surface,
    borderRadius: NEUMO.inputRadius,
    borderWidth: 0,
    borderTopWidth: 1,
    borderTopColor: NEUMO.highlight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: NEUMO.title,
    textAlign: 'left',
    shadowColor: NEUMO.darkShadow,
    shadowOffset: NEUMO.extrudeOffset,
    shadowOpacity: NEUMO.extrudeOpacity,
    shadowRadius: NEUMO.extrudeRadius,
    elevation: 3,
  },
  error: {
    fontSize: 14,
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: 24,
    width: '100%',
  },
  link: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: '700',
    paddingVertical: 8,
  },
});
