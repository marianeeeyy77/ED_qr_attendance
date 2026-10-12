import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import AttendanceRecords from '@/components/AttendanceRecords';
import Dropdown from '@/components/Dropdown';
import LockedView from '@/components/LockedView';
import { useToast } from '@/components/CampusToast';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/lib/auth';
import {
  fetchEventRecords,
  type EventAttendanceRecord,
} from '@/lib/campusqr/attendance';
import { listVisibleEvents } from '@/lib/campusqr/events';
import {
  useCampusRealtime,
  useRealtimeStatusToast,
} from '@/lib/campusqr/realtime';
import { useCampusRole } from '@/lib/campusqr/roles';
import type { EventRow } from '@/types/database';

/**
 * Monitor Attendance (staff, spec Phase 5): per-event records with
 * status pills, filters, and per-row Correct Records actions.
 * Live-refreshes with echo suppression after local mutations.
 */
export default function MonitorAttendanceScreen() {
  const { user } = useAuth();
  const { role, isStaff, isAdmin, loading: roleLoading } = useCampusRole();
  const toast = useToast();
  const onStatus = useRealtimeStatusToast(toast);

  const [events, setEvents] = useState<EventRow[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [records, setRecords] = useState<EventAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    const rows = await listVisibleEvents(role, user?.id ?? null);
    setEvents(rows);
    if (!selectedId && rows.length > 0) setSelectedId(rows[0].id);
    setLoading(false);
  }, [role, user?.id, selectedId]);

  const loadRecords = useCallback(async () => {
    if (!selectedId) return;
    const rows = await fetchEventRecords(selectedId);
    setRecords(rows);
  }, [selectedId]);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [loadRecords])
  );

  useCampusRealtime(
    (change) => {
      if (change.table === 'attendance') loadRecords();
      if (change.table === 'events') loadEvents();
    },
    onStatus
  );

  if (!roleLoading && !isStaff) {
    return <LockedView message="Only teachers and administrators can monitor attendance." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{isAdmin ? 'Overall Attendance' : 'Monitor Attendance'}</Text>
        {loading ? (
          <Text style={styles.hint}>Loading events...</Text>
        ) : events.length === 0 ? (
          <Text style={styles.hint}>No events to monitor yet.</Text>
        ) : (
          <>
            <View style={styles.selectorCard}>
              <Text style={styles.selectorTitle} numberOfLines={1}>
                {events.find((e) => e.id === selectedId)?.name ?? 'Select event'}
              </Text>
              {(() => {
                const s = events.find((e) => e.id === selectedId)?.status;
                const open = s === 'open';
                return (
                  <View style={[styles.badge, open ? styles.badgeOpen : styles.badgeClosed]}>
                    <Text style={[styles.badgeText, open ? styles.badgeOpenText : styles.badgeClosedText]}>{s ?? ''}</Text>
                  </View>
                );
              })()}
            </View>
            <Dropdown
              label="Event"
              value={selectedId}
              options={events.map((event) => ({ label: `${event.name} (${event.status})`, value: event.id }))}
              onChange={setSelectedId}
            />
            <AttendanceRecords
              records={records}
              loading={false}
              canEdit={!isAdmin}
              readOnly={isAdmin}
              compactFilters
              onChanged={loadRecords}
            />
            <View style={styles.liveCard}>
              <Text style={styles.liveTitle}>
                Live Check-ins: {records.length}
              </Text>
              <View style={styles.liveRow}>
                <View style={styles.liveCell}>
                  <Text style={[styles.liveNum, { color: '#10B981' }]}>
                    {records.filter((r) => r.status === 'present').length}
                  </Text>
                  <Text style={styles.liveLabel}>Present</Text>
                </View>
                <View style={styles.liveCell}>
                  <Text style={[styles.liveNum, { color: '#F59E0B' }]}>
                    {records.filter((r) => r.status === 'late').length}
                  </Text>
                  <Text style={styles.liveLabel}>Late</Text>
                </View>
                <View style={styles.liveCell}>
                  <Text style={[styles.liveNum, { color: '#EF4444' }]}>
                    {records.filter((r) => r.status === 'absent').length}
                  </Text>
                  <Text style={styles.liveLabel}>Absent</Text>
                </View>
                <View style={styles.liveCell}>
                  <Text style={[styles.liveNum, { color: '#2A5BD7' }]}>
                    {records.filter((r) => r.status === 'excused').length}
                  </Text>
                  <Text style={styles.liveLabel}>Excused</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#162660', marginBottom: 12, textAlign: 'center' },
  hint: { fontSize: 14, color: '#4A5878', textAlign: 'center', paddingVertical: 24 },
  selectorCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255, 253, 247, 0.88)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)', padding: 14, marginBottom: 10,
  },
  selectorTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#162660' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  badgeOpen: { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.4)' },
  badgeClosed: { backgroundColor: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.35)' },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  badgeOpenText: { color: '#10B981' },
  badgeClosedText: { color: '#EF4444' },
  liveCard: {
    backgroundColor: 'rgba(255, 253, 247, 0.88)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)', padding: 16, marginTop: 4, gap: 10,
  },
  liveTitle: { fontSize: 15, fontWeight: '700', color: '#162660' },
  liveRow: { flexDirection: 'row', gap: 8 },
  liveCell: { flex: 1, alignItems: 'center' },
  liveNum: { fontSize: 20, fontWeight: '700' },
  liveLabel: { fontSize: 11, color: '#4A5878', marginTop: 2 },
});
