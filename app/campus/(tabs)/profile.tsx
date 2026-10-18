import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import AnimatedPressable from '@/components/AnimatedPressable';
import ScreenSheet from '@/components/ScreenSheet';
import ScreenTransition from '@/components/ScreenTransition';

import { useToast } from '@/components/CampusToast';
import { COLORS, NEUMO } from '@/constants/colors';
import { useAuth } from '@/lib/auth';
import { signOut } from '@/lib/campusqr/auth';
import { backfillStudentNo, fetchProfile } from '@/lib/campusqr/profiles';
import {
  useCampusRealtime,
  useRealtimeStatusToast,
} from '@/lib/campusqr/realtime';
import { ROLE_LABEL, useCampusRole } from '@/lib/campusqr/roles';
import type { Profile } from '@/types/database';

/** Reads the Student ID captured in auth signup metadata (may be absent). */
function readMetaStudentNo(metadata: unknown): string {
  const meta = (metadata ?? {}) as Record<string, unknown>;
  return typeof meta.student_no === 'string' ? meta.student_no.trim() : '';
}

/**
 * CampusQR Profile — trimmed layout per mockup: avatar + name + role pill
 * (Student / Teacher / Admin), one Personal Information card (Full Name,
 * Email, School ID — view only, never role/is_active/email edits in-app),
 * and Sign Out. School ID self-heals from signup metadata when the signup
 * trigger left the profile row empty. Sign-out stays available to all roles.
 */
export default function CampusProfileScreen() {
  const { user } = useAuth();
  const { isStudent, role } = useCampusRole();
  const toast = useToast();
  const router = useRouter();
  const onStatus = useRealtimeStatusToast(toast);

  // Role pill under the name — Admin kept short per mockup.
  const roleLabel = role === 'admin' ? 'Admin' : role ? ROLE_LABEL[role] : '';
  // Student ID captured at signup (fallback when the profile row lacks it).
  const metaStudentNo = readMetaStudentNo(user?.user_metadata);

  // Read-only profile: Full Name, Email and School ID are shown for
  // viewing only — no in-app editing (the admin office handles changes).
  const readOnly = true;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    const row = await fetchProfile(user.id);
    if (row) {
      // Self-heal: some signups never got student_no copied from auth
      // metadata into the profile row — backfill it best-effort, then
      // re-read so the screen shows the real Student ID.
      const metaNo = readMetaStudentNo(user.user_metadata);
      if (!row.student_no?.trim() && metaNo) {
        await backfillStudentNo(user.id, metaNo);
        const fixed = await fetchProfile(user.id);
        setProfile(fixed ?? row);
      } else {
        setProfile(row);
      }
    }
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

  // ---- Trimmed read-only profile: Full Name / Email / School ID ----
  if (readOnly) {
    return (
      <View style={styles.container}>
        <ScreenSheet>
      <ScreenTransition style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.profileName}>{profile?.full_name ?? (isStudent ? 'Student' : 'Staff')}</Text>
            {roleLabel ? (
              <View style={styles.idPill}>
                <Text style={styles.idPillText}>{roleLabel}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.infoCard}>
            <Text style={[styles.sectionTitle, styles.sectionTitleCenter]}>Personal Information</Text>
            <Text style={styles.miniLabel}>Full Name</Text>
            <Text style={styles.miniValue}>{profile?.full_name ?? ''}</Text>

            <Text style={styles.miniLabel}>Email</Text>
            <Text style={styles.miniValue}>{profile?.email ?? user?.email ?? ''}</Text>

            {isStudent && (
              <>
                <Text style={styles.miniLabel}>School ID</Text>
                <Text style={styles.miniValue}>
                  {profile?.student_no || metaStudentNo || 'No ID yet'}
                </Text>
              </>
            )}
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
        </ScreenTransition>
        </ScreenSheet>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 12 },
  title: { fontSize: 22, fontWeight: '700', color: NEUMO.title, marginBottom: 12, textAlign: 'center' },
  loadingBox: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  hint: { fontSize: 14, color: COLORS.textSecondary },
  profileHeader: { alignItems: 'center', marginBottom: 14 },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: 'rgba(30, 64, 175, 0.1)', borderWidth: 1,
    borderColor: 'rgba(30, 64, 175, 0.28)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: NEUMO.title },
  profileName: { fontSize: 20, fontWeight: '700', color: NEUMO.title, textAlign: 'center' },
  idPill: {
    marginTop: 8, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999,
    backgroundColor: 'rgba(30, 64, 175, 0.08)', borderWidth: 1, borderColor: 'rgba(30, 64, 175, 0.16)',
  },
  idPillText: { fontSize: 12, fontWeight: '600', color: NEUMO.title },
  infoCard: {
    backgroundColor: NEUMO.surface, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(17, 17, 17, 0.06)', borderTopColor: NEUMO.highlight,
    padding: 16, marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: NEUMO.title, marginBottom: 10 },
  sectionTitleCenter: { textAlign: 'center' },
  miniLabel: { fontSize: 12, fontWeight: '600', color: '#334155', marginTop: 8 },
  miniValue: { fontSize: 15, color: NEUMO.title, marginTop: 2 },
  label: { fontSize: 14, fontWeight: '600', color: NEUMO.title, marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: NEUMO.surface, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(17, 17, 17, 0.06)', borderTopColor: NEUMO.highlight,
    paddingHorizontal: 14, paddingVertical: 12, marginHorizontal: 0,
    fontSize: 16, color: NEUMO.title,
  },
  readonlyBox: {
    backgroundColor: NEUMO.surface, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(17, 17, 17, 0.06)', borderTopColor: NEUMO.highlight,
    paddingHorizontal: 14, paddingVertical: 12, opacity: 0.9,
  },
  readonlyText: { fontSize: 16, color: '#3A4A6B' },
  actions: { marginTop: 24, paddingBottom: 8 },
  signOutGlass: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1, borderRadius: 12, paddingVertical: 12, minHeight: 44,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  signOutGlassText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },
});
