import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import EmptyState from '@/components/EmptyState';
import EventCard from '@/components/EventCard';
import AnimatedPressable from '@/components/AnimatedPressable';
import ScreenSheet from '@/components/ScreenSheet';
import ScreenTransition from '@/components/ScreenTransition';
import { useToast } from '@/components/CampusToast';
import { COLORS, NEUMO, SPACING, RADIUS, BTN } from '@/constants/colors';
import { useAuth } from '@/lib/auth';
import {
  deleteEvent,
  listVisibleEvents,
  setEventStatus,
} from '@/lib/campusqr/events';
import { formatDateTime } from '@/lib/campusqr/format';
import {
  useCampusRealtime,
  useRealtimeStatusToast,
} from '@/lib/campusqr/realtime';
import { useCampusRole } from '@/lib/campusqr/roles';
import type { EventRow, EventStatus } from '@/types/database';

const STATUS_FILTERS = ['all', 'draft', 'open', 'closed'] as const;
type Filter = (typeof STATUS_FILTERS)[number];

/**
 * Events list (spec Phase 3): role-aware content — students see only
 * open events; teachers see their own; admins see all. Live-refreshes
 * via the shared realtime channel.
 */
export default function EventsScreen() {
  const { user } = useAuth();
  const { role, isStaff, loading: roleLoading } = useCampusRole();
  const toast = useToast();
  const router = useRouter();
  const onStatus = useRealtimeStatusToast(toast);

  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  const load = useCallback(async () => {
    const rows = await listVisibleEvents(role, user?.id ?? null);
    setEvents(rows);
    setLoading(false);
  }, [role, user?.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useCampusRealtime(
    (change) => {
      if (change.table === 'events') load();
    },
    onStatus
  );

  const visible =
    filter === 'all' ? events : events.filter((event) => event.status === filter);

  // Role gate for every visual change below (spec): strictly the student
  // view. !isStaff mirrors the screen's existing student branches,
  // including the role-null edge; teacher/admin take the legacy path.
  const isStudentView = !isStaff;
  const filters = isStaff ? STATUS_FILTERS : (['all', 'open', 'closed'] as Filter[]);

  const handleToggleStatus = async (event: EventRow) => {
    const next: EventStatus = event.status === 'open' ? 'closed' : 'open';
    const { error } = await setEventStatus(event.id, next);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(next === 'open' ? 'Event opened.' : 'Event closed.');
    load();
  };

  const handleDelete = (event: EventRow) => {
    Alert.alert('Delete event', `Delete "${event.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await deleteEvent(event.id);
          if (error) {
            toast.error(error);
            return;
          }
          toast.success('Event deleted.');
          load();
        },
      },
    ]);
  };

  if (roleLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <ScreenSheet>
      <ScreenTransition style={styles.flex}>
      {/* FlatList owns the whole screen: the title + filter pills are the
          ListHeader, cards are rows. One scrollable — no nested-ScrollView
          height fight on Android, so cards always start directly under
          the pills for every role. */}
      <FlatList
        style={styles.listScroll}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        data={visible}
        keyExtractor={(event) => event.id}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.cardGap }} />}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>{isStaff ? 'Manage Events' : 'Events List'}</Text>
            {/* One filter row for both roles (spec): the ACTIVE pill is Royal
                Blue for students; teacher/admin keep the legacy status fills. */}
            <View style={styles.filterRow}>
              {filters.map((option) => {
                const active = filter === option;
                // Every role tints the touched chip pink (black & pink theme).
                const activeStyle = styles.filterChipActive;
                return (
                  <AnimatedPressable
                    key={option}
                    style={[styles.filterChip, active && activeStyle]}
                    onPress={() => setFilter(option)}
                    glowColor={COLORS.accent}
                    accessibilityRole="button"
                    accessibilityLabel={option}
                  >
                    <Text style={[styles.filterText, active && styles.filterTextActive]}>
                      {option === 'all' ? 'All' : option}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          </>
        }
        ListEmptyComponent={
          isStudentView && events.length > 0 ? (
            // Student-only (spec): a filter with zero matches gets a distinct
            // state plus a one-tap reset; teacher/admin keep the legacy empty
            // text in the branch below, unchanged.
            <View style={styles.emptyWrap}>
              <EmptyState
                icon="filter-outline"
                title={`No ${filter} events`}
                message="No events match this filter. Tap Show all events to see everything."
              />
              <AnimatedPressable
                style={styles.resetButton}
                onPress={() => setFilter('all')}
                glowColor={COLORS.primary}
                accessibilityRole="button"
                accessibilityLabel="Show all events"
              >
                <Text style={styles.resetText}>Show all events</Text>
              </AnimatedPressable>
            </View>
          ) : (
            <EmptyState
              icon="calendar-outline"
              title="No events yet..."
              message={isStaff ? 'Create your first event to get started.' : 'Check back later for open events.'}
            />
          )
        }
        renderItem={({ item: event }) => {
          // Student view (spec): redesigned card - pastel status pill,
          // pin + calendar icon rows, top-aligned header, description last.
          if (isStudentView) {
            return <EventCard event={event} />;
          }
            // Teacher/admin: standardized card — same top-anchored layout as
            // students (title+badge, pin row, calendar row, description),
            // plus staff management actions below.
            const canManage = isStaff;
            // Soft pastel status pill (spec): solid light background + dark
            // text so the badge reads as a gentle indicator, never a harsh
            // saturated fill. Same tone map as the student EventCard.
            const statusTone: Record<EventStatus, { bg: string; fg: string; bar: string }> = {
              open: { bg: '#D1FAE5', fg: '#166534', bar: '#10B981' },   // light green / dark green
              closed: { bg: '#FEE2E2', fg: '#991B1B', bar: '#EF4444' }, // light red / dark red
              draft: { bg: '#E0F2FE', fg: '#075985', bar: '#3B82F6' },  // light blue / dark blue
            };
            const tone = statusTone[event.status] ?? statusTone.draft;
            return (
              <View key={event.id} style={styles.card}>
                <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{event.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: tone.bg, borderColor: `${tone.fg}33` }]}>
                    <Text style={[styles.statusText, { color: tone.fg }]}>{event.status}</Text>
                  </View>
                </View>
                {event.venue ? (
                  <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={15} color="#334155" />
                    <Text style={styles.meta} numberOfLines={1}>{event.venue}</Text>
                  </View>
                ) : null}
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={15} color="#334155" />
                  <Text style={styles.meta}>{formatDateTime(event.start_datetime)}</Text>
                </View>
                {event.description ? (
                  <Text style={styles.description} numberOfLines={2}>{event.description}</Text>
                ) : null}
                <View style={styles.actions}>
                  {isStaff ? (
                    <AnimatedPressable
                      style={styles.qrButton}
                      onPress={() => router.push(`/campus/qr-display?id=${event.id}`)}
                      glowColor={COLORS.primary}
                      accessibilityRole="button"
                      accessibilityLabel="Display QR Code"
                    >
                      <Ionicons name="qr-code-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.qrText}>QR</Text>
                    </AnimatedPressable>
                  ) : null}
                  {canManage && (
                    <>
                      <AnimatedPressable
                        style={styles.actionButton}
                        onPress={() => router.push(`/campus/event-form?id=${event.id}`)}
                        glowColor={COLORS.accent}
                        accessibilityRole="button"
                        accessibilityLabel="Edit event"
                      >
                        <Ionicons name="create-outline" size={18} color="#1E40AF" />
                        <Text style={styles.actionText}>Edit</Text>
                      </AnimatedPressable>
                      <AnimatedPressable
                        style={styles.actionButton}
                        onPress={() => handleToggleStatus(event)}
                        glowColor={COLORS.accent}
                        accessibilityRole="button"
                        accessibilityLabel="Toggle status"
                      >
                        <Ionicons
                          name={event.status === 'open' ? 'lock-open-outline' : 'lock-closed-outline'}
                          size={18}
                          color="#1E40AF"
                        />
                        <Text style={styles.actionText}>{event.status === 'open' ? 'Close' : 'Open'}</Text>
                      </AnimatedPressable>
                      <AnimatedPressable
                        style={styles.actionButton}
                        onPress={() => handleDelete(event)}
                        glowColor={COLORS.danger}
                        accessibilityRole="button"
                        accessibilityLabel="Delete event"
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                      </AnimatedPressable>
                    </>
                  )}
                </View>
                </View>
              </View>
            );
          }}
        />
      </ScreenTransition>
      </ScreenSheet>
      {isStaff && (
        <AnimatedPressable
          outerStyle={styles.fabWrap}
          style={styles.fab}
          onPress={() => router.push('/campus/event-form')}
          glowColor="#E85D8A"
          accessibilityRole="button"
          accessibilityLabel="Create New Event"
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </AnimatedPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Universal top-anchor: the outer screen + transition wrapper pin
  // content under the filter pills for every role — never vertically centered.
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'flex-start' },
  flex: { flex: 1, justifyContent: 'flex-start' },
  loadingContainer: {
    flex: 1, backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center', gap: 12,
  },
  loadingText: { fontSize: 14, color: COLORS.textSecondary },
  title: { fontSize: 22, fontWeight: '700', color: NEUMO.title, textAlign: 'center', paddingTop: 12, paddingBottom: 4 },
  // Rounded-square FAB (staff only), bottom-right above the tab bar.
  // outer = position/size, inner = surface (AnimatedPressable slots).
  fabWrap: { position: 'absolute', right: 20, bottom: 24, width: 56, height: 56 },
  fab: {
    flex: 1, borderRadius: 16, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primaryDeep, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 8, elevation: 8,
  },
  filterRow: { flexDirection: 'row', paddingTop: 12, paddingBottom: 12, gap: 8 },
  filterChip: {
    minHeight: 40, paddingHorizontal: 16, justifyContent: 'center',
    borderRadius: 999, backgroundColor: NEUMO.surface,
    borderWidth: 1, borderColor: 'rgba(17, 17, 17, 0.06)', borderTopColor: NEUMO.highlight,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 14, fontWeight: '600', color: '#334155', textTransform: 'capitalize' },
  filterTextActive: { color: '#FFFFFF' },
  // Single-scroll layout: ONE FlatList owns title + pills + cards.
  // The title/pills are the ListHeader, cards are rows — never nested
  // ScrollViews (which fight over height on Android and push cards down).
  // height:'auto' must never return here.
  listScroll: { flex: 1 },
  list: { paddingHorizontal: 16, paddingTop: SPACING.listTop, paddingBottom: 96, flexGrow: 1, justifyContent: 'flex-start' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF', borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  cardBody: { flex: 1, padding: 16 },
  // Standard card rhythm (universal): header pins title + badge to the
  // TOP, then pin row, calendar row, description last.
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: NEUMO.title, flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1, marginTop: 1 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  meta: { fontSize: 13, color: '#334155', flexShrink: 1 },
  description: { fontSize: 14, color: NEUMO.title, marginTop: 6, lineHeight: 20 },
  actions: { flexDirection: 'row', marginTop: 12, gap: SPACING.buttonGap, flexWrap: 'wrap', alignItems: 'center' },
  qrButton: {
    minHeight: BTN.secondary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 6,
    backgroundColor: NEUMO.title, borderRadius: RADIUS.button, justifyContent: 'center',
  },
  qrText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  actionButton: {
    minHeight: BTN.secondary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 4,
    backgroundColor: NEUMO.surface, borderRadius: RADIUS.button,
    borderWidth: 1, borderColor: 'rgba(17, 17, 17, 0.06)', borderTopColor: NEUMO.highlight,
  },
  actionText: { fontSize: 14, fontWeight: '600', color: NEUMO.title },
  deleteText: { color: '#EF4444' },

  // Student-only filter-empty state (spec): explain + one-tap reset to All.
  emptyWrap: { alignItems: 'center', paddingTop: 24, gap: 6 },
  resetButton: {
    marginTop: 4,
    minHeight: 44,
    paddingHorizontal: 22,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
