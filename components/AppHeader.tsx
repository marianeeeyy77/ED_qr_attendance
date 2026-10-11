import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useToast } from '@/components/CampusToast';
import Gradient from '@/components/Gradient';
import StatusPill, { roleTone } from '@/components/StatusPill';
import { COLORS, GRADIENTS } from '@/constants/colors';
import { signOut } from '@/lib/campusqr/auth';
import { ROLE_LABEL, useCampusRole } from '@/lib/campusqr/roles';

/**
 * Shared header for every CampusQR tab (spec C5 "Header (all roles)"):
 * animated gradient logo, app name + "School Event Attendance System"
 * subtitle, the signed-in user's name + role pill, and a Logout action.
 * Rendered as the React Navigation header for the campus tab navigator.
 */
export default function AppHeader() {
  const { profile, role } = useCampusRole();
  const router = useRouter();
  const toast = useToast();

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
    <View style={styles.bar}>
      <Gradient
        colors={[...GRADIENTS.brand]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.logo}
      >
        <MaterialIcons name="school" size={18} color="#FFFFFF" />
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
        style={styles.logout}
        accessibilityRole="button"
        accessibilityLabel="Log out"
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  titleBox: {
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
  logout: {
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
