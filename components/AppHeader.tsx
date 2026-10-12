import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useToast } from '@/components/CampusToast';
import Gradient from '@/components/Gradient';
import StatusPill, { roleTone } from '@/components/StatusPill';
import { COLORS, DEPTH, GRADIENTS } from '@/constants/colors';
import { signOut } from '@/lib/campusqr/auth';
import { ROLE_LABEL, useCampusRole } from '@/lib/campusqr/roles';

/**
 * Shared header for every CampusQR tab (spec C5 "Header (all roles)"):
 * animated gradient logo, app name + "School Event Attendance System"
 * subtitle, the signed-in user's name + role pill, and a Sign out icon.
 * Rendered as the React Navigation header for the campus tab navigator.
 * (The Profile tab holds the full profile; admins have no Profile tab and
 * sign out from here.)
 *
 * The top safe-area inset is applied here (the navigator's own status-bar
 * height is disabled in the tab layout) so the logo/name never sit under
 * the notch or status bar on native.
 */
export default function AppHeader() {
  const { profile, role } = useCampusRole();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const name = profile?.full_name?.trim() || 'Account';

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    router.replace('/campus');
  };

  return (
    <View style={[styles.bar, { paddingTop: insets.top }]}>
      <Gradient
        colors={[...GRADIENTS.brand]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.logo}
      >
        <MaterialIcons name="school" size={18} color="#FFFFFF" />
        {/* Specular sheen across the mark (matches the 3D Header logo). */}
        <Gradient
          colors={DEPTH.sheenSoft}
          locations={[0, 0.6]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Gradient>

      <View style={styles.titleBox}>
        <Text style={styles.appName} numberOfLines={1}>
          CampusQR Attend
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          School Event Attendance System
        </Text>
      </View>

      <View style={styles.userBox}>
        <Text style={styles.userName} numberOfLines={1}>
          {name}
        </Text>
        {role ? (
          <StatusPill label={ROLE_LABEL[role]} tone={roleTone(role)} />
        ) : null}
      </View>

      <Pressable
        onPress={handleSignOut}
        style={styles.iconButton}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        hitSlop={8}
      >
        <MaterialIcons name="logout" size={20} color={COLORS.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.dark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  titleBox: {
    flex: 1,
    flexShrink: 1,
  },
  appName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  userBox: {
    alignItems: 'flex-end',
    flexShrink: 1,
    gap: 2,
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    maxWidth: 120,
  },
  iconButton: {
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
