import { memo, useCallback, useMemo } from 'react';
import { Tabs } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from '@/components/AnimatedPressable';
import AppHeader from '@/components/AppHeader';
import { useCampusRole } from '@/lib/campusqr/roles';
import { COLORS, RADIUS, SLATE } from '@/constants/colors';

/**
 * Hides a route from the bar completely. React Navigation v7 wraps every
 * tab in a `flex: 1` item — a `tabBarButton` that returns `null` still
 * leaves that empty slot behind (which is what made the visible buttons
 * tiny and unevenly spaced). `display: 'none'` removes the slot so the
 * remaining tabs split the bar into equal, full-width slices. This is the
 * same mechanism expo-router itself uses for `href: null` routes.
 */
const HIDDEN_TAB: { display: 'none' } = { display: 'none' };

/**
 * Role-based tabs (simplified navigation):
 *   Student → Events · Scan · Attendance · Profile                        (4)
 *   Teacher → Events · QR · Monitor · Reports · Profile                   (5)
 *   Admin   → Events · Monitor · Correct · Users · Reports · Profile      (6)
 *
 * Screens a role cannot access are hidden outright (HIDDEN_TAB + a null
 * button), so only real tabs occupy width and each one gets an equal slot.
 *
 * Button anatomy — the ACTIVE tab highlights the WHOLE button as a filled
 * pink surface (icon + label together), matching the "selected" state,
 * while inactive tabs stay as a muted icon + caption. Icons are
 * MaterialCommunityIcons (modern illustrative glyphs) for every role.
 * Both states share the
 * exact same box (size, radius, padding) so switching tabs never shifts the
 * neighbours (zero layout jump):
 *   ┌──────────────────┐
 *   │  icon   (24×24)  │  ← white filled icon when active / muted outline
 *   │  caption (12pt)  │  ← white bold when active / muted when inactive
 *   └──────────────────┘
 * Each button keeps the navigator's `flex: 1` slot style (so visible tabs
 * split the bar into equal widths) with a small horizontal margin, filling
 * its slice when active. The bar is a warm Bone glass surface.
 *
 * Memoized: the navigator re-renders on role ticks; without memo every
 * tab button (and its AnimatedPressable) would re-render on each tick.
 * Motion + layout unchanged.
 */
const TabButton = memo(function TabButton({
  accessibilityState,
  'aria-selected': ariaSelected,
  onPress,
  onLongPress,
  style: navStyle,
  tabLabel,
  iconOutline,
  iconFilled,
}: any & {
  tabLabel: string;
  iconOutline: keyof typeof MaterialCommunityIcons.glyphMap;
  iconFilled: keyof typeof MaterialCommunityIcons.glyphMap;
}) {
  // React Navigation v7 passes `aria-selected`; keep `accessibilityState`
  // as a fallback so the active pill can never silently stop rendering.
  const focused = !!(accessibilityState?.selected ?? ariaSelected);
  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.tabTouch, focused && styles.tabTouchActive]}
      outerStyle={navStyle}
      accessibilityRole="tab"
      accessibilityLabel={tabLabel}
      accessibilityState={{ selected: focused }}
      hitSlop={6}
      pressScale={0.92}
      glowColor={focused ? SLATE.indigo : '#8A93A6'}
    >
      <View style={styles.tabIconWrap}>
        <MaterialCommunityIcons
          name={focused ? iconFilled : iconOutline}
          size={24}
          color={focused ? '#FFFFFF' : SLATE.muted}
        />
      <Text
        style={[styles.tabLabel, focused && styles.tabLabelActive]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {tabLabel}
      </Text>
      </View>
    </AnimatedPressable>
  );
});

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

  /**
   * Options for a role-gated tab. When the role cannot use the screen the
   * tab is removed from layout entirely (no empty slot is reserved).
   */
  const gatedTab = (
    visible: boolean,
    label: string,
    iconOutline: keyof typeof MaterialCommunityIcons.glyphMap,
    iconFilled: keyof typeof MaterialCommunityIcons.glyphMap
  ) => ({
    tabBarItemStyle: visible ? undefined : HIDDEN_TAB,
    tabBarButton: (props: any) =>
      visible ? (
        <TabButton
          {...props}
          tabLabel={label}
          iconOutline={iconOutline}
          iconFilled={iconFilled}
        />
      ) : null,
  });

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
          backgroundColor: '#FFFFFF',
          borderTopColor: 'rgba(30, 64, 175, 0.10)',
          borderTopWidth: 1,
          // 58pt button row (6pt top pad + 52pt buttons) + home indicator.
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
          paddingHorizontal: 6,
          // Soft lift so the bar reads as a surface floating over the scene.
          shadowColor: SLATE.indigo,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.10,
          shadowRadius: 16,
          elevation: 12,
        },
      }}
    >
      <Tabs.Screen
        name="events"
        options={{
          title: isStaff ? 'Manage Events' : 'Events',
          ...gatedTab(true, 'Events', 'calendar-month-outline', 'calendar-month'),
        }}
      />
      <Tabs.Screen
        name="generate-qr"
        options={{
          title: 'QR',
          ...gatedTab(isTeacher, 'QR', 'qrcode', 'qrcode'),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          ...gatedTab(isStudent, 'Scan', 'qrcode-scan', 'qrcode-scan'),
        }}
      />
      <Tabs.Screen
        name="my-attendance"
        options={{
          title: 'Attendance',
          ...gatedTab(
            isStudent,
            'Attendance',
            'clipboard-check-outline',
            'clipboard-check'
          ),
        }}
      />
      <Tabs.Screen
        name="monitor-attendance"
        options={{
          title: isAdmin ? 'Overall Attendance' : 'Monitor',
          ...gatedTab(isStaff, 'Monitor', 'account-group-outline', 'account-group'),
        }}
      />
      <Tabs.Screen
        name="correct-records"
        options={{
          title: 'Correct Records',
          ...gatedTab(isAdmin, 'Correct', 'pencil-outline', 'pencil'),
        }}
      />
      <Tabs.Screen
        name="manage-users"
        options={{
          title: 'Manage Users',
          ...gatedTab(isAdmin, 'Users', 'shield-account-outline', 'shield-account'),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: isAdmin ? 'System Reports' : 'Reports',
          ...gatedTab(isStaff, 'Reports', 'chart-box-outline', 'chart-box'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          ...gatedTab(true, 'Profile', 'account-circle-outline', 'account-circle'),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  /**
   * Inner content: fills its `flex: 1` slot (minus a small side margin so the
   * active fill reads as a distinct, rounded surface), centred icon + caption.
   * Active ⇄ inactive share this exact box so the neighbours never shift.
   */
  tabTouch: {
    flex: 1,
    minHeight: 48,
    marginHorizontal: 4,
    paddingHorizontal: 6,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    gap: 3,
    borderRadius: RADIUS.nav,
    backgroundColor: 'transparent',
  },
  /** Active: the WHOLE button fills pink (the selected surface). */
  tabTouchActive: {
    backgroundColor: SLATE.indigo,
    shadowColor: SLATE.indigo,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  tabIconWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '500',
    color: SLATE.muted,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
