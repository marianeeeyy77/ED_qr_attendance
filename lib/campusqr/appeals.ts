import { supabase } from '@/lib/supabase';
import type { AttendanceStatus } from '@/types/database';

export type AppealStatus = 'pending' | 'approved' | 'rejected';

export type AppealRow = {
  id: string;
  student_id: string;
  event_id: string;
  attendance_id: string | null;
  reason: string;
  status: AppealStatus;
  feedback: string | null;
  created_at: string;
  event?: { name: string; start_datetime: string | null } | null;
  student?: { full_name: string; email: string; student_no: string | null } | null;
};

const FALLBACK: AppealRow[] = [
  {
    id: 'mock-1', student_id: 'mock', event_id: 'mock-1', attendance_id: null,
    reason: 'Late arrival — traffic', status: 'pending', feedback: null,
    created_at: new Date().toISOString(),
    event: { name: 'Orientation Day', start_datetime: null },
    student: { full_name: 'Student', email: '', student_no: null },
  },
];

/**
 * Appeals data layer. Uses the `appeals` table when it exists;
 * falls back to local mock rows (UI shell) so Teacher/Student
 * screens keep working before the migration is applied.
 */
async function tableExists(): Promise<boolean> {
  const { error } = await supabase.from('appeals').select('id').limit(1);
  return !error;
}

export async function listOwnAppeals(studentId: string): Promise<AppealRow[]> {
  if (!(await tableExists())) return FALLBACK;
  const { data, error } = await supabase
    .from('appeals')
    .select('id, student_id, event_id, attendance_id, reason, status, feedback, created_at, event:event_id ( name, start_datetime )')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  if (error) return FALLBACK;
  return (data as unknown as AppealRow[]) ?? [];
}

export async function listTeacherQueue(teacherId: string): Promise<AppealRow[]> {
  if (!(await tableExists())) return FALLBACK;
  const { data: events } = await supabase.from('events').select('id').eq('created_by', teacherId);
  const ids = (events ?? []).map((e: any) => e.id);
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from('appeals')
    .select('id, student_id, event_id, attendance_id, reason, status, feedback, created_at, event:event_id ( name, start_datetime ), student:student_id ( full_name, email, student_no )')
    .in('event_id', ids)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data as unknown as AppealRow[]) ?? [];
}

export async function submitAppeal(input: {
  studentId: string; eventId: string; attendanceId?: string | null; reason: string;
}): Promise<{ error: string | null }> {
  if (!(await tableExists())) {
    return { error: 'Appeals table is not set up yet. Ask an admin to run the migration.' };
  }
  const { error } = await supabase.from('appeals').insert({
    student_id: input.studentId,
    event_id: input.eventId,
    attendance_id: input.attendanceId ?? null,
    reason: input.reason.trim(),
    status: 'pending',
  });
  return { error: error ? error.message : null };
}

export async function reviewAppeal(
  id: string,
  status: 'approved' | 'rejected',
  feedback: string | null
): Promise<{ error: string | null }> {
  if (!(await tableExists())) return { error: 'Appeals table is not set up yet.' };
  const { error } = await supabase
    .from('appeals')
    .update({ status, feedback })
    .eq('id', id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function appealDecisionStatus(
  attendanceId: string | null,
  approved: boolean
): Promise<AttendanceStatus> {
  void attendanceId;
  return approved ? 'excused' : 'absent';
}
