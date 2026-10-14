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

export default function AppealsPanel({ showTitle = true }: { showTitle?: boolean } = {}) {
  const { user } = useAuth();
  const { role, isStudent, isStaff, loading: roleLoading } = useCampusRole();
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

  const canSubmit = !roleLoading && (isStudent || role === null);
  const canReview = !roleLoading && isStaff;

  const load = useCallback(async () => {
    if (!user?.id || roleLoading) return;
    if (canSubmit) {
      setRows(await listOwnAppeals(user.id));
      setAppealable(await listAppealableEvents(user.id));
    } else if (isStaff) {
      setRows(await listStaffQueue(user.id, role!));
    }
  }, [user?.id, roleLoading, canSubmit, isStaff, role]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useCampusRealtime(
    (change) => {
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
      {showTitle ? <Text style={styles.title}>Appeals</Text> : null}
      {canSubmit && (
        <AnimatedPressable style={styles.submit} accessibilityRole="button" accessibilityLabel="Submit New Appeal" onPress={handleSubmit} disabled={submitting} glowColor={COLORS.primary}>
          <Text style={styles.submitText}>{submitting ? 'Submitting...' : '+ Submit New Appeal'}</Text>
        </AnimatedPressable>
      )}
      {canSubmit && (
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

      {/* Tightly grouped metrics & filters container */}
      <View style={styles.filterSection}>
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

        {/* Horizontal Scrollable Filter Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
          {(['all', 'pending', 'approved', 'rejected'] as Filter[]).map((option) => {
            const active = filter === option;
            const glow = option === 'pending' ? '#F59E0B' : option === 'approved' ? '#10B981' : option === 'rejected' ? '#EF4444' : '#10367D';
            return (
              <AnimatedPressable key={option} style={[styles.pill, active && { backgroundColor: glow, borderColor: glow }]} onPress={() => setFilter(option)} accessibilityRole="button" accessibilityLabel={option} glowColor={glow}>
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{option === 'all' ? 'All' : option}</Text>
              </AnimatedPressable>
            );
          })}
        </ScrollView>
      </View>

      {visible.length === 0 ? (
        <View style={styles.emptyArea}>
          <Text style={[styles.emptyHint, styles.listEmpty]}>
            {canSubmit
              ? 'Your submitted appeals will appear here.'
              : 'No appeals match this filter.'}
          </Text>
        </View>
      ) : (
      <ScrollView style={styles.flex} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
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
                {(item.student ? `${item.student.full_name}` : '')}{item.reason}
              </Text>
              {item.feedback ? (
                <View style={styles.feedback}>
                  <Text style={styles.feedbackLabel}>Staff Feedback</Text>
                  <Text style={styles.feedbackText}>{item.feedback}</Text>
                </View>
              ) : null}
              {canReview && item.status === 'pending' && (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  title: { fontSize: 22, fontWeight: '700', color: '#10367D', textAlign: 'center', paddingTop: 12, paddingBottom: 8 },
  submit: { backgroundColor: '#10367D', borderRadius: 12, marginHorizontal: 16, paddingVertical: 14, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  
  filterSection: { marginTop: 6 },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  statCard: { flex: 1, backgroundColor: 'rgba(235, 235, 235, 0.88)', borderWidth: 1, borderColor: 'rgba(16, 54, 125, 0.18)', borderRadius: 16, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#10367D' },
  statLabel: { fontSize: 11, color: '#4A5878', marginTop: 2, textTransform: 'capitalize' },
  
  pills: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 4, alignItems: 'center' },
  pill: { minHeight: 40, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 999, backgroundColor: 'rgba(235, 235, 235, 0.88)', borderWidth: 1, borderColor: 'rgba(16, 54, 125, 0.18)' },
  pillText: { fontSize: 13, fontWeight: '600', color: '#4A5878', textTransform: 'capitalize' },
  pillTextActive: { color: '#FFFFFF' },

  list: { paddingHorizontal: 16, paddingTop: SPACING.listTop, paddingBottom: 24, gap: 12 },
  appealCard: { backgroundColor: 'rgba(16, 54, 125, 0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(16, 54, 125, 0.18)', padding: 16 },
  appealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  appealTitle: { fontSize: 15, fontWeight: '700', color: '#10367D', flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  appealMeta: { fontSize: 12, color: '#4A5878', marginTop: 6 },
  feedback: { marginTop: 8, backgroundColor: 'rgba(16, 54, 125, 0.06)', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: 'rgba(16, 54, 125, 0.08)' },
  feedbackLabel: { fontSize: 11, fontWeight: '700', color: '#3A4A6B', marginBottom: 2 },
  feedbackText: { fontSize: 13, color: '#4A5878', lineHeight: 18 },
  formCard: {
    backgroundColor: 'rgba(235, 235, 235, 0.88)', borderRadius: 16, marginHorizontal: 16,
    marginTop: 10, padding: 16, borderWidth: 1, borderColor: 'rgba(16, 54, 125, 0.18)',
  },
  formLabel: { fontSize: 12, fontWeight: '700', color: '#3A4A6B', marginTop: 6, marginBottom: 6 },
  emptyHint: { fontSize: 13, color: '#4A5878', lineHeight: 18, paddingVertical: 6 },
  listEmpty: { textAlign: 'center' },
  
  emptyArea: { paddingVertical: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  
  eventRow: { flexDirection: 'row', gap: 8, paddingRight: 8 },
  eventChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: 'rgba(16, 54, 125, 0.16)', backgroundColor: 'rgba(16, 54, 125, 0.06)',
  },
  eventChipActive: { backgroundColor: '#10367D', borderColor: '#10367D' },
  eventChipText: { fontSize: 13, fontWeight: '600', color: '#4A5878', maxWidth: 160 },
  eventChipTextActive: { color: '#FFFFFF' },
  reasonInput: {
    backgroundColor: 'rgba(235, 235, 235, 0.88)', borderRadius: 12, minHeight: 72,
    borderWidth: 1, borderColor: 'rgba(16, 54, 125, 0.18)',
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#10367D', textAlignVertical: 'top',
  },
  reviewBox: { marginTop: 12, gap: 10 },
  feedbackInput: {
    backgroundColor: 'rgba(235, 235, 235, 0.88)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(16, 54, 125, 0.18)',
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#10367D',
    minHeight: 44,
  },
  reviewRow: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 4,
  },
  reviewBtn: { 
    flex: 1, 
    height: 46, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  acceptBtn: { backgroundColor: '#10B981' },
  rejectBtn: { backgroundColor: '#DC2626' },
  reviewText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, textAlign: 'center' },
});