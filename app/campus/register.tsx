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
import { signUp } from '@/lib/campusqr/auth';

/**
 * CampusQR Register: Full Name + Email + Student Number + Create Password +
 * Confirm Password. Signup metadata NEVER carries role or is_active — the
 * database trigger hardcodes student.
 */
export default function CampusRegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentNo, setStudentNo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError(null);

    if (!fullName.trim() || !email.trim() || !studentNo.trim() || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: authError } = await signUp(email.trim(), password, {
        full_name: fullName.trim(),
        student_no: studentNo.trim(),
        // NOTE: no role / is_active — public signups are always students.
      });

      if (authError) {
        setError(authError.message);
        toast.error(authError.message);
        return;
      }

      if (data.session) {
        toast.success('Account created. Please sign in.');
      } else {
        toast.success('Account created. Check your email to confirm, then sign in.');
      }
      router.replace('/campus/login');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unexpected error. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Pink hero + wave into black (matches login). */}
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started.</Text>

            <View style={styles.form}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Juan Dela Cruz"
                  placeholderTextColor="#8A8A8A"
                  editable={!loading}
                />
              </View>

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

              <Text style={styles.label}>Student ID</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={studentNo}
                  onChangeText={setStudentNo}
                  placeholder="e.g. 2026-000123"
                  placeholderTextColor="#8A8A8A"
                  autoCapitalize="characters"
                  editable={!loading}
                />
              </View>

              <Text style={styles.label}>Create Password</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 6 characters"
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

              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#8A8A8A"
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                />
                <AnimatedPressable
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword((v) => !v)}
                  accessibilityRole="button"
                  accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#CFCFCF" />
                </AnimatedPressable>
              </View>

              {error && <Text style={styles.error}>{error}</Text>}

              <View style={styles.actionContainer}>
                <AnimatedPressable
                  style={styles.signUpButton}
                  onPress={handleRegister}
                  glowColor="#E85D8A"
                  accessibilityRole="button"
                  accessibilityLabel="Sign up"
                >
                  <Text style={styles.signUpText}>{loading ? 'CREATING...' : 'SIGN UP'}</Text>
                </AnimatedPressable>
              </View>
            </View>

            <Text style={styles.switchRow}>
              <Text style={styles.switchMuted}>Already have an account? </Text>
              <Link href="/campus/login" style={styles.switchLink}>Sign In</Link>
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
  signUpButton: {
    borderRadius: 14, minHeight: 52, paddingVertical: 15, paddingHorizontal: 40, minWidth: 200,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6A9C6',
    shadowColor: '#E85D8A', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45, shadowRadius: 14, elevation: 8,
  },
  signUpText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 1.2 },
  switchRow: { fontSize: 13, marginTop: 16, color: '#FFFFFF', textAlign: 'center' },
  switchMuted: { color: '#EDEDED' },
  switchLink: { color: '#F6A9C6', fontWeight: '800' },
});
