import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

<<<<<<< HEAD
import AnimatedPressable from '@/components/AnimatedPressable';
import AppealsPanel from '@/components/AppealsPanel';
import AttendanceRecords from '@/components/AttendanceRecords';
import Dropdown from '@/components/Dropdown';
import EmptyState from '@/components/EmptyState';
import LockedView from '@/components/LockedView';
import ScreenTransition from '@/components/ScreenTransition';
=======
import AttendanceRecords from '@/components/AttendanceRecords';
import Dropdown from '@/components/Dropdown';
import LockedView from '@/components/LockedView';
>>>>>>> ff02c248d1985765a235f26c5ed5a386e60bd1b5
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
<<<<<<< HEAD
  // Monitor | Appeals segment — "Appeals" renders the shared AppealsPanel
  // (staff review queue) that previously lived in its own tab.
  const [section, setSection] = useState<'monitor' | 'appeals'>('monitor');
=======
>>>>>>> ff02c248d1985765a235f26c5ed5a386e60bd1b5

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
<<<<<<< HEAD
      <ScreenTransition style={styles.flex}>
        <Text style={styles.title}>{isAdmin ? 'Overall Attendance' : 'Monitor Attendance'}</Text>
        
        {/* Balanced 50/50 Segment Control Wrapper */}
        <View style={styles.segment}>
          <AnimatedPressable
            style={[styles.segBtn, section === 'monitor' && styles.segActive]}
            outerStyle={styles.segOuterBtn}
            onPress={() => setSection('monitor')}
            accessibilityRole="button"
            accessibilityLabel="Monitor attendance"
          >
            <Text style={[styles.segText, section === 'monitor' && styles.segTextActive]}>Monitor</Text>
          </AnimatedPressable>

          <AnimatedPressable
            style={[styles.segBtn, section === 'appeals' && styles.segActive]}
            outerStyle={styles.segOuterBtn}
            onPress={() => setSection('appeals')}
            accessibilityRole="button"
            accessibilityLabel="Appeals queue"
          >
            <Text style={[styles.segText, section === 'appeals' && styles.segTextActive]}>Appeals</Text>
          </AnimatedPressable>
        </View>

        {section === 'appeals' ? (
          <AppealsPanel showTitle={false} />
        ) : loading ? (
          <View style={styles.emptyArea}>
            <Text style={styles.hint}>Loading events...</Text>
          </View>
        ) : events.length === 0 ? (
          <View style={styles.emptyArea}>
            <EmptyState
              icon="people-outline"
              title="No events to monitor yet."
              message="Create an event to start tracking attendance and check-ins."
            />
          </View>
        ) : (
          <ScrollView style={styles.flex} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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
                    <Text style={[styles.liveNum, { color: '#5098C3' }]}>
                      {records.filter((r) => r.status === 'excused').length}
                    </Text>
                    <Text style={styles.liveLabel}>Excused</Text>
                  </View>
                </View>
              </View>
            </>
          </ScrollView>
        )}
      </ScreenTransition>
=======
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
>>>>>>> ff02c248d1985765a235f26c5ed5a386e60bd1b5
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
<<<<<<< HEAD
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#10367D', paddingTop: 12, marginBottom: 8, textAlign: 'center' },
  
  // Segment Container
  segment: {
    flexDirection: 'row',
    backgroundColor: 'rgba(235, 235, 235, 0.88)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 54, 125, 0.18)',
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  
  // Outer pressable container guarantees equal 50/50 flex column split
  segOuterBtn: {
    flex: 1,
  },
  
  // Inner button styles stretch to 100% of the half provided by segOuterBtn
  segBtn: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    borderRadius: 10,
  },
  
  segActive: { backgroundColor: '#10367D' },
  segText: { fontSize: 14, fontWeight: '600', color: '#4A5878' },
  segTextActive: { color: '#FFFFFF', fontWeight: '700' },
  
  hint: { fontSize: 14, color: '#4A5878', textAlign: 'center', paddingVertical: 24 },
  emptyArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingBottom: 48 },
  selectorCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(235, 235, 235, 0.88)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(16, 54, 125, 0.18)', padding: 16, marginBottom: 12,
  },
  selectorTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#10367D' },
=======
  scroll: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#162660', marginBottom: 12, textAlign: 'center' },
  hint: { fontSize: 14, color: '#4A5878', textAlign: 'center', paddingVertical: 24 },
  selectorCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255, 253, 247, 0.88)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)', padding: 14, marginBottom: 10,
  },
  selectorTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#162660' },
>>>>>>> ff02c248d1985765a235f26c5ed5a386e60bd1b5
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  badgeOpen: { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.4)' },
  badgeClosed: { backgroundColor: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.35)' },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  badgeOpenText: { color: '#10B981' },
  badgeClosedText: { color: '#EF4444' },
  liveCard: {
<<<<<<< HEAD
    backgroundColor: 'rgba(235, 235, 235, 0.88)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(16, 54, 125, 0.18)', padding: 16, marginTop: 12, gap: 12,
  },
  liveTitle: { fontSize: 15, fontWeight: '700', color: '#10367D' },
=======
    backgroundColor: 'rgba(255, 253, 247, 0.88)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)', padding: 16, marginTop: 4, gap: 10,
  },
  liveTitle: { fontSize: 15, fontWeight: '700', color: '#162660' },
>>>>>>> ff02c248d1985765a235f26c5ed5a386e60bd1b5
  liveRow: { flexDirection: 'row', gap: 8 },
  liveCell: { flex: 1, alignItems: 'center' },
  liveNum: { fontSize: 20, fontWeight: '700' },
  liveLabel: { fontSize: 11, color: '#4A5878', marginTop: 2 },
<<<<<<< HEAD
});
=======
});
>>>>>>> ff02c248d1985765a235f26c5ed5a386e60bd1b5
