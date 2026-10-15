import { memo, useCallback, useMemo } from 'react';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from '@/components/AnimatedPressable';
import AppHeader from '@/components/AppHeader';
import Gradient from '@/components/Gradient';
import { useCampusRole } from '@/lib/campusqr/roles';
import { usePendingAppealCount } from '@/lib/campusqr/appeals';
import { COLORS, GRADIENTS, RADIUS, SLATE } from '@/constants/colors';
import { SHADOWS } from '@/constants/theme';

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
 * Appeals is merged into the Monitor tab (segment: Monitor | Appeals), so
 * no role sees an Appeals tab. Students reach the appeals screen from the
 * Appeal button on an absent row in Attendance history (deep link to the
 * hidden route); staff review the queue from the Monitor tab. Screens a
 * role cannot access are hidden outright (HIDDEN_TAB + a null
 * button), so only real tabs occupy width and each one gets an equal slot.
 *
 * Button anatomy — the ACTIVE tab highlights the WHOLE button as a filled
 * Royal-Navy surface (icon + label together), matching the "selected" state,
 * while inactive tabs stay as a muted icon + caption. Both states share the
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
 * Memoized: the navigator re-renders on role/appeal-count ticks; without
 * memo every tab button (and its AnimatedPressable) would re-render on
 * each tick. Motion + layout unchanged.
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
  badge,
}: any & {
  tabLabel: string;
  iconOutline: keyof typeof Ionicons.glyphMap;
  iconFilled: keyof typeof Ionicons.glyphMap;
  badge?: number;
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
      accessibilityLabel={badge != null && badge > 0 ? tabLabel + ', ' + badge + ' pending appeal' + (badge === 1 ? '' : 's') : tabLabel}
      accessibilityState={{ selected: focused }}
      hitSlop={6}
      pressScale={0.92}
      glowColor={focused ? SLATE.indigo : '#8A93A6'}
    >
      <View style={styles.tabIconWrap}>
        <Ionicons
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
      {badge != null && badge > 0 ? (
        <View style={styles.tabBadge} pointerEvents='none'>
          <Text style={styles.tabBadgeText}>{badge > 99 ? '99+' : String(badge)}</Text>
          </View>
        ) : null}
      </View>
    </AnimatedPressable>
  );
});

/**
 * Scan QR floating action button (styling-only): a prominent, centered
 * circular button raised above the tab bar. Same navigator-props contract
 * as TabButton — role gating is unchanged and still decided by the Scan
 * tab's options (hidden tab + null button for non-student roles).
 *
 * The slot is zero-width and centered between the left/right tab groups
 * (students: Events · Attendance ‖ [SCAN] ‖ Profile with Profile at
 * flex 2), so the FAB lands at the exact horizontal center of the bar.
 */
const ScanFabButton = memo(function ScanFabButton({
  accessibilityState,
  'aria-selected': ariaSelected,
  onPress,
  onLongPress,
  style: navStyle,
}: any) {
  // React Navigation v7 passes `aria-selected`; keep `accessibilityState`
  // as a fallback so the focused icon state can never silently stop.
  const focused = !!(accessibilityState?.selected ?? ariaSelected);
  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={onLongPress}
      outerStyle={[navStyle, styles.fabSlot]}
      style={styles.fab}
      accessibilityRole="tab"
      accessibilityLabel="Scan"
      accessibilityState={{ selected: focused }}
      hitSlop={6}
      pressScale={0.92}
      glowColor={GRADIENTS.scanFab[1]}
    >
      <Gradient
        colors={[...GRADIENTS.scanFab]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fabCircle}
      >
        <Ionicons name={focused ? 'scan' : 'scan-outline'} size={28} color="#FFFFFF" />
      </Gradient>
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
  const staffRole = role === 'teacher' || role === 'admin';
  const { count: pendingAppeals } = usePendingAppealCount(staffRole);

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
    iconOutline: keyof typeof Ionicons.glyphMap,
    iconFilled: keyof typeof Ionicons.glyphMap,
    badge: number = 0
  ) => ({
    tabBarItemStyle: visible ? undefined : HIDDEN_TAB,
    tabBarButton: (props: any) =>
      visible ? (
        <TabButton
          {...props}
          tabLabel={label}
          iconOutline={iconOutline}
          iconFilled={iconFilled}
            badge={badge}
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
          // The Scan FAB floats above the bar — never clip it.
          overflow: 'visible',
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
          ...gatedTab(true, 'Events', 'calendar-outline', 'calendar'),
        }}
      />
      <Tabs.Screen
        name="generate-qr"
        options={{
          title: 'QR',
          ...gatedTab(isTeacher, 'QR', 'qr-code-outline', 'qr-code'),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          ...gatedTab(isStudent, 'Scan', 'scan-outline', 'scan'),
          // Prominent centered Scan FAB (styling-only). Role gating is
          // unchanged: non-students keep the hidden slot + null button.
          tabBarItemStyle: isStudent ? styles.fabSlot : HIDDEN_TAB,
          tabBarButton: (props: any) =>
            isStudent ? <ScanFabButton {...props} /> : null,
        }}
      />
      <Tabs.Screen
        name="my-attendance"
        options={{
          title: 'Attendance',
          ...gatedTab(
            isStudent,
            'Attendance',
            'checkmark-circle-outline',
            'checkmark-circle'
          ),
        }}
      />
      <Tabs.Screen
        name="monitor-attendance"
        options={{
          title: isAdmin ? 'Overall Attendance' : 'Monitor',
          ...gatedTab(isStaff, 'Monitor', 'people-outline', 'people', pendingAppeals),
        }}
      />
      <Tabs.Screen
        name="correct-records"
        options={{
          title: 'Correct Records',
          ...gatedTab(isAdmin, 'Correct', 'create-outline', 'create'),
        }}
      />
      <Tabs.Screen
        name="manage-users"
        options={{
          title: 'Manage Users',
          ...gatedTab(isAdmin, 'Users', 'shield-outline', 'shield'),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: isAdmin ? 'System Reports' : 'Reports',
          ...gatedTab(isStaff, 'Reports', 'bar-chart-outline', 'bar-chart'),
        }}
      />
      <Tabs.Screen
        name="appeals"
        options={{
          title: 'Appeals',
          // Merged into the Monitor tab's "Appeals" segment; the route stays
          // registered (hidden) for the student deep link from My Attendance.
          ...gatedTab(false, 'Appeals', 'mail-open-outline', 'mail-open'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          ...gatedTab(true, 'Profile', 'person-outline', 'person'),
          // Student-only layout (styling-only): Profile takes the whole
          // right half so the Scan FAB sits at the exact bar center.
          tabBarItemStyle: isStudent ? styles.profileWide : undefined,
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
  /** Active: the WHOLE button fills Royal Navy (the selected surface). */
  tabTouchActive: {
    backgroundColor: SLATE.indigo,
    shadowColor: SLATE.indigo,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  /**
   * Zero-width center slot for the Scan FAB — the circle is absolutely
   * placed inside it, so the slot itself occupies no bar width.
   */
  fabSlot: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 0,
    width: 0,
    marginHorizontal: 0,
  },
  /** Student-only right half so the FAB lands dead-center (styling-only). */
  profileWide: {
    flex: 2,
  },
  /** Raised circular Scan FAB — floats above the bar, centered. */
  fab: {
    position: 'absolute',
    left: -30,
    top: -26,
  },
  fabCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...SHADOWS.fab,
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
  tabBadge: {
    position: 'absolute',
    top: -6,
    right: -16,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});