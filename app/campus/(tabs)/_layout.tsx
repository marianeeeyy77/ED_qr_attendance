import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppHeader from '@/components/AppHeader';
import { COLORS } from '@/constants/colors';
import { useCampusRole } from '@/lib/campusqr/roles';

/**
 * Role-based tabs (spec B3/C5). Screens a role cannot access are never
 * rendered as tabs (href: null). The header is the shared <AppHeader>
 * (gradient logo, app name + subtitle, user + role pill, Sign out); the tab
 * bar is glass-dark with an active fill. Both are safe-area aware (top via
 * AppHeader, bottom via the tab bar padding below).
 */
export default function CampusTabsLayout() {
  const { role, loading } = useCampusRole();
  const insets = useSafeAreaInsets();

  if (loading) {
    return null;
  }

  const isStaff = role === 'teacher' || role === 'admin';
  const isAdmin = role === 'admin';
  const isTeacher = role === 'teacher';
  // Unknown/loading-out role (e.g. no profile row yet) — show student tabs.
  const isStudent = !isStaff;

  return (
    <Tabs
      screenOptions={{
        header: () => <AppHeader />,
        headerStyle: { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 },
        headerShadowVisible: false,
        // The scene must stay transparent so the global <AppBackground>
        // radial gradient shows through (React Navigation defaults to an
        // opaque white card, which would hide the dark theme). The tab bar
        // itself keeps its solid glass-dark fill via tabBarStyle below.
        sceneStyle: { backgroundColor: 'transparent' },
        // The shared <AppHeader> applies the top safe-area inset itself, so we
        // stop the navigator from adding a second one above it.
        headerStatusBarHeight: 0,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.dark,
          borderTopColor: COLORS.borderDark,
          borderTopWidth: 1,
          // Keep the tab icons above the home indicator / gesture bar.
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
        },
        tabBarActiveBackgroundColor: 'rgba(255,255,255,0.14)',
      }}
    >
      <Tabs.Screen
        name="events"
        options={{
          title: isStaff ? 'Manage Events' : 'Events',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'calendar' : 'calendar-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="generate-qr"
        options={{
          title: 'Generate QR',
          href: isTeacher ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'qr-code' : 'qr-code-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan QR',
          href: isStudent ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'scan' : 'scan-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="my-attendance"
        options={{
          title: 'My Attendance',
          href: isStudent ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="monitor-attendance"
        options={{
          title: isAdmin ? 'Overall Attendance' : 'Monitor Attendance',
          href: isStaff ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="correct-records"
        options={{
          title: 'Correct Reports',
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'create' : 'create-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="manage-users"
        options={{
          title: 'Manage Users',
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'shield' : 'shield-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: isAdmin ? 'System Reports' : 'Summaries',
          href: isStaff ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'bar-chart' : 'bar-chart-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          // Admins have no Profile tab (they sign out from the header);
          // students and teachers reach Profile + Sign out via this tab.
          href: isAdmin ? null : undefined,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
