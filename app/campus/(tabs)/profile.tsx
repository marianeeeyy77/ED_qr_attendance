import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import AnimatedPressable from '@/components/AnimatedPressable';

import BusyButton from '@/components/BusyButton';
import EducationFields from '@/components/EducationFields';
import { useToast } from '@/components/CampusToast';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/lib/auth';
import { signOut } from '@/lib/campusqr/auth';
import { fetchOwnHistory } from '@/lib/campusqr/attendance';
import {
  EMPTY_EDUCATION,
  educationFromProfile,
  validateLevelFields,
  type EducationErrors,
  type EducationValues,
} from '@/lib/campusqr/education';
import { formatDate } from '@/lib/campusqr/format';
import { fetchProfile, saveOwnProfile } from '@/lib/campusqr/profiles';
import {
  useCampusRealtime,
  useRealtimeStatusToast,
} from '@/lib/campusqr/realtime';
import { ROLE_LABEL, useCampusRole } from '@/lib/campusqr/roles';
import type { Profile } from '@/types/database';

/**
 * CampusQR Profile (spec Phase 7): stat cards (role, account created
 * date, events attended) plus an edit form limited to the eleven
 * self-editable columns — never role, is_active or email. The shared
 * buildProfilePatch writes department = course and
 * grade_class = formatGradeClass(...) on every save. Own-row updates
 * arrive live via the shared realtime channel.
 *
 * Students are read-only: personal + educational information is shown
 * for viewing only (inputs disabled, no Save button); only teachers
 * and admins may edit their own profile. Sign-out stays available
 * to every role.
 */
export default function CampusProfileScreen() {
  const { user } = useAuth();
  const { profile: roleProfile, refresh: refreshRole, isStudent, role } = useCampusRole();
  const isTeacher = role === 'teacher';
  const isAdmin = role === 'admin';
  const toast = useToast();
  const router = useRouter();
  const onStatus = useRealtimeStatusToast(toast);

  // Students view personal + educational information read-only; staff may edit.
  const readOnly = isStudent;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [attended, setAttended] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [studentNo, setStudentNo] = useState('');
  const [title, setTitle] = useState('');
  const [education, setEducation] = useState<EducationValues>({
    ...EMPTY_EDUCATION,
  });
  const [levelErrors, setLevelErrors] = useState<EducationErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    const [row, history] = await Promise.all([
      fetchProfile(user.id),
      fetchOwnHistory(user.id),
    ]);
    if (row) {
      setProfile(row);
      setFullName(row.full_name);
      setPhone(row.phone ?? '');
      setStudentNo(row.student_no ?? '');
      setTitle(row.title ?? '');
      setEducation(educationFromProfile(row));
    }
    setAttended(history.length);
    setLoading(false);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useCampusRealtime(
    (change) => {
      if (change.table !== 'profiles') return;
      const changedId = (change.new?.id ?? change.old?.id) as
        | string
        | undefined;
      if (changedId && changedId === user?.id) load();
    },
    onStatus
  );

  const handleSave = async () => {
    setError(null);
    setLevelErrors({});
    if (!user?.id) return;
    // Students may only update their phone number in-app.
    if (readOnly) {
      const digits = phone.replace(/\D/g, '');
      if (phone.trim() && digits.length < 7) {
        setError('Please enter a valid phone number.');
        return;
      }
      setSaving(true);
      try {
        const { error: saveError } = await saveOwnProfile(user.id, {
          full_name: profile?.full_name ?? fullName,
          phone,
          student_no: profile?.student_no ?? studentNo,
          title: profile?.title ?? title,
          education,
        });
        if (saveError) {
          setError(saveError);
          toast.error(saveError);
          return;
        }
        toast.success('Phone number updated.');
        refreshRole();
        load();
      } finally {
        setSaving(false);
      }
      return;
    }
    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    const errors = validateLevelFields(education);
    if (Object.keys(errors).length > 0) {
      setLevelErrors(errors);
      setError('Please fix the highlighted education fields.');
      return;
    }
    setSaving(true);
    try {
      const { error: saveError } = await saveOwnProfile(user.id, {
        full_name: fullName,
        phone,
        student_no: studentNo,
        title,
        education,
      });
      if (saveError) {
        setError(saveError);
        toast.error(saveError);
        return;
      }
      toast.success('Profile updated.');
      refreshRole();
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/campus/login');
    } finally {
      setSigningOut(false);
    }
  };

  const initials = (profile?.full_name ?? user?.email ?? 'LA')
    .split(' ')
    .map((p) => p.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'LA';

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.hint}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  // ---- Student read-only Deep Slate profile ----
  if (readOnly) {
    const edu: any = education as any;
    const level = edu?.level ?? edu?.educationalLevel ?? '';
    const course = edu?.course ?? edu?.strand ?? '';
    const year = edu?.yearLevel ?? edu?.year ?? '';
    const block = edu?.block ?? edu?.section ?? '';
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.profileName}>{profile?.full_name ?? 'Student'}</Text>
            <View style={styles.idPill}>
              <Text style={styles.idPillText}>{profile?.student_no ?? 'No ID yet'}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#2A3F8F' }]}>Student</Text>
              <Text style={styles.statLabel}>Role</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#2A5BD7' }]}>
                {profile ? formatDate(profile.created_at) : '...'}
              </Text>
              <Text style={styles.statLabel}>Member since</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#34D399' }]}>{attended}</Text>
              <Text style={styles.statLabel}>Events attended</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <Text style={styles.miniLabel}>Email</Text>
            <Text style={styles.miniValue}>{profile?.email ?? user?.email ?? ''}</Text>
            <Text style={styles.miniLabel}>Phone</Text>
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="Add your phone number"
              placeholderTextColor="#64748B"
              keyboardType="phone-pad"
              editable={!saving}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <AnimatedPressable
              style={[styles.savePhone, saving && styles.savePhoneDisabled]}
              onPress={handleSave}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel="Save phone number"
            >
              <Text style={styles.savePhoneText}>{saving ? 'Saving...' : 'Save Phone'}</Text>
            </AnimatedPressable>
            <Text style={styles.adminNote}>
              Other details are locked. Visit the administration office to request changes.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Academic Information</Text>
            <Text style={styles.miniLabel}>Educational Level</Text>
            <Text style={styles.miniValue}>{level || '—'}</Text>
            <Text style={styles.miniLabel}>Course</Text>
            <Text style={styles.miniValue}>{course || '—'}</Text>
            <View style={styles.twoCol}>
              <View style={styles.twoColItem}>
                <Text style={styles.miniLabel}>Year Level</Text>
                <Text style={styles.miniValue}>{year || '—'}</Text>
              </View>
              <View style={styles.twoColItem}>
                <Text style={styles.miniLabel}>Block</Text>
                <Text style={styles.miniValue}>{block || '—'}</Text>
              </View>
            </View>
          </View>

          <AnimatedPressable
            style={styles.signOutGlass}
            onPress={handleSignOut}
            disabled={signingOut}
            accessibilityRole="button"
            accessibilityLabel="Sign Out"
            glowColor="#EF4444"
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.signOutGlassText}>{signingOut ? 'Signing out...' : 'Sign Out'}</Text>
          </AnimatedPressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Profile</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="shield-outline" size={22} color={COLORS.primary} />
              <Text style={styles.statLabel}>Role</Text>
              <Text style={styles.statValue}>
                {profile ? ROLE_LABEL[profile.role] : '...'}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
              <Text style={styles.statLabel}>Member since</Text>
              <Text style={styles.statValue}>
                {profile ? formatDate(profile.created_at) : '...'}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color={COLORS.primary}
              />
              <Text style={styles.statLabel}>Events attended</Text>
              <Text style={styles.statValue}>{attended}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Text style={styles.label}>Email (read-only)</Text>
          <View style={styles.readonlyBox}>
            <Text style={styles.readonlyText}>{profile?.email ?? user?.email ?? ''}</Text>
          </View>

          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Full name"
            placeholderTextColor={COLORS.textSecondary}
            editable={!saving}
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="phone-pad"
            editable={!saving}
          />

          <Text style={styles.label}>Student number</Text>
          <TextInput
            style={styles.input}
            value={studentNo}
            onChangeText={setStudentNo}
            placeholder="Student number"
            placeholderTextColor={COLORS.textSecondary}
            editable={!saving}
          />

          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Title (e.g. Mr., Ms.)"
            placeholderTextColor={COLORS.textSecondary}
            editable={!saving}
          />

          <Text style={styles.sectionTitle}>Educational Information</Text>
          <EducationFields
            value={education}
            onChange={setEducation}
            errors={levelErrors}
            disabled={saving}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <AnimatedPressable
              style={styles.signOutGlass}
              onPress={handleSignOut}
              disabled={signingOut}
              accessibilityRole="button"
              accessibilityLabel="Sign Out"
              glowColor="#EF4444"
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={styles.signOutGlassText}>{signingOut ? 'Signing out...' : 'Sign Out'}</Text>
            </AnimatedPressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#162660', marginBottom: 12, textAlign: 'center' },
  loadingBox: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  hint: { fontSize: 14, color: COLORS.textSecondary },
  profileHeader: { alignItems: 'center', marginBottom: 14 },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: 'rgba(22, 38, 96, 0.1)', borderWidth: 1,
    borderColor: 'rgba(22, 38, 96, 0.28)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#162660' },
  profileName: { fontSize: 20, fontWeight: '700', color: '#162660', textAlign: 'center' },
  idPill: {
    marginTop: 8, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999,
    backgroundColor: 'rgba(22, 38, 96, 0.08)', borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.16)',
  },
  idPillText: { fontSize: 12, fontWeight: '600', color: '#162660' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: {
    flex: 1, backgroundColor: 'rgba(255, 253, 247, 0.88)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)',
    paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  statLabel: { fontSize: 11, color: '#4A5878', textAlign: 'center' },
  statValue: { fontSize: 13, fontWeight: '700', color: '#162660', textAlign: 'center' },
  infoCard: {
    backgroundColor: 'rgba(255, 253, 247, 0.88)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)',
    padding: 16, marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#162660', marginBottom: 10 },
  miniLabel: { fontSize: 12, fontWeight: '600', color: '#4A5878', marginTop: 8 },
  miniValue: { fontSize: 15, color: '#162660', marginTop: 2 },
  phoneInput: {
    backgroundColor: 'rgba(255, 253, 247, 0.88)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)',
    paddingHorizontal: 14, paddingVertical: 12, marginTop: 6, minHeight: 48,
    fontSize: 15, color: '#162660',
  },
  savePhone: {
    backgroundColor: '#162660', borderRadius: 12, paddingVertical: 12,
    alignItems: 'center', justifyContent: 'center', marginTop: 10, minHeight: 44,
  },
  savePhoneDisabled: { opacity: 0.6 },
  savePhoneText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  adminNote: { fontSize: 12, color: '#4A5878', fontStyle: 'italic', lineHeight: 17, marginTop: 10 },
  twoCol: { flexDirection: 'row', gap: 12 },
  twoColItem: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600', color: '#162660', marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: 'rgba(255, 253, 247, 0.88)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)',
    paddingHorizontal: 14, paddingVertical: 12, marginHorizontal: 0,
    fontSize: 16, color: '#162660',
  },
  readonlyBox: {
    backgroundColor: 'rgba(255, 253, 247, 0.88)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)',
    paddingHorizontal: 14, paddingVertical: 12, opacity: 0.9,
  },
  readonlyText: { fontSize: 16, color: '#3A4A6B' },
  error: { fontSize: 14, color: COLORS.danger, textAlign: 'center', marginTop: 12 },
  actions: { marginTop: 24, paddingBottom: 8 },
  signOutGlass: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1, borderRadius: 12, paddingVertical: 12, minHeight: 44,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  signOutGlassText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },
});