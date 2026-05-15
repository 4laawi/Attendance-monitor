import { supabase } from './supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Class {
  id: string;
  name: string;
  description: string | null;
  teacher_id: string;
  created_at: string;
}

export interface AttendanceSession {
  id: string;
  class_id: string;
  token: string;
  created_at: string;
  expires_at: string;
  class_name?: string;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  student_name: string;
  student_first_name?: string;
  student_last_name?: string;
  student_email: string;
  status: 'present' | 'absent';
  marked_at: string;
}

export interface ClassStudent {
  id: string;
  class_id: string;
  student_name: string;
  student_email: string | null;
  created_at: string;
}

// ─── Classes ─────────────────────────────────────────────────────────────────

export async function fetchClasses(): Promise<Class[]> {
  const { data, error } = await supabase
    .from('app_classes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createClass(name: string, description: string): Promise<Class> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('app_classes')
    .insert({ name, description, teacher_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateClass(id: string, name: string, description: string): Promise<Class> {
  const { data, error } = await supabase
    .from('app_classes')
    .update({ name, description })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteClass(classId: string): Promise<void> {
  const { error } = await supabase
    .from('app_classes')
    .delete()
    .eq('id', classId);

  if (error) throw error;
}

// ─── Class Students ──────────────────────────────────────────────────────────

export async function fetchClassStudents(classId: string): Promise<ClassStudent[]> {
  // 1. Fetch manual students
  const { data: manual, error: e1 } = await supabase
    .from('app_class_students')
    .select('*')
    .eq('class_id', classId);

  if (e1) throw e1;

  // 2. Fetch signed-up students for this class
  const { data: profiles, error: e2 } = await supabase
    .from('app_profiles')
    .select('id, first_name, last_name, email, created_at')
    .eq('class_id', classId)
    .eq('role', 'student');

  if (e2) throw e2;

  // 3. Combine and de-duplicate by email
  const combined = new Map<string, ClassStudent>();

  // Add manual students
  manual?.forEach(s => {
    const key = (s.student_email || s.id).toLowerCase();
    combined.set(key, {
      id: s.id,
      class_id: s.class_id,
      student_name: s.student_name,
      student_email: s.student_email,
      created_at: s.created_at
    });
  });

  // Override with profile data (preferred because it has the real names from signup)
  profiles?.forEach(p => {
    if (p.email) {
      const key = p.email.toLowerCase();
      combined.set(key, {
        id: p.id,
        class_id: classId,
        student_name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email,
        student_email: p.email,
        created_at: p.created_at
      });
    }
  });

  return Array.from(combined.values()).sort((a, b) => a.student_name.localeCompare(b.student_name));
}

export async function addStudentToClass(classId: string, name: string, email?: string): Promise<ClassStudent> {
  const { data, error } = await supabase
    .from('app_class_students')
    .insert({
      class_id: classId,
      student_name: name,
      student_email: email || null
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addStudentsBulk(classId: string, students: { name: string, email?: string }[]): Promise<void> {
  if (students.length === 0) return;

  const { error } = await supabase
    .from('app_class_students')
    .insert(
      students.map(s => ({
        class_id: classId,
        student_name: s.name,
        student_email: s.email || null
      }))
    );

  if (error) throw error;
}

export async function removeStudentFromClass(studentId: string): Promise<void> {
  const { error } = await supabase
    .from('app_class_students')
    .delete()
    .eq('id', studentId);

  if (error) throw error;
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

/** Creates an attendance session with a secure random token valid for 10 minutes */
export async function createAttendanceSession(classId: string): Promise<AttendanceSession> {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

  const { data, error } = await supabase
    .from('attendance_sessions')
    .insert({
      class_id: classId,
      token,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchSessionsForClass(classId: string): Promise<AttendanceSession[]> {
  const { data, error } = await supabase
    .from('attendance_sessions')
    .select('*')
    .eq('class_id', classId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/** Validates a token, returns the session if valid and not expired */
export async function validateToken(token: string): Promise<AttendanceSession | null> {
  const { data, error } = await supabase
    .from('attendance_sessions')
    .select('*, app_classes(name)')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) return null;
  return {
    ...data,
    class_name: (data as any).app_classes?.name,
  };
}

/** 
 * Closes an attendance session and marks all enrolled students who didn't scan as 'absent'.
 * Only students who have a registered account (matching email) can be marked absent.
 */
export async function closeAttendanceSession(sessionId: string, classId: string): Promise<void> {
  // 1. Mark session as expired
  const { error: updateError } = await supabase
    .from('attendance_sessions')
    .update({ expires_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (updateError) throw updateError;

  // 2. Fetch all students enrolled in this class
  const { data: enrolledStudents, error: enrolledError } = await supabase
    .from('app_class_students')
    .select('student_email')
    .eq('class_id', classId);

  if (enrolledError) throw enrolledError;
  if (!enrolledStudents || enrolledStudents.length === 0) return;

  const enrolledEmails = enrolledStudents
    .map(s => s.student_email?.toLowerCase().trim())
    .filter(Boolean) as string[];

  if (enrolledEmails.length === 0) return;

  // 3. Fetch all students who have already marked attendance (present)
  const { data: presentRecords, error: presentError } = await supabase
    .from('attendance_records')
    .select('student_id')
    .eq('session_id', sessionId);

  if (presentError) throw presentError;
  const presentStudentIds = new Set(presentRecords?.map(r => r.student_id) || []);

  // 4. Find the student_ids for the enrolled emails
  const { data: studentProfiles, error: profilesError } = await supabase
    .from('app_profiles')
    .select('id, email')
    .in('email', enrolledEmails);

  if (profilesError) throw profilesError;

  // 5. Identify students who are in the class (by email) but NOT present (by student_id)
  const absentStudents = (studentProfiles || []).filter(p => !presentStudentIds.has(p.id));

  if (absentStudents.length > 0) {
    // 6. Insert absent records
    const { error: absentError } = await supabase
      .from('attendance_records')
      .insert(
        absentStudents.map(p => ({
          session_id: sessionId,
          student_id: p.id,
          status: 'absent'
        }))
      );

    if (absentError) {
      console.error('Error marking absent students:', absentError);
    }
  }
}

// ─── Attendance Records ───────────────────────────────────────────────────────

/** Student submits their attendance using a QR token */
export async function submitAttendance(token: string): Promise<{ success: boolean; message: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Not authenticated' };

  // Validate the token
  const session = await validateToken(token);
  if (!session) return { success: false, message: 'Invalid or expired QR code' };

  // Check if already marked
  const { data: existing } = await supabase
    .from('attendance_records')
    .select('id')
    .eq('session_id', session.id)
    .eq('student_id', user.id)
    .single();

  if (existing) return { success: false, message: 'Attendance already recorded' };

  // Insert attendance record
  const { error } = await supabase
    .from('attendance_records')
    .insert({
      session_id: session.id,
      student_id: user.id,
      status: 'present',
    });

  if (error) return { success: false, message: error.message };
  return { success: true, message: 'Attendance marked successfully!' };
}

/** Fetch all attendance records for a session with student profile info */
export async function fetchAttendanceForSession(sessionId: string): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from('attendance_records')
    .select(`
      id, session_id, student_id, status, marked_at,
      app_profiles (first_name, last_name, email)
    `)
    .eq('session_id', sessionId);

  if (error) throw error;

  return (data || []).map((r: any) => ({
    id: r.id,
    session_id: r.session_id,
    student_id: r.student_id,
    student_name: `${r.app_profiles?.first_name || ''} ${r.app_profiles?.last_name || ''}`.trim() || r.app_profiles?.email || 'Unknown',
    student_first_name: r.app_profiles?.first_name || '',
    student_last_name: r.app_profiles?.last_name || '',
    student_email: r.app_profiles?.email || '',
    status: r.status,
    marked_at: r.marked_at,
  }));
}

/** Dashboard stats: all classes with present/absent counts */
export async function fetchDashboardStats(classId?: string): Promise<{
  totalPresent: number;
  totalAbsent: number;
  attendanceRate: number;
  recentRecords: AttendanceRecord[];
}> {
  let query = supabase
    .from('attendance_records')
    .select(`
      id, session_id, student_id, status, marked_at,
      app_profiles (first_name, last_name, email),
      attendance_sessions!inner (class_id)
    `)
    .order('marked_at', { ascending: false });

  if (classId) {
    query = query.eq('attendance_sessions.class_id', classId);
  }

  const { data, error } = await query.limit(50);
  if (error) throw error;

  const records = (data || []).map((r: any) => ({
    id: r.id,
    session_id: r.session_id,
    student_id: r.student_id,
    student_name: `${r.app_profiles?.first_name || ''} ${r.app_profiles?.last_name || ''}`.trim() || r.app_profiles?.email || 'Unknown',
    student_first_name: r.app_profiles?.first_name || '',
    student_last_name: r.app_profiles?.last_name || '',
    student_email: r.app_profiles?.email || '',
    status: r.status,
    marked_at: r.marked_at,
  }));

  const totalPresent = records.filter(r => r.status === 'present').length;
  const totalAbsent = records.filter(r => r.status === 'absent').length;
  const total = totalPresent + totalAbsent;
  const attendanceRate = total > 0 ? Math.round((totalPresent / total) * 100) : 0;

  return { totalPresent, totalAbsent, attendanceRate, recentRecords: records };
}

/** Student joins a class */
export async function joinClass(classId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // 1. Update the student's profile with the class_id
  const { error: profileError } = await supabase
    .from('app_profiles')
    .update({ class_id: classId })
    .eq('id', user.id);

  if (profileError) throw profileError;

  // 2. Also ensure they are in the app_class_students table so teachers see them in the "Enrolled" list
  // We fetch the profile to get the names saved during signup
  const { data: profile } = await supabase
    .from('app_profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single();

  const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || user.email || 'Unknown Student';

  const { error: joinError } = await supabase
    .from('app_class_students')
    .upsert({
      class_id: classId,
      student_name: fullName,
      student_email: user.email,
    }, { onConflict: 'class_id, student_email' });

  if (joinError) {
    console.error('Error adding student to class list:', joinError);
    // We don't throw here as the profile update was successful
  }
}

/** Fetch student's own attendance history */
export async function fetchStudentAttendance(): Promise<AttendanceRecord[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('attendance_records')
    .select(`
      id, session_id, student_id, status, marked_at,
      attendance_sessions (class_id, app_classes (name))
    `)
    .eq('student_id', user.id)
    .order('marked_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((r: any) => ({
    id: r.id,
    session_id: r.session_id,
    student_id: r.student_id,
    student_name: 'You',
    student_email: '',
    status: r.status,
    marked_at: r.marked_at,
    class_name: r.attendance_sessions?.app_classes?.name,
  }));
}

/** Fetch attendance stats for a specific student in a specific class */
export async function fetchStudentStatsInClass(classId: string, studentEmail: string): Promise<{
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  records: AttendanceRecord[];
}> {
  // 1. Get the student's profile ID if they have one
  const { data: profile } = await supabase
    .from('app_profiles')
    .select('id')
    .eq('email', studentEmail)
    .single();

  if (!profile) {
    return { totalSessions: 0, presentCount: 0, absentCount: 0, records: [] };
  }

  // 2. Fetch all records for this student in this class
  const { data, error } = await supabase
    .from('attendance_records')
    .select(`
      id, session_id, student_id, status, marked_at,
      attendance_sessions!inner (id, class_id, created_at)
    `)
    .eq('student_id', profile.id)
    .eq('attendance_sessions.class_id', classId)
    .order('marked_at', { ascending: false });

  if (error) throw error;

  const records = (data || []).map((r: any) => ({
    id: r.id,
    session_id: r.session_id,
    student_id: r.student_id,
    student_name: '', // Not needed for single student view
    student_email: studentEmail,
    status: r.status,
    marked_at: r.marked_at,
  }));

  const presentCount = records.filter(r => r.status === 'present').length;
  const absentCount = records.filter(r => r.status === 'absent').length;

  // 3. Get total sessions for this class to show context
  const { count: totalSessions } = await supabase
    .from('attendance_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('class_id', classId);

  return {
    totalSessions: totalSessions || 0,
    presentCount,
    absentCount,
    records
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}
