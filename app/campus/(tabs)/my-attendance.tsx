import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';

import StatusPill, { attendanceStatusTone } from '@/components/StatusPill';
import ScreenSheet from '@/components/ScreenSheet';
import ScreenTransition from '@/components/ScreenTransition';
import { useToast } from '@/components/CampusToast';
import { COLORS, NEUMO } from '@/constants/colors';
import { useAuth } from '@/lib/auth';
import { fetchOwnHistory, type OwnAttendanceRecord } from '@/lib/campusqr/attendance';
import { formatDateTime } from '@/lib/campusqr/format';
import {
  useCampusRealtime,
  useRealtimeStatusToast,
} from '@/lib/campusqr/realtime';

/**
 * My Attendance — the signed-in student's own check-in history
 * (spec Phase 5). Live-refreshes via the shared realtime channel
 * with echo suppression right after a local mutation.
 */
export default function MyAttendanceScreen() {
  const { user } = useAuth();
  const toast = useToast();
  const onStatus = useRealtimeStatusToast(toast);
  const [records, setRecords] = useState<OwnAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const present = records.filter((r) => r.status === 'present').length;
  const late = records.filter((r) => r.status === 'late').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const excused = records.filter((r) => r.status === 'excused').length;
  const total = records.length;
  const rate = total > 0 ? Math.round(((present + late + excused) / total) * 100) : 0;

  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    const rows = await fetchOwnHistory(user.id);
    setRecords(rows);
    setLoading(false);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useCampusRealtime(
    (change) => {
      // `attendance` → own check-in / auto-absent flips.
      // `events` → a teacher closing an event creates the absent row AND
      //   flips the event to closed.
      if (change.table === 'attendance' || change.table === 'events') {
        load();
      }
    },
    onStatus
  );

  return (
    <View style={styles.container}>
      <ScreenSheet>
      <ScreenTransition style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>My Attendance</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>{present}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>{late}</Text>
            <Text style={styles.statLabel}>Late</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>{absent}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#34D399' }]}>{rate}%</Text>
            <Text style={styles.statLabel}>Rate</Text>
          </View>
        </View>
        {loading ? (
          <Text style={styles.hint}>Loading your records...</Text>
        ) : records.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="checkmark-circle-outline" size={44} color="#3B82F6" />
            </View>
            <Text style={styles.emptyTitle}>You have no attendance records yet</Text>
            <Text style={styles.emptySub}>Scan an event QR code to record your first check-in</Text>
          </View>
        ) : (
          records.map((row) => (
            <View key={row.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.eventName}>{row.event?.name ?? 'Event'}</Text>
                <StatusPill label={row.status} tone={attendanceStatusTone(row.status)} />
              </View>
              <Text style={styles.meta}>{formatDateTime(row.recorded_at)}</Text>
            </View>
          ))
        )}
      </ScrollView>
      </ScreenTransition>
      </ScreenSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 12 },
  title: { fontSize: 22, fontWeight: '700', color: NEUMO.title, marginBottom: 12, textAlign: 'center', paddingTop: 12 },
  hint: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingVertical: 24 },
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statCard: {
    flex: 1, backgroundColor: NEUMO.surface, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(17, 17, 17, 0.06)', borderTopColor: NEUMO.highlight,
    paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  statLabel: { fontSize: 11, color: '#334155', textAlign: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  emptyCard: {
    backgroundColor: NEUMO.surface, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(17, 17, 17, 0.06)', borderTopColor: NEUMO.highlight,
    padding: 28, alignItems: 'center',
  },
  emptyIcon: {
    width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(56,189,248,0.12)', borderWidth: 1, borderColor: 'rgba(56,189,248,0.35)',
    marginBottom: 14,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: NEUMO.title, textAlign: 'center', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#334155', textAlign: 'center', lineHeight: 19 },
  card: {
    backgroundColor: NEUMO.surface, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(17, 17, 17, 0.06)', borderTopColor: NEUMO.highlight,
    padding: 16, marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 },
  eventName: { fontSize: 16, fontWeight: '700', color: NEUMO.title, flex: 1 },
  meta: { fontSize: 13, color: '#334155' },
});
