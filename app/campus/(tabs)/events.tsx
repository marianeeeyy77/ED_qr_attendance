import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import EmptyState from '@/components/EmptyState';
import AnimatedPressable from '@/components/AnimatedPressable';
import { useToast } from '@/components/CampusToast';
import { COLORS } from '@/constants/colors';
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

  const filters = isStaff ? STATUS_FILTERS : (['all', 'open', 'closed'] as Filter[]);

  const pillColor = (option: Filter) =>
    option === 'open' ? '#10B981' : option === 'closed' ? '#EF4444' : option === 'draft' ? '#2A5BD7' : '#162660';

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
      <Text style={styles.title}>{isStaff ? 'Manage Events' : 'Events'}</Text>
      {!isStaff && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filters.map((option) => {
            const active = filter === option;
            const color = pillColor(option);
            return (
              <AnimatedPressable
                key={option}
                style={[styles.filterChip, active && { backgroundColor: color, borderColor: color }]}
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
        </ScrollView>
      )}
      {isStaff && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {filters.map((option) => {
          const active = filter === option;
          const color = pillColor(option);
          return (
            <AnimatedPressable
              key={option}
              style={[styles.filterChip, active && { backgroundColor: color, borderColor: color }]}
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
        </ScrollView>
      )}

      {isStaff && (
        <AnimatedPressable
          style={styles.createButton}
          onPress={() => router.push('/campus/event-form')}
          glowColor={COLORS.primary}
          accessibilityRole="button"
          accessibilityLabel="Create New Event"
        >
          <Text style={styles.createText}>+ Create New Event</Text>
        </AnimatedPressable>
      )}
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {visible.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="No events yet..."
            message={isStaff ? 'Create your first event to get started.' : 'Check back later for open events.'}
          />
        ) : (
          visible.map((event) => {
            const canManage = isStaff && (role === 'admin' || event.created_by === user?.id);
            const statusColor = event.status === 'open' ? '#10B981' : event.status === 'closed' ? '#EF4444' : '#2A5BD7';
            return (
              <View key={event.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{event.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${statusColor}22`, borderColor: `${statusColor}55` }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>{event.status}</Text>
                  </View>
                </View>
                {event.venue ? <Text style={styles.meta}>{event.venue}</Text> : null}
                <Text style={styles.meta}>{formatDateTime(event.start_datetime)}</Text>
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
                        <Ionicons name="create-outline" size={18} color="#162660" />
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
                          name={event.status === 'open' ? 'lock-closed-outline' : 'lock-open-outline'}
                          size={18}
                          color="#162660"
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
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: {
    flex: 1, backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center', gap: 12,
  },
  loadingText: { fontSize: 14, color: COLORS.textSecondary },
  title: { fontSize: 22, fontWeight: '700', color: '#162660', textAlign: 'center', paddingTop: 12, paddingBottom: 4 },
  createButton: {
    backgroundColor: '#162660', borderRadius: 12, marginHorizontal: 16, paddingVertical: 14, minHeight: 48,
    alignItems: 'center', justifyContent: 'center', marginVertical: 8,
  },
  createText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: {
    minHeight: 40, paddingHorizontal: 16, justifyContent: 'center',
    borderRadius: 999, backgroundColor: 'rgba(255, 253, 247, 0.88)',
    borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)',
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 14, fontWeight: '600', color: '#4A5878', textTransform: 'capitalize' },
  filterTextActive: { color: '#FFFFFF' },
  list: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  card: {
    backgroundColor: 'rgba(255, 253, 247, 0.88)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)', padding: 16,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#162660', flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  meta: { fontSize: 13, color: '#4A5878', marginBottom: 2 },
  description: { fontSize: 14, color: '#162660', marginTop: 6, lineHeight: 20 },
  actions: { flexDirection: 'row', marginTop: 12, gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  qrButton: {
    minHeight: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 6,
    backgroundColor: '#162660', borderRadius: 12, justifyContent: 'center',
  },
  qrText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  actionButton: {
    minHeight: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 4,
    backgroundColor: 'rgba(255, 253, 247, 0.88)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)',
  },
  actionText: { fontSize: 14, fontWeight: '600', color: '#162660' },
  deleteText: { color: '#EF4444' },
});
