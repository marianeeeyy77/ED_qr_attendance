<<<<<<< HEAD
import { StyleSheet, View } from 'react-native';

import AppealsPanel from '@/components/AppealsPanel';
import ScreenTransition from '@/components/ScreenTransition';
import { COLORS } from '@/constants/colors';

/**
 * Appeals route — thin host around the shared AppealsPanel.
 *
 * Kept (hidden from every tab bar) so the student deep link from
 * My Attendance — the "Appeal" button on an absent row — keeps working:
 *   /campus/(tabs)/appeals?eventId=...&attendanceId=...
 * Staff reach the very same panel through the "Appeals" segment on the
 * Monitor tab instead of a dedicated tab.
 */
export default function AppealsScreen() {
  return (
    <View style={styles.container}>
      <ScreenTransition style={styles.flex}>
        <AppealsPanel />
      </ScreenTransition>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
});
=======
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import AnimatedPressable from '@/components/AnimatedPressable';
import { useToast } from '@/components/CampusToast';
import { COLORS, SPACING } from '@/constants/colors';
import { useAuth } from '@/lib/auth';
import {
  listAppealableEvents,
  listOwnAppeals,
  listStaffQueue,
  reviewAppeal,
  submitAppeal,
  type AppealRow,
  type AppealStatus,
  type AppealableEvent,
} from '@/lib/campusqr/appeals';
import {
  useCampusRealtime,
  useRealtimeStatusToast,
} from '@/lib/campusqr/realtime';
import { useCampusRole } from '@/lib/campusqr/roles';

type Filter = 'all' | AppealStatus;

/**
 * Appeals — one appeal per absent student per closed event (spec):
 *   Student → picks ONLY the closed events they were marked Absent for
 *             (live), submits a reason, and tracks their own appeals +
 *             decisions. Entry point: the Appeal button on an absent row
 *             in Attendance history (or this screen directly).
 *   Staff   → reads the queue (admin: every appeal; teacher: their own
 *             events) and Approves (-> Excused) or Declines (stays Absent)
 *             each appeal individually, with an optional note back.
 * Live via the shared realtime channel (appeals + attendance + events).
 */
export default function AppealsScreen() {
  const { user } = useAuth();
  const { role, isStudent } = useCampusRole();
  const toast = useToast();
  const onStatus = useRealtimeStatusToast(toast);
  const params = useLocalSearchParams<{ eventId?: string; attendanceId?: string }>();

  const [filter, setFilter] = useState<Filter>('all');
  const [rows, setRows] = useState<AppealRow[]>([]);
  const [appealable, setAppealable] = useState<AppealableEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  const student = isStudent || role === null;

  const load = useCallback(async () => {
    if (!user?.id) return;
    if (student) {
      setRows(await listOwnAppeals(user.id));
      setAppealable(await listAppealableEvents(user.id));
    } else {
      setRows(await listStaffQueue(user.id, role!));
    }
  }, [user?.id, student, role]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useCampusRealtime(
    (change) => {
      // `events` → a close/reopen changes which absences are appealable
      // (and event names shown beside each appeal).
      if (
        change.table === 'appeals' ||
        change.table === 'attendance' ||
        change.table === 'events'
      ) {
        load();
      }
    },
    onStatus
  );

  // Deep-link preselect: My Attendance -> "Appeal" on an absent row.
  useEffect(() => {
    if (!params.eventId) return;
    if (appealable.some((event) => event.event_id === params.eventId)) {
      setSelectedEvent(params.eventId);
    }
  }, [params.eventId, appealable]);

  const counts = {
    pending: rows.filter((a) => a.status === 'pending').length,
    approved: rows.filter((a) => a.status === 'approved').length,
    rejected: rows.filter((a) => a.status === 'rejected').length,
  };
  const visible = filter === 'all' ? rows : rows.filter((a) => a.status === filter);
  const statusColor = (s: AppealStatus) => (s === 'pending' ? '#F59E0B' : s === 'approved' ? '#10B981' : '#EF4444');

  const handleSubmit = async () => {
    if (!user?.id) return;
    const pick = appealable.find((event) => event.event_id === selectedEvent);
    if (!pick) { toast.error('Choose an absent event first.'); return; }
    if (!reason.trim()) { toast.error('Please explain your appeal.'); return; }
    setSubmitting(true);
    try {
      const { error } = await submitAppeal({
        studentId: user.id,
        eventId: pick.event_id,
        attendanceId: pick.attendance_id,
        reason,
      });
      if (error) { toast.error(error); return; }
      toast.success('Appeal submitted.');
      setReason(''); setSelectedEvent(''); load();
    } finally { setSubmitting(false); }
  };

  const handleReview = (item: AppealRow, approved: boolean) => {
    const note = (feedback[item.id] ?? '').trim();
    Alert.alert(
      approved ? 'Approve appeal' : 'Decline appeal',
      approved
        ? `Mark ${item.student?.full_name ?? 'this student'} as Excused for "${item.event?.name ?? 'this event'}"?`
        : `Keep the Absent mark for ${item.student?.full_name ?? 'this student'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: approved ? 'Approve' : 'Decline',
          style: approved ? 'default' : 'destructive',
          onPress: async () => {
            const { error } = await reviewAppeal(
              item.id,
              approved ? 'approved' : 'rejected',
              note || null,
              item.attendance_id
            );
            if (error) { toast.error(error); return; }
            toast.success(
              approved
                ? 'Appeal approved - record is now Excused.'
                : 'Appeal declined - record stays Absent.'
            );
            load();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appeals</Text>
      {student && (
        <AnimatedPressable style={styles.submit} accessibilityRole="button" accessibilityLabel="Submit New Appeal" onPress={handleSubmit} disabled={submitting} glowColor={COLORS.primary}>
          <Text style={styles.submitText}>{submitting ? 'Submitting...' : '+ Submit New Appeal'}</Text>
        </AnimatedPressable>
      )}
      {student && (
        <View style={styles.formCard}>
          <Text style={styles.formLabel}>Absent event</Text>
          {appealable.length === 0 ? (
            <Text style={styles.emptyHint}>
              You have no absent records to appeal. Only closed events where
              you were marked Absent can be appealed — once per event.
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.eventRow}>
              {appealable.map((event) => (
                <AnimatedPressable key={event.event_id} style={[styles.eventChip, selectedEvent === event.event_id && styles.eventChipActive]} onPress={() => setSelectedEvent(event.event_id)} accessibilityRole="button" accessibilityLabel={event.name} glowColor={COLORS.accent}>
                  <Text style={[styles.eventChipText, selectedEvent === event.event_id && styles.eventChipTextActive]} numberOfLines={1}>{event.name}</Text>
                </AnimatedPressable>
              ))}
            </ScrollView>
          )}
          <Text style={styles.formLabel}>Explanation</Text>
          <TextInput
            style={styles.reasonInput}
            value={reason}
            onChangeText={setReason}
            placeholder="Why were you marked absent in error?"
            placeholderTextColor="#64748B"
            multiline
          />
        </View>
      )}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>{counts.pending}</Text>
          <Text style={styles.statLabel} numberOfLines={1}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>{counts.approved}</Text>
          <Text style={styles.statLabel} numberOfLines={1}>Approved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>{counts.rejected}</Text>
          <Text style={styles.statLabel} numberOfLines={1}>Rejected</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
        {(['all', 'pending', 'approved', 'rejected'] as Filter[]).map((option) => {
          const active = filter === option;
          const glow = option === 'pending' ? '#F59E0B' : option === 'approved' ? '#10B981' : option === 'rejected' ? '#EF4444' : '#162660';
          return (
            <AnimatedPressable key={option} style={[styles.pill, active && { backgroundColor: glow, borderColor: glow }]} onPress={() => setFilter(option)} accessibilityRole="button" accessibilityLabel={option} glowColor={glow}>
              <Text style={[styles.pillText, active && styles.pillTextActive]}>{option === 'all' ? 'All' : option}</Text>
            </AnimatedPressable>
          );
        })}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {visible.length === 0 && (
          <Text style={styles.emptyHint}>
            {student
              ? 'Your submitted appeals will appear here.'
              : 'No appeals match this filter.'}
          </Text>
        )}
        {visible.map((item) => {
          const color = statusColor(item.status);
          return (
            <View key={item.id} style={styles.appealCard}>
              <View style={styles.appealHeader}>
                <Text style={styles.appealTitle}>{item.event?.name ?? 'Event'}</Text>
                <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: `${color}55` }]}>
                  <Text style={[styles.badgeText, { color }]}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.appealMeta}>
                {(item.student ? `${item.student.full_name} • ` : '')}{item.reason}
              </Text>
              {item.feedback ? (
                <View style={styles.feedback}>
                  <Text style={styles.feedbackLabel}>Staff Feedback</Text>
                  <Text style={styles.feedbackText}>{item.feedback}</Text>
                </View>
              ) : null}
              {!student && item.status === 'pending' && (
                <View style={styles.reviewBox}>
                  <TextInput
                    style={styles.feedbackInput}
                    value={feedback[item.id] ?? ''}
                    onChangeText={(v) => setFeedback((p) => ({ ...p, [item.id]: v }))}
                    placeholder="Optional note back to student..."
                    placeholderTextColor="#64748B"
                  />
                  <View style={styles.reviewRow}>
                    <AnimatedPressable style={[styles.reviewBtn, styles.acceptBtn]} onPress={() => handleReview(item, true)} accessibilityRole="button" accessibilityLabel="Approve appeal" glowColor={COLORS.success}>
                      <Text style={styles.reviewText}>Approve</Text>
                    </AnimatedPressable>
                    <AnimatedPressable style={[styles.reviewBtn, styles.rejectBtn]} onPress={() => handleReview(item, false)} accessibilityRole="button" accessibilityLabel="Decline appeal" glowColor={COLORS.danger}>
                      <Text style={styles.reviewText}>Decline</Text>
                    </AnimatedPressable>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  title: { fontSize: 22, fontWeight: '700', color: '#162660', textAlign: 'center', paddingTop: 12, paddingBottom: 8 },
  submit: { backgroundColor: '#162660', borderRadius: 12, marginHorizontal: 16, paddingVertical: 14, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginVertical: 16 },
  statCard: { flex: 1, backgroundColor: 'rgba(255, 253, 247, 0.88)', borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)', borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#162660' },
  statLabel: { fontSize: 11, color: '#4A5878', marginTop: 2, textTransform: 'capitalize' },
  pills: { paddingHorizontal: 16, gap: 8, marginBottom: 20 },
  pill: { minHeight: 40, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 999, backgroundColor: 'rgba(255, 253, 247, 0.88)', borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)' },
  pillText: { fontSize: 13, fontWeight: '600', color: '#4A5878', textTransform: 'capitalize' },
  pillTextActive: { color: '#FFFFFF' },
  list: { paddingHorizontal: 16, paddingTop: SPACING.listTop, paddingBottom: 40, gap: 10, flexGrow: 1, justifyContent: 'flex-start' },
  appealCard: { backgroundColor: 'rgba(22, 38, 96, 0.06)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)', padding: 12 },
  appealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  appealTitle: { fontSize: 15, fontWeight: '700', color: '#162660', flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  appealMeta: { fontSize: 12, color: '#4A5878', marginTop: 4 },
  feedback: { marginTop: 8, backgroundColor: 'rgba(22, 38, 96, 0.06)', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.08)' },
  feedbackLabel: { fontSize: 11, fontWeight: '700', color: '#3A4A6B', marginBottom: 2 },
  feedbackText: { fontSize: 13, color: '#4A5878', lineHeight: 18 },
  formCard: {
    backgroundColor: 'rgba(255, 253, 247, 0.88)', borderRadius: 16, marginHorizontal: 16,
    marginTop: 10, padding: 12, borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)',
  },
  formLabel: { fontSize: 12, fontWeight: '700', color: '#3A4A6B', marginTop: 6, marginBottom: 6 },
  emptyHint: { fontSize: 13, color: '#4A5878', lineHeight: 18, paddingVertical: 6 },
  eventRow: { flexDirection: 'row', gap: 8, paddingRight: 8 },
  eventChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.16)', backgroundColor: 'rgba(22, 38, 96, 0.06)',
  },
  eventChipActive: { backgroundColor: '#162660', borderColor: '#162660' },
  eventChipText: { fontSize: 13, fontWeight: '600', color: '#4A5878', maxWidth: 160 },
  eventChipTextActive: { color: '#FFFFFF' },
  reasonInput: {
    backgroundColor: 'rgba(255, 253, 247, 0.88)', borderRadius: 12, minHeight: 72,
    borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)',
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#162660', textAlignVertical: 'top',
  },
  reviewBox: { marginTop: 10, gap: 8 },
  feedbackInput: {
    backgroundColor: 'rgba(255, 253, 247, 0.88)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)',
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#162660',
  },
  reviewRow: { flexDirection: 'row', gap: 8 },
  reviewBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  acceptBtn: { backgroundColor: '#10B981' },
  rejectBtn: { backgroundColor: 'rgba(239,68,68,0.85)' },
  reviewText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
>>>>>>> ff02c248d1985765a235f26c5ed5a386e60bd1b5
