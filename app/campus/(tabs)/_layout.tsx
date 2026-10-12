import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from '@/components/AnimatedPressable';
import AppHeader from '@/components/AppHeader';
import { useCampusRole } from '@/lib/campusqr/roles';
import { SLATE } from '@/constants/colors';

/**
 * Role-based tabs (simplified navigation):
 *   Student → Events · Scan · Attendance · Profile         (4)
 *   Teacher → Events · QR · Monitor · Reports · Profile    (5)
 *   Admin   → + Users · Correct                           (7)
 *
 * Screens a role cannot access are never rendered (tabBarButton → null).
 * The bar is a warm Bone glass surface with a Royal Navy active pill
 * (icon + label); inactive tabs show a muted icon only.
 */
function TabButton({
  accessibilityState,
  onPress,
  tabLabel,
  iconOutline,
  iconFilled,
}: any & {
  tabLabel: string;
  iconOutline: keyof typeof Ionicons.glyphMap;
  iconFilled: keyof typeof Ionicons.glyphMap;
}) {
  const focused = !!accessibilityState?.selected;
  return (
    <AnimatedPressable
      onPress={onPress}
      style={styles.tabTouch}
      accessibilityRole="tab"
      accessibilityLabel={tabLabel}
      accessibilityState={{ selected: focused }}
      hitSlop={4}
      pressScale={0.9}
      glowColor={focused ? '#162660' : '#94A3B8'}
    >
      {focused ? (
        <View style={styles.activePill}>
          <Ionicons name={iconFilled} size={20} color="#FFFFFF" />
          <Text style={styles.activeLabel} numberOfLines={1}>
            {tabLabel}
          </Text>
        </View>
      ) : (
        <View style={styles.inactiveWrap}>
          <Ionicons name={iconOutline} size={20} color={SLATE.muted} />
        </View>
      )}
    </AnimatedPressable>
  );
}

/**
 * Role-based tabs (spec B3/C5, simplified). The scene stays transparent so
 * the global <AppBackground> warm radial shows through; the tab bar keeps a
 * solid Bone glass fill via tabBarStyle below.
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
  const isStudent = !isStaff;

  return (
    <Tabs
      screenOptions={{
        header: () => <AppHeader />,
        headerStyle: { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: 'transparent' },
        headerStatusBarHeight: 0,
        tabBarShowLabel: false,
        tabBarActiveTintColor: SLATE.indigo,
        tabBarInactiveTintColor: SLATE.muted,
        tabBarStyle: {
          backgroundColor: SLATE.tabBar,
          borderTopColor: SLATE.border,
          borderTopWidth: 1,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          paddingHorizontal: 4,
        },
      }}
    >
      <Tabs.Screen
        name="events"
        options={{
          title: isStaff ? 'Manage Events' : 'Events',
          tabBarButton: (props: any) => (
            <TabButton {...props} tabLabel="Events" iconOutline="calendar-outline" iconFilled="calendar" />
          ),
        }}
      />
      <Tabs.Screen
        name="generate-qr"
        options={{
          title: 'QR',
          tabBarButton: (props: any) => {
            if (!isTeacher) return null;
            return (
              <TabButton {...props} tabLabel="QR" iconOutline="qr-code-outline" iconFilled="qr-code" />
            );
          },
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarButton: (props: any) => {
            if (!isStudent) return null;
            return (
              <TabButton {...props} tabLabel="Scan" iconOutline="scan-outline" iconFilled="scan" />
            );
          },
        }}
      />
      <Tabs.Screen
        name="my-attendance"
        options={{
          title: 'Attendance',
          tabBarButton: (props: any) => {
            if (!isStudent) return null;
            return (
              <TabButton {...props} tabLabel="Attendance" iconOutline="checkmark-circle-outline" iconFilled="checkmark-circle" />
            );
          },
        }}
      />
      <Tabs.Screen
        name="monitor-attendance"
        options={{
          title: isAdmin ? 'Overall Attendance' : 'Monitor',
          tabBarButton: (props: any) => {
            if (!isStaff) return null;
            return (
              <TabButton {...props} tabLabel="Monitor" iconOutline="people-outline" iconFilled="people" />
            );
          },
        }}
      />
      <Tabs.Screen
        name="correct-records"
        options={{
          title: 'Correct Records',
          tabBarButton: (props: any) => {
            if (!isAdmin) return null;
            return (
              <TabButton {...props} tabLabel="Correct" iconOutline="create-outline" iconFilled="create" />
            );
          },
        }}
      />
      <Tabs.Screen
        name="manage-users"
        options={{
          title: 'Manage Users',
          tabBarButton: (props: any) => {
            if (!isAdmin) return null;
            return (
              <TabButton {...props} tabLabel="Users" iconOutline="shield-outline" iconFilled="shield" />
            );
          },
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: isAdmin ? 'System Reports' : 'Reports',
          tabBarButton: (props: any) => {
            if (!isStaff) return null;
            return (
              <TabButton {...props} tabLabel="Reports" iconOutline="bar-chart-outline" iconFilled="bar-chart" />
            );
          },
        }}
      />
      <Tabs.Screen name="appeals" options={{ title: 'Appeals', href: null }} />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarButton: (props: any) => (
            <TabButton {...props} tabLabel="Profile" iconOutline="person-outline" iconFilled="person" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabTouch: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  inactiveWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    minHeight: 32,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SLATE.indigo,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
    maxWidth: 130,
    minHeight: 32,
    shadowColor: SLATE.indigo,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  activeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

