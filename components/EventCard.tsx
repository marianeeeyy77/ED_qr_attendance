import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { formatDateTime } from '@/lib/campusqr/format';
import { NEUMO } from '@/constants/colors';
import { SHADOWS } from '@/constants/theme';
import type { EventRow, EventStatus } from '@/types/database';

/**
 * Soft pastel status pills for the student events list (spec): light
 * background + dark text so the badge reads as a gentle indicator, never a
 * harsh saturated fill.
 */
const BADGE_TONE: Record<EventStatus, { bg: string; fg: string; bar: string }> = {
  open: { bg: '#D1FAE5', fg: '#166534', bar: '#10B981' },   // light green / dark green
  closed: { bg: '#FEE2E2', fg: '#991B1B', bar: '#EF4444' }, // light red / dark red
  draft: { bg: '#E0F2FE', fg: '#075985', bar: '#3B82F6' },  // light blue / dark blue
};

type Props = {
  event: EventRow;
};

/**
 * Student-only event card (spec, `userRole === 'student'`):
 *   - title + pastel status badge top-aligned in the header row,
 *   - location with a pin icon (row hidden when no venue),
 *   - date/time with a calendar icon (falls back to "Not set"),
 *   - description at the bottom of the card.
 * Teacher/admin keep the legacy inline card in events.tsx.
 *
 * Memoized: the student list re-renders on filter and realtime ticks;
 * unchanged rows skip re-rendering because the `event` prop identity is
 * preserved for untouched records between loads.
 */
function EventCardInner({ event }: Props) {
  const tone = BADGE_TONE[event.status] ?? BADGE_TONE.draft;
  return (
    <View style={styles.card}>
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.title}>{event.name}</Text>
          <View style={[styles.badge, { backgroundColor: tone.bg, borderColor: `${tone.fg}33` }]}>
            <Text style={[styles.badgeText, { color: tone.fg }]}>{event.status}</Text>
          </View>
        </View>

      {event.venue ? (
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={15} color="#334155" />
          <Text style={styles.meta} numberOfLines={1}>
            {event.venue}
          </Text>
        </View>
      ) : null}

      <View style={styles.metaRow}>
        <Ionicons name="calendar-outline" size={15} color="#334155" />
        <Text style={styles.meta}>{formatDateTime(event.start_datetime)}</Text>
      </View>

      {event.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {event.description}
        </Text>
      ) : null}
      </View>
    </View>
  );
}

const EventCard = memo(EventCardInner);

export default EventCard;

const styles = StyleSheet.create({
  // White fintech card (spec): solid surface, soft drop shadow, rounded
  // corners, with a status-colored left indicator bar.
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: NEUMO.cardRadius,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  body: {
    flex: 1,
    padding: 16,
  },
  /** Title left + badge right, both pinned to the TOP even when wrapped. */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  title: { fontSize: 17, fontWeight: '700', color: NEUMO.title, flex: 1 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 1,
  },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  meta: { fontSize: 13, color: '#334155', flexShrink: 1 },
  description: { fontSize: 14, color: NEUMO.title, marginTop: 6, lineHeight: 20 },
});
