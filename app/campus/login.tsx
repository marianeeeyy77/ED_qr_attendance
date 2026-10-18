import { useState } from 'react';
import {
  Dimensions,
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
import Svg, { Path } from 'react-native-svg';
import Ionicons from '@expo/vector-icons/Ionicons';

import AnimatedPressable from '@/components/AnimatedPressable';
import ScreenTransition from '@/components/ScreenTransition';
import { useToast } from '@/components/CampusToast';
import { signIn } from '@/lib/campusqr/auth';
import { defaultTabFor, getCurrentProfile } from '@/lib/campusqr/roles';

/** CampusQR Login (mockup layout, mono B&W): email + password, session persisted. */
export default function CampusLoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      {/* White hero + wave into black (mockup). */}
      <View style={[styles.hero, { paddingTop: insets.top + 8 }]} />
      <ScreenTransition style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.waveWrap} aria-hidden>
              <Svg width={W} height={52} viewBox={`0 0 ${W} 52`} preserveAspectRatio="none">
                <Path
                  d={`M0,30 C${W * 0.25},6 ${W * 0.4},6 ${W * 0.55},24 C${W * 0.7},42 ${W * 0.86},36 ${W},20 L${W},52 L0,52 Z`}
                  fill="#111111"
                />
              </Svg>
            </View>
            <View style={styles.sheet}>
            <View style={styles.markCircleTop}>
              <Ionicons name="qr-code" size={44} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Welcome!</Text>
            <Text style={styles.subtitle}>Sign in to continue to your attendance account.</Text>

            <View style={styles.form}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your.email@school.edu"
                  placeholderTextColor="#8A8A8A"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>

              <Text style={styles.label}>Password</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#8A8A8A"
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <AnimatedPressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword((v) => !v)}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#CFCFCF" />
                </AnimatedPressable>
              </View>

              {error && <Text style={styles.error}>{error}</Text>}

              <View style={styles.actionContainer}>
                <AnimatedPressable
                  style={styles.signInButton}
                  onPress={handleLogin}
                  glowColor="#000000"
                  accessibilityRole="button"
                  accessibilityLabel="Sign in"
                >
                  <Text style={styles.signInText}>{loading ? 'SIGNING IN...' : 'SIGN IN'}</Text>
                </AnimatedPressable>
              </View>
            </View>

            <Text style={styles.switchRow}>
              <Link href="/campus/register" style={styles.switchLink}>Create an Account</Link>
            </Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      </ScreenTransition>
    </View>
  );
}

const W = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6A9C6' },
  hero: { height: 120, backgroundColor: '#F6A9C6' },
  flex: { flex: 1 },
  keyboardView: { flex: 1, backgroundColor: '#111111' },
  scrollContent: { flexGrow: 1, backgroundColor: '#111111' },
  waveWrap: { backgroundColor: '#F6A9C6', marginBottom: -1 },
  sheet: { flex: 1, backgroundColor: '#111111', paddingHorizontal: 24, paddingTop: 20, alignItems: 'center' },
  markCircleTop: {
    width: 96, height: 96, borderRadius: 48, marginBottom: 16, alignSelf: 'center',
    backgroundColor: '#E85D8A',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 30, fontWeight: '800', color: '#FFFFFF', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 14, fontWeight: '400', color: '#FFFFFF', marginBottom: 24, lineHeight: 20, textAlign: 'center' },
  form: { width: '100%', marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', marginBottom: 8, marginTop: 14 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1E1E1E', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16, minHeight: 54,
  },
  input: { flex: 1, fontSize: 15, color: '#FFFFFF', paddingVertical: 14 },
  inputFlex: { flex: 1 },
  eyeButton: { padding: 6, marginLeft: 8 },
  error: { fontSize: 14, color: '#FF9EBB', textAlign: 'center', marginTop: 12, fontWeight: '600' },
  actionContainer: { marginTop: 24, width: '100%', alignItems: 'center' },
  signInButton: {
    borderRadius: 14, minHeight: 52, paddingVertical: 15, paddingHorizontal: 40, minWidth: 200,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6A9C6',
    shadowColor: '#E85D8A', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45, shadowRadius: 14, elevation: 8,
  },
  signInText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 1.2 },
  switchRow: { fontSize: 13, marginTop: 16, color: '#FFFFFF', textAlign: 'center' },
  switchLink: { color: '#F6A9C6', fontWeight: '800' },
});
