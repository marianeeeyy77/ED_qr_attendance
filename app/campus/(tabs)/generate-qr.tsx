import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import Dropdown from '@/components/Dropdown';
import EmptyState from '@/components/EmptyState';
import QRDisplay from '@/components/QRDisplay';
import StatusPill, { eventStatusTone } from '@/components/StatusPill';
import { useToast } from '@/components/CampusToast';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/lib/auth';
import { listVisibleEvents, qrPayload } from '@/lib/campusqr/events';
import { formatDateTime } from '@/lib/campusqr/format';
import {
  useCampusRealtime,
  useRealtimeStatusToast,
} from '@/lib/campusqr/realtime';
import { useCampusRole } from '@/lib/campusqr/roles';
import type { EventRow } from '@/types/database';

/**
 * Generate QR (teacher, spec Phase 4): pick one of your events and project
 * its QR code (CAMPUSQR:<token>) for students to scan. Only `open` events
 * accept check-ins, so non-open events show a friendly guard note.
 * Live-refreshes with the shared realtime channel.
 */
export default function GenerateQrScreen() {
  const { user } = useAuth();
  const { role, loading: roleLoading } = useCampusRole();
  const toast = useToast();
  const onStatus = useRealtimeStatusToast(toast);

  const [events, setEvents] = useState<EventRow[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const rows = await listVisibleEvents(role, user?.id ?? null);
    setEvents(rows);
    setSelectedId((current) =>
      current && rows.some((event) => event.id === current)
        ? current
        : (rows[0]?.id ?? '')
    );
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

  const selected = events.find((event) => event.id === selectedId) ?? null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Generate QR</Text>

        {loading ? (
          <Text style={styles.hint}>Loading events...</Text>
        ) : events.length === 0 ? (
          <EmptyState
            icon="qr-code-outline"
            title="No events yet"
            message="Create an event first, then open it to generate its QR code."
          />
        ) : (
          <>
            <Dropdown
              label="Event"
              value={selectedId}
              options={events.map((event) => ({
                label: `${event.name} (${event.status})`,
                value: event.id,
              }))}
              onChange={setSelectedId}
            />

            {selected ? (
              <>
                <View style={styles.header}>
                  <Text style={styles.eventName}>{selected.name}</Text>
                  <StatusPill label={selected.status} tone={eventStatusTone(selected.status)} />
                </View>
                <Text style={styles.meta}>{formatDateTime(selected.start_datetime)}</Text>
                {selected.venue ? <Text style={styles.meta}>{selected.venue}</Text> : null}

                {selected.status !== 'open' ? (
                  <View style={styles.guard}>
                    <Ionicons name="information-circle-outline" size={18} color={COLORS.warning} />
                    <Text style={styles.guardText}>
                      Open the event first — students can only check in while it is open.
                    </Text>
                  </View>
                ) : null}

                <View style={styles.qrWrap}>
                  <QRDisplay
                    value={qrPayload(selected)}
                    size={264}
                    caption={`${qrPayload(selected)} — students scan this or type the code in Scan QR.`}
                  />
                </View>
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8, alignItems: 'stretch' },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  hint: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingVertical: 24 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8, marginBottom: 4 },
  eventName: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  meta: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 2 },
  guard: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12,
    backgroundColor: COLORS.card, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  guardText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  qrWrap: { marginTop: 20, width: '100%' },
});
