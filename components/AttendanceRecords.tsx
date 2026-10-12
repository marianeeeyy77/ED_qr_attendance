import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import AnimatedPressable from '@/components/AnimatedPressable';
import Dropdown, { type DropdownOption } from '@/components/Dropdown';
import { useToast } from '@/components/CampusToast';
import { COLORS } from '@/constants/colors';
import {
  deleteAttendance,
  updateAttendance,
  type EventAttendanceRecord,
} from '@/lib/campusqr/attendance';
import { formatDateTime } from '@/lib/campusqr/format';
import type { AttendanceStatus } from '@/types/database';

export const ATTENDANCE_FILTERS = ['all', 'present', 'late', 'absent', 'excused'] as const;
export type AttendanceFilter = (typeof ATTENDANCE_FILTERS)[number];

const STATUS_EDIT_OPTIONS: DropdownOption[] = [
  { label: 'Present', value: 'present' },
  { label: 'Late', value: 'late' },
  { label: 'Absent', value: 'absent' },
  { label: 'Excused', value: 'excused' },
];

type Props = {
  records: EventAttendanceRecord[];
  loading: boolean;
  /** Set for owners/admins — enables per-row status edit + delete. */
  canEdit?: boolean;
  onChanged?: () => void;
  /** Admin read-only monitor: hides edit controls entirely. */
  readOnly?: boolean;
  /** Admin override tool: full-word status buttons + reason + save. */
  overrideMode?: boolean;
  /** Compact single-row horizontal pills (no wrap). */
  compactFilters?: boolean;
};

/**
 * Shared attendance records list (Phase 5): status pills, status/keyword
 * filters, and per-row Correct Records actions (update status / delete)
 * with re-read verification surfaced through the data layer.
 */
export default function AttendanceRecords({ records, loading, canEdit = false, onChanged, readOnly = false, overrideMode = false, compactFilters = false }: Props) {
  const toast = useToast();
  const [filter, setFilter] = useState<AttendanceFilter>('all');
  const [keyword, setKeyword] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<Record<string, AttendanceStatus>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});

  const visible = records.filter((row) => {
    if (filter !== 'all' && row.status !== filter) return false;
    const key = keyword.trim().toLowerCase();
    if (!key) return true;
    const hay = [row.student?.full_name ?? '', row.student?.email ?? '', row.student?.student_no ?? '']
      .join(' ').toLowerCase();
    return hay.includes(key);
  });

  const handleStatusChange = async (id: string, status: AttendanceStatus) => {
    setBusyId(id);
    try {
      const { error } = await updateAttendance(id, status);
      if (error) {
        toast.error(error);
        return;
      }
      toast.success('Attendance updated.');
      onChanged?.();
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = (row: EventAttendanceRecord) => {
    Alert.alert(
      'Delete record',
      `Remove ${row.student?.full_name ?? 'this student'}'s attendance record? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setBusyId(row.id);
            try {
              const { error } = await deleteAttendance(row.id);
              if (error) {
                toast.error(error);
                return;
              }
              toast.success('Record deleted.');
              onChanged?.();
            } finally {
              setBusyId(null);
            }
          },
        },
      ]
    );
  };

  const statusColor = (s: string) =>
    s === 'present' ? '#10B981' : s === 'late' ? '#F59E0B' : s === 'absent' ? '#EF4444' : s === 'excused' ? '#2A5BD7' : '#4A5878';

  if (loading) {
    return <Text style={styles.hint}>Loading records...</Text>;
  }

  const editable = canEdit && !readOnly && !overrideMode;

  const pills = (
    <View style={compactFilters ? styles.filterRowSingle : styles.filterRow}>
      {ATTENDANCE_FILTERS.map((option) => {
        const active = filter === option;
        return (
          <AnimatedPressable
            key={option}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => setFilter(option)}
            accessibilityRole="button"
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{option}</Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );

  return (
    <View>
      {compactFilters ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRowSingle}>
          {ATTENDANCE_FILTERS.map((option) => {
            const active = filter === option;
            return (
              <AnimatedPressable
                key={option}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setFilter(option)}
                accessibilityRole="button"
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{option}</Text>
              </AnimatedPressable>
            );
          })}
        </ScrollView>
      ) : pills}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color="#4A5878" />
        <TextInput
          style={styles.searchInput}
          value={keyword}
          onChangeText={setKeyword}
          placeholder="Search name, email, student no..."
          placeholderTextColor="#4A5878"
        />
      </View>
      {visible.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="list-outline" size={40} color="#4A5878" />
          <Text style={styles.emptyTitle}>No attendance records yet.</Text>
          <Text style={styles.emptySub}>Records will appear here once students check in.</Text>
        </View>
      ) : (
        visible.map((row) => (
          <View key={row.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{row.student?.full_name ?? 'Unknown student'}</Text>
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor(row.status)}22`, borderColor: `${statusColor(row.status)}55` }]}>
                <Text style={[styles.statusText, { color: statusColor(row.status) }]}>{row.status}</Text>
              </View>
            </View>
            <Text style={styles.meta}>
              {[row.student?.student_no, row.student?.email].filter(Boolean).join('  •  ')}
            </Text>
            <Text style={styles.meta}>{formatDateTime(row.recorded_at)}</Text>
            {overrideMode ? (
              <View style={styles.overrideBox}>
                <Text style={styles.overrideLabel}>Override Status</Text>
                <View style={styles.overrideRow}>
                  {(['present', 'absent', 'late', 'excused'] as AttendanceStatus[]).map((s) => {
                    const selected = (pendingStatus[row.id] ?? row.status) === s;
                    return (
                      <AnimatedPressable
                        key={s}
                        style={[styles.overrideBtn, selected && { borderColor: statusColor(s), backgroundColor: `${statusColor(s)}22` }]}
                        onPress={() => setPendingStatus((p) => ({ ...p, [row.id]: s }))}
                        glowColor={statusColor(s)}
                        accessibilityRole="button"
                        accessibilityLabel={s}
                      >
                        <Text style={[styles.overrideText, { color: statusColor(s) }]}>{s === 'present' ? 'Present' : s === 'absent' ? 'Absent' : s === 'late' ? 'Late' : 'Excused'}</Text>
                      </AnimatedPressable>
                    );
                  })}
                </View>
                <TextInput
                  style={styles.reasonInput}
                  value={reasons[row.id] ?? ''}
                  onChangeText={(v) => setReasons((p) => ({ ...p, [row.id]: v }))}
                  placeholder="Reason for Correction (optional)"
                  placeholderTextColor="#4A5878"
                />
                <AnimatedPressable
                  style={styles.saveBtn}
                  onPress={() => handleStatusChange(row.id, pendingStatus[row.id] ?? row.status)}
                  disabled={busyId === row.id}
                  glowColor={COLORS.primary}
                  accessibilityRole="button"
                  accessibilityLabel="Save override"
                >
                  <Text style={styles.saveText}>{busyId === row.id ? 'Saving...' : 'Save Override'}</Text>
                </AnimatedPressable>
              </View>
            ) : editable ? (
              <View style={styles.editRow}>
                <View style={styles.editDropdown}>
                  <Dropdown
                    value={row.status}
                    options={STATUS_EDIT_OPTIONS}
                    onChange={(value) => handleStatusChange(row.id, value as AttendanceStatus)}
                    disabled={busyId === row.id}
                  />
                </View>
                <AnimatedPressable
                  style={styles.deleteButton}
                  onPress={() => handleDelete(row)}
                  disabled={busyId === row.id}
                  accessibilityRole="button"
                  accessibilityLabel="Delete record"
                  glowColor={COLORS.danger}
                >
                  <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                </AnimatedPressable>
              </View>
            ) : null}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 13, color: '#4A5878', textAlign: 'center', paddingVertical: 16 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  filterRowSingle: { flexDirection: 'row', gap: 8, marginBottom: 10, paddingRight: 8 },
  chip: {
    minHeight: 40, paddingHorizontal: 14, justifyContent: 'center', borderRadius: 999,
    backgroundColor: 'rgba(255, 253, 247, 0.88)', borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)',
  },
  chipActive: { backgroundColor: '#162660', borderColor: '#162660' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#4A5878', textTransform: 'capitalize' },
  chipTextActive: { color: '#FFFFFF' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255, 253, 247, 0.88)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)',
    paddingHorizontal: 12, minHeight: 48, marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#162660', minHeight: 44 },
  emptyCard: {
    backgroundColor: 'rgba(255, 253, 247, 0.88)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)',
    padding: 28, alignItems: 'center', gap: 6,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#162660', textAlign: 'center' },
  emptySub: { fontSize: 13, color: '#4A5878', textAlign: 'center' },
  card: {
    backgroundColor: 'rgba(255, 253, 247, 0.88)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)',
    padding: 16, marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 },
  name: { fontSize: 16, fontWeight: '700', color: '#162660', flex: 1 },
  meta: { fontSize: 13, color: '#4A5878', marginBottom: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  editRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginTop: 8 },
  editDropdown: { flex: 1 },
  deleteButton: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  overrideBox: { marginTop: 10, gap: 8 },
  overrideLabel: { fontSize: 12, fontWeight: '700', color: '#3A4A6B' },
  overrideRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  overrideBtn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.16)', backgroundColor: 'rgba(255, 253, 247, 0.88)',
  },
  overrideText: { fontSize: 13, fontWeight: '700' },
  reasonInput: {
    backgroundColor: 'rgba(255, 253, 247, 0.88)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(22, 38, 96, 0.18)',
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#162660',
  },
  saveBtn: { backgroundColor: '#162660', borderRadius: 12, paddingVertical: 12, alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  saveText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});