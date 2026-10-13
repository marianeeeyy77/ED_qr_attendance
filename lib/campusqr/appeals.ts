import { supabase } from '@/lib/supabase';
import type { EventStatus, UserRole } from '@/types/database';
import { suppressEcho } from './realtime';
import { refusedMessage, verifyPatch } from './verify';

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

/**
 * An event the student was marked absent for and has NOT appealed yet —
 * the only events a student may appeal (absent-only appeals, spec).
 */
export type AppealableEvent = {
  attendance_id: string;
  event_id: string;
  name: string;
  start_datetime: string | null;
  status: EventStatus;
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
 * Appeals data layer. Uses the `appeals` table (created in
 * SUPABASE_SETUP.md); falls back to local mock rows so the screens keep
 * working before that migration is applied.
 *
 * Rules enforced here AND server-side (RLS + unique constraint):
 *   • a student may appeal ONLY their own `absent` records, once per event;
 *   • staff decide each pending appeal individually — approving flips the
 *     linked attendance row to `excused`, rejecting keeps it `absent`.
 */
async function tableExists(): Promise<boolean> {
  const { error } = await supabase.from('appeals').select('id').limit(1);
  return !error;
}

const APPEAL_COLUMNS =
  'id, student_id, event_id, attendance_id, reason, status, feedback, created_at';

/** The signed-in student's own appeals, newest first. */
export async function listOwnAppeals(studentId: string): Promise<AppealRow[]> {
  if (!(await tableExists())) return FALLBACK;
  const { data, error } = await supabase
    .from('appeals')
    .select(`${APPEAL_COLUMNS}, event:event_id ( name, start_datetime )`)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  if (error) return FALLBACK;
  return (data as unknown as AppealRow[]) ?? [];
}

/**
 * Events the student can appeal: their own attendance rows marked
 * `absent`, minus events that already have an appeal by them (the table
 * enforces one appeal per student per event with a unique constraint).
 */
export async function listAppealableEvents(
  studentId: string
): Promise<AppealableEvent[]> {
  if (!(await tableExists())) return [];

  const { data: absentRows, error } = await supabase
    .from('attendance')
    .select('id, event_id, event:event_id ( name, start_datetime, status )')
    .eq('student_id', studentId)
    .eq('status', 'absent')
    .order('recorded_at', { ascending: false });
  if (error) {
    console.warn('[campusqr/appeals] listAppealableEvents failed:', error.message);
    return [];
  }

  const { data: mine } = await supabase
    .from('appeals')
    .select('event_id')
    .eq('student_id', studentId);
  const appealed = new Set(
    (mine ?? []).map((row: { event_id: string }) => row.event_id)
  );

  type AbsentRow = {
    id: string;
    event_id: string;
    event: {
      name: string;
      start_datetime: string | null;
      status: EventStatus | null;
    } | null;
  };
  return ((absentRows ?? []) as unknown as AbsentRow[])
    .filter((row) => row.event != null && !appealed.has(row.event_id))
    .map((row) => ({
      attendance_id: row.id,
      event_id: row.event_id,
      name: row.event!.name,
      start_datetime: row.event!.start_datetime,
      // `fetchOwnHistory` + the INSERT policy already restrict rows to
      // closed events; fall back to 'closed' only for legacy rows whose
      // event status cannot be read (e.g. a hidden draft).
      status: row.event!.status ?? 'closed',
    }));
}

/**
 * Staff review queue — one row per appeal (per absent student per event):
 *   • admin  → every appeal
 *   • teacher → appeals for the events they created (RLS enforces the same)
 */
export async function listStaffQueue(
  userId: string,
  role: UserRole
): Promise<AppealRow[]> {
  if (!(await tableExists())) return FALLBACK;

  let query = supabase
    .from('appeals')
    .select(
      `${APPEAL_COLUMNS}, event:event_id ( name, start_datetime ), student:student_id ( full_name, email, student_no )`
    )
    .order('created_at', { ascending: false });

  if (role !== 'admin') {
    const { data: events } = await supabase
      .from('events')
      .select('id')
      .eq('created_by', userId);
    const ids = (events ?? []).map((event: { id: string }) => event.id);
    if (ids.length === 0) return [];
    query = query.in('event_id', ids);
  }

  const { data, error } = await query;
  if (error) return [];
  return (data as unknown as AppealRow[]) ?? [];
}

/**
 * Submits ONE appeal for ONE absent record. `attendanceId` must point at
 * the student's own `absent` row — the RLS INSERT policy verifies that
 * server-side, and the unique (student_id, event_id) constraint makes
 * error `23505` mean "already appealed".
 */
export async function submitAppeal(input: {
  studentId: string;
  eventId: string;
  attendanceId: string;
  reason: string;
}): Promise<{ error: string | null }> {
  if (!(await tableExists())) {
    return { error: 'Appeals table is not set up yet. Ask an admin to run the migration.' };
  }
  const { error } = await supabase.from('appeals').insert({
    student_id: input.studentId,
    event_id: input.eventId,
    attendance_id: input.attendanceId,
    reason: input.reason.trim(),
    status: 'pending',
  });
  if (error) {
    if (error.code === '23505') {
      return { error: 'You have already appealed this event.' };
    }
    return { error: error.message };
  }
  suppressEcho('appeals');
  return { error: null };
}

/**
 * Decides ONE pending appeal. The update is guarded by
 * `.eq('status', 'pending')` and verified with a read-back (verifyPatch),
 * so a re-review or an RLS-blocked update is reported instead of silently
 * "succeeding". Approving also flips the linked `absent` attendance row to
 * `excused` (guarded the same way); rejecting keeps it `absent`.
 */
export async function reviewAppeal(
  id: string,
  status: 'approved' | 'rejected',
  feedback: string | null,
  attendanceId?: string | null
): Promise<{ error: string | null }> {
  if (!(await tableExists())) return { error: 'Appeals table is not set up yet.' };

  const { error } = await supabase
    .from('appeals')
    .update({ status, feedback })
    .eq('id', id)
    .eq('status', 'pending');
  if (error) return { error: error.message };
  suppressEcho('appeals', id);

  const { data: row } = await supabase
    .from('appeals')
    .select('status')
    .eq('id', id)
    .maybeSingle();
  const check = verifyPatch(row as Record<string, unknown> | null, { status });
  if (!check.ok) {
    if (row == null) return { error: refusedMessage(check.refused) };
    // The guarded UPDATE matched 0 rows: the appeal already has a decision.
    return { error: 'This appeal has already been reviewed.' };
  }

  if (status === 'approved' && attendanceId) {
    const { error: attError } = await supabase
      .from('attendance')
      .update({ status: 'excused' })
      .eq('id', attendanceId)
      .eq('status', 'absent');
    if (attError) return { error: attError.message };
    suppressEcho('attendance', attendanceId);

    const { data: attRow } = await supabase
      .from('attendance')
      .select('status')
      .eq('id', attendanceId)
      .maybeSingle();
    const attCheck = verifyPatch(attRow as Record<string, unknown> | null, {
      status: 'excused',
    });
    if (!attCheck.ok) return { error: refusedMessage(attCheck.refused) };
  }

  return { error: null };
}