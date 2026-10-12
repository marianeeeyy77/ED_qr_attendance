import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';

import StatusPill, { attendanceStatusTone } from '@/components/StatusPill';
import AnimatedPressable from '@/components/AnimatedPressable';
import { useToast } from '@/components/CampusToast';
import { COLORS } from '@/constants/colors';
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
  const router = useRouter();
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
      if (change.table === 'attendance') load();
    },
    onStatus
  );

  return (
    <View style={styles.container}>
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
              <Ionicons name="checkmark-circle-outline" size={44} color="#2A5BD7" />
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
              {(row.status === 'absent' || row.status === 'late') && (
                <AnimatedPressable
                  style={styles.appealBtn}
                  onPress={() => router.push('/campus/(tabs)/appeals')}
                  accessibilityRole="button"
                  accessibilityLabel="Appeal this record"
                >
                  <Ionicons name="mail-outline" size={16} color="#162660" />
                  <Text style={styles.appealText}>Appeal</Text>
                </AnimatedPressable>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#162660', marginBottom: 12, textAlign: 'center', paddingTop: 12 },
  hint: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingVertical: 24 },
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statCard: {
    flex: 1, backgroundColor: 'rgba(255, 253, 247, 0.88)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)',
    paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  statLabel: { fontSize: 11, color: '#4A5878', textAlign: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  emptyCard: {
    backgroundColor: 'rgba(255, 253, 247, 0.88)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)',
    padding: 28, alignItems: 'center',
  },
  emptyIcon: {
    width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(56,189,248,0.12)', borderWidth: 1, borderColor: 'rgba(56,189,248,0.35)',
    marginBottom: 14,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#162660', textAlign: 'center', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#4A5878', textAlign: 'center', lineHeight: 19 },
  card: {
    backgroundColor: 'rgba(255, 253, 247, 0.88)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)',
    padding: 16, marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 },
  eventName: { fontSize: 16, fontWeight: '700', color: '#162660', flex: 1 },
  meta: { fontSize: 13, color: '#4A5878' },
  appealBtn: {
    marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.4)',
    backgroundColor: 'rgba(22, 38, 96, 0.06)',
  },
  appealText: { fontSize: 14, fontWeight: '700', color: '#162660' },
});
