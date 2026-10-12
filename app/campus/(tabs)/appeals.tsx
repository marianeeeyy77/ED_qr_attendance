import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import AnimatedPressable from '@/components/AnimatedPressable';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/lib/auth';
import {
  listOwnAppeals,
  listTeacherQueue,
  reviewAppeal,
  submitAppeal,
  type AppealRow,
  type AppealStatus,
} from '@/lib/campusqr/appeals';
import { updateAttendance } from '@/lib/campusqr/attendance';
import { listVisibleEvents } from '@/lib/campusqr/events';
import { useToast } from '@/components/CampusToast';
import { useCampusRole } from '@/lib/campusqr/roles';
import type { EventRow } from '@/types/database';
type Filter = 'all' | AppealStatus;
export default function AppealsScreen() {
  const { user } = useAuth();
  const { role, isStudent } = useCampusRole();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>('all');
  const [rows, setRows] = useState<AppealRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const load = useCallback(async () => {
    if (!user?.id) return;
    if (isStudent || role === null) {
      setRows(await listOwnAppeals(user.id));
      setEvents(await listVisibleEvents('student', user.id));
    } else {
      setRows(await listTeacherQueue(user.id));
    }
  }, [user?.id, isStudent, role]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const counts = {
    pending: rows.filter((a) => a.status === 'pending').length,
    approved: rows.filter((a) => a.status === 'approved').length,
    rejected: rows.filter((a) => a.status === 'rejected').length,
  };
  const visible = filter === 'all' ? rows : rows.filter((a) => a.status === filter);
  const statusColor = (s: AppealStatus) => (s === 'pending' ? '#F59E0B' : s === 'approved' ? '#10B981' : '#EF4444');
  const handleSubmit = async () => {
    if (!user?.id) return;
    if (!selectedEvent) { toast.error('Choose an event first.'); return; }
    if (!reason.trim()) { toast.error('Please explain your appeal.'); return; }
    setSubmitting(true);
    try {
      const { error } = await submitAppeal({ studentId: user.id, eventId: selectedEvent, reason });
      if (error) { toast.error(error); return; }
      toast.success('Appeal submitted.');
      setReason(''); setSelectedEvent(''); load();
    } finally { setSubmitting(false); }
  };
  const handleReview = (item: AppealRow, approved: boolean) => {
    const note = (feedback[item.id] ?? '').trim();
    Alert.alert(
      approved ? 'Accept appeal' : 'Reject appeal',
      approved
        ? `Convert ${item.student?.full_name ?? 'student'} to Excused?`
        : `Keep the original mark for ${item.student?.full_name ?? 'student'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: approved ? 'Accept' : 'Reject', style: approved ? 'default' : 'destructive',
          onPress: async () => {
            const { error } = await reviewAppeal(item.id, approved ? 'approved' : 'rejected', note || null);
            if (error) { toast.error(error); return; }
            if (approved && item.attendance_id) {
              const { error: attError } = await updateAttendance(item.attendance_id, 'excused');
              if (attError) { toast.error(attError); return; }
            }
            toast.success(approved ? 'Appeal accepted — marked Excused.' : 'Appeal rejected.');
            load();
          },
        },
      ]
    );
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appeals</Text>
      <AnimatedPressable style={styles.submit} accessibilityRole="button" accessibilityLabel="Submit New Appeal" onPress={isStudent || role === null ? handleSubmit : undefined} disabled={submitting} glowColor={COLORS.primary}>
        <Text style={styles.submitText}>{submitting ? 'Submitting...' : '+ Submit New Appeal'}</Text>
      </AnimatedPressable>
      {(isStudent || role === null) && (
        <View style={styles.formCard}>
          <Text style={styles.formLabel}>Event</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.eventRow}>
            {events.map((e) => (
              <AnimatedPressable key={e.id} style={[styles.eventChip, selectedEvent === e.id && styles.eventChipActive]} onPress={() => setSelectedEvent(e.id)} accessibilityRole="button" accessibilityLabel={e.name} glowColor={COLORS.accent}>
                <Text style={[styles.eventChipText, selectedEvent === e.id && styles.eventChipTextActive]} numberOfLines={1}>{e.name}</Text>
              </AnimatedPressable>
            ))}
          </ScrollView>
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
      <View style={styles.box}>
        <ScrollView style={styles.boxList} contentContainerStyle={styles.boxListContent} showsVerticalScrollIndicator={false}>
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
                    <Text style={styles.feedbackLabel}>Teacher Feedback</Text>
                    <Text style={styles.feedbackText}>{item.feedback}</Text>
                  </View>
                ) : null}
                {!isStudent && item.status === 'pending' && (
                  <View style={styles.reviewBox}>
                    <TextInput
                      style={styles.feedbackInput}
                      value={feedback[item.id] ?? ''}
                      onChangeText={(v) => setFeedback((p) => ({ ...p, [item.id]: v }))}
                      placeholder="Optional note back to student..."
                      placeholderTextColor="#64748B"
                    />
                    <View style={styles.reviewRow}>
                      <AnimatedPressable style={[styles.reviewBtn, styles.acceptBtn]} onPress={() => handleReview(item, true)} accessibilityRole="button" accessibilityLabel="Accept appeal" glowColor={COLORS.success}>
                        <Text style={styles.reviewText}>Accept</Text>
                      </AnimatedPressable>
                      <AnimatedPressable style={[styles.reviewBtn, styles.rejectBtn]} onPress={() => handleReview(item, false)} accessibilityRole="button" accessibilityLabel="Reject appeal" glowColor={COLORS.danger}>
                        <Text style={styles.reviewText}>Reject</Text>
                      </AnimatedPressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  title: { fontSize: 22, fontWeight: '700', color: '#162660', textAlign: 'center', paddingTop: 12, paddingBottom: 8 },
  submit: { backgroundColor: '#162660', borderRadius: 12, marginHorizontal: 16, paddingVertical: 14, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginVertical: 16 },
  statCard: { flex: 1, backgroundColor: 'rgba(255, 253, 247, 0.88)', borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)', borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#162660' },
  statLabel: { fontSize: 11, color: '#4A5878', marginTop: 2, textTransform: 'capitalize' },
  pills: { paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  pill: { minHeight: 40, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 999, backgroundColor: 'rgba(255, 253, 247, 0.88)', borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)' },
  pillText: { fontSize: 13, fontWeight: '600', color: '#4A5878', textTransform: 'capitalize' },
  pillTextActive: { color: '#FFFFFF' },
  box: { backgroundColor: 'rgba(255, 253, 247, 0.88)', borderRadius: 16, marginHorizontal: 16, padding: 12, borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)', maxHeight: 320, marginBottom: 24 },
  boxList: { maxHeight: 296 },
  boxListContent: { gap: 10 },
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
