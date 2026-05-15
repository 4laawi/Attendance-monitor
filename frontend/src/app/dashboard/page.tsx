'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserCheck, UserX, TrendingUp, RefreshCw, 
  BookOpen, Search, CheckCircle2, 
  QrCode, ArrowRight, Loader2, AlertCircle,
  Calendar, Clock, GraduationCap, MapPin, 
  ArrowUpRight, Target, Sparkles, ChevronRight
} from 'lucide-react';
import { fetchDashboardStats, fetchClasses, joinClass, fetchStudentAttendance } from '@/lib/attendanceService';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 }
  }
} as const;

export default function DashboardPage() {
  const { user, loadUser, loading: authLoading } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [studentRecords, setStudentRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isTeacher = user?.role?.toLowerCase() === 'teacher';
  const hasClass = !!(user?.classId);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      if (isTeacher) {
        const data = await fetchDashboardStats();
        setStats(data);
      } else if (hasClass) {
        const data = await fetchStudentAttendance();
        setStudentRecords(data);
      } else {
        const data = await fetchClasses();
        setClasses(data);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user?.id, user?.classId, user?.role]);

  const handleJoinClass = async (classId: string) => {
    if (hasClass) return;
    setJoining(classId);
    setError(null);
    try {
      await joinClass(classId);
      await loadUser(); 
    } catch (err: any) {
      setError(`Failed to join classroom: ${err.message}`);
    } finally {
      setJoining(null);
    }
  };

  const renderDebugInfo = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.6 }}
      className="mt-16 py-2 px-4 bg-[var(--surface)] rounded-full text-[10px] text-[var(--text-muted)] border border-[var(--border)] mx-auto w-fit flex items-center gap-2"
    >
      <div className="w-1.5 h-1.5 rounded-full bg-[var(--warning)] animate-pulse" />
      <span>DEBUG: {user?.email} • {user?.role} • Class: {String(hasClass)}</span>
    </motion.div>
  );

  if (authLoading || (loading && !stats && classes.length === 0 && studentRecords.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
        <div className="relative">
          <Loader2 className="animate-spin text-[var(--primary)]" size={48} />
          <div className="absolute inset-0 flex items-center justify-center">
            <GraduationCap size={18} className="text-[var(--primary)]" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-1 tracking-tight">Syncing your dashboard...</p>
          <p className="text-xs text-[var(--text-muted)]">Retrieving latest attendance records</p>
        </div>
      </div>
    );
  }

  // --- Student Onboarding: Choose Class ---
  if (!isTeacher && !hasClass) {
    const filtered = classes.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-10 max-w-[1000px] mx-auto w-full py-10"
      >
        <motion.div variants={itemVariants} className="text-center max-w-[650px] mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-[var(--info-bg)] flex items-center justify-center text-[var(--info)] mx-auto mb-8 shadow-sm">
            <BookOpen size={40} />
          </div>
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight text-[var(--text-primary)]">
            Welcome to the Hub, {user?.firstName}
          </h1>
          <p className="text-lg text-[var(--text-muted)] leading-relaxed">
            Your academic journey starts here. Select your assigned classroom to begin tracking your attendance and progress.
          </p>
        </motion.div>

        {error && (
          <motion.div variants={itemVariants} className="p-4 bg-[var(--danger-bg)] border border-[var(--danger)]/20 rounded-xl text-[var(--danger)] flex gap-3 items-center">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="relative max-w-[600px] mx-auto w-full group">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors" />
          <input 
            type="text" 
            placeholder="Find your classroom by name or teacher..."
            className="notion-input pl-12 py-4 text-base rounded-2xl border-[var(--border-regular)] shadow-sm focus:shadow-md transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.div>

        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cls) => (
            <motion.div 
              key={cls.id} 
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="notion-card p-6 flex flex-col gap-5 rounded-2xl border-[var(--border)] hover:border-[var(--primary)]/30 hover:shadow-md group transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--surface-hover)] flex items-center justify-center group-hover:bg-[var(--primary)]/10 transition-colors">
                  <GraduationCap size={24} className="text-[var(--primary)]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold truncate tracking-tight">{cls.name}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider mt-0.5">
                    <Target size={10} />
                    <span>Open for Enrollment</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-[var(--text-muted)] flex-1 line-clamp-3 leading-relaxed">
                {cls.description || 'Join this classroom to start tracking your attendance sessions and view your academic progress.'}
              </p>
              <button 
                onClick={() => handleJoinClass(cls.id)}
                disabled={!!joining}
                className="notion-btn-primary w-full justify-center py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm hover:shadow-md"
              >
                {joining === cls.id ? <Loader2 size={18} className="animate-spin" /> : (
                  <span className="flex items-center gap-2">
                    Join Classroom <ArrowRight size={18} />
                  </span>
                )}
              </button>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <motion.div variants={itemVariants} className="col-span-full text-center py-20 bg-[var(--surface)] rounded-3xl border border-dashed border-[var(--border)]">
              <div className="mb-4 opacity-20"><Search size={64} className="mx-auto" /></div>
              <p className="text-[var(--text-muted)] font-medium">No classrooms found matching "{searchQuery}"</p>
              <button onClick={() => setSearchQuery('')} className="mt-4 text-[var(--primary)] text-sm font-bold hover:underline">Clear search</button>
            </motion.div>
          )}
        </motion.div>
        {renderDebugInfo()}
      </motion.div>
    );
  }

  const attendanceRate = studentRecords.length > 0 
    ? Math.round((studentRecords.filter(r => r.status === 'present').length / studentRecords.length) * 100)
    : 100;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-10 pb-20"
    >
      {/* Dynamic Header */}
      <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border)] pb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white shadow-lg shadow-[var(--primary)]/20">
              {isTeacher ? <Users size={20} /> : <GraduationCap size={20} />}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-[0.2em] leading-none">
                {isTeacher ? 'Faculty Portal' : 'Student Hub'}
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                <span className="text-[11px] font-medium text-[var(--text-muted)]">Live Session Active</span>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] mb-2">
            {isTeacher ? 'Academic Overview' : `Morning, ${user?.firstName}!`}
          </h1>
          <p className="text-[var(--text-muted)] font-medium max-w-lg">
            {isTeacher 
              ? 'Real-time metrics and engagement tracking for your active classrooms.' 
              : 'You have a 100% attendance streak this week. Keep the momentum!'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {!isTeacher && (
            <Link href="/dashboard/scan">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="notion-btn-primary px-6 py-3 rounded-xl shadow-lg shadow-[var(--primary)]/10"
              >
                <QrCode size={18} /> 
                <span className="font-bold">Scan Attendance</span>
              </motion.button>
            </Link>
          )}
          <motion.button
            whileHover={{ backgroundColor: 'var(--surface-hover)' }}
            onClick={loadData}
            disabled={loading}
            className="p-3 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all flex items-center gap-2"
          >
            <RefreshCw size={18} className={cn(loading && 'animate-spin')} />
            <span className="text-sm font-semibold">Sync</span>
          </motion.button>
        </div>
      </motion.header>

      {isTeacher ? (
        <>
          {/* Teacher Stats Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Live Present', value: stats?.totalPresent || 0, icon: UserCheck, color: 'var(--success)', bg: 'var(--success-bg)', trend: '+12% this week' },
              { label: 'Flagged Absent', value: stats?.totalAbsent || 0, icon: UserX, color: 'var(--danger)', bg: 'var(--danger-bg)', trend: '-3% from yesterday' },
              { label: 'Engagement Rate', value: `${stats?.attendanceRate || 0}%`, icon: TrendingUp, color: 'var(--info)', bg: 'var(--info-bg)', trend: 'Optimal' },
              { label: 'Active Classes', value: stats?.classesCount || 1, icon: BookOpen, color: 'var(--text-primary)', bg: 'var(--surface-hover)', trend: 'Semester 2' },
            ].map((card) => (
              <motion.div 
                key={card.label} 
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="notion-card p-6 rounded-2xl border-[var(--border)] bg-white hover:shadow-xl hover:shadow-black/[0.02] transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-2.5 rounded-xl", card.bg)} style={{ color: card.color }}>
                    <card.icon size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-[var(--text-muted)]/60 bg-[var(--surface-hover)] px-2 py-1 rounded-md">
                    LIVE
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">{card.label}</span>
                  <div className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">{card.value}</div>
                </div>
                <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-1.5">
                  <ArrowUpRight size={14} className="text-[var(--success)]" />
                  <span className="text-[11px] font-semibold text-[var(--text-muted)]">{card.trend}</span>
                </div>
              </motion.div>
            ))}
          </section>

          {/* Teacher Activity Table */}
          <motion.section variants={itemVariants} className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-primary)] tracking-tight">
                <Clock size={20} className="text-[var(--primary)]" /> Recent Activity
              </h2>
              <Link href="/dashboard/attendance" className="group flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] hover:translate-x-1 transition-transform">
                Browse all records <ArrowRight size={14} />
              </Link>
            </div>
            <div className="notion-card p-0 overflow-hidden rounded-2xl border-[var(--border)] bg-white shadow-sm">
              <table className="notion-table">
                <thead>
                  <tr>
                    <th className="py-4 pl-6">Student Entity</th>
                    <th>Status</th>
                    <th>Reference Time</th>
                    <th className="text-right pr-6">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentRecords.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-30">
                          <Target size={40} />
                          <p className="text-sm font-medium">Waiting for first scan of the day...</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    stats?.recentRecords.slice(0, 8).map((record: any) => (
                      <tr key={record.id} className="group hover:bg-[var(--surface)]/50 transition-colors">
                        <td className="py-4 pl-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-[var(--text-primary)]">{record.student_name}</span>
                            <span className="text-xs text-[var(--text-muted)]">{record.student_email}</span>
                          </div>
                        </td>
                        <td>
                          <div className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            record.status === 'present' ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-[var(--danger-bg)] text-[var(--danger)]"
                          )}>
                            <div className={cn("w-1 h-1 rounded-full", record.status === 'present' ? "bg-[var(--success)]" : "bg-[var(--danger)]")} />
                            {record.status}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
                            <Clock size={12} className="opacity-50" />
                            {new Date(record.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="text-right pr-6">
                          <button className="p-2 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-all">
                            <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.section>
        </>
      ) : (
        /* Student Enrolled View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Calendar size={22} className="text-[var(--primary)]" />
              <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Attendance Timeline</h2>
            </div>
            
            <div className="notion-card p-0 overflow-hidden rounded-2xl border-[var(--border)] bg-white shadow-sm">
              <table className="notion-table">
                <thead>
                  <tr>
                    <th className="py-4 pl-6">Academic Module</th>
                    <th>Date & Precision</th>
                    <th className="text-right pr-6">Validation</th>
                  </tr>
                </thead>
                <tbody>
                  {studentRecords.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-32 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-[var(--surface-hover)] flex items-center justify-center">
                            <Sparkles size={32} className="text-[var(--text-muted)] opacity-30" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <p className="text-[var(--text-primary)] font-bold">Your timeline is empty</p>
                            <p className="text-[var(--text-muted)] text-sm">Scan a QR code in class to see your first record.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    studentRecords.map((r) => (
                      <tr key={r.id} className="group hover:bg-[var(--surface)] transition-colors">
                        <td className="py-5 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0" />
                            <span className="font-bold text-[var(--text-primary)]">{r.class_name}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-[var(--text-primary)]">
                              {new Date(r.marked_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-[11px] text-[var(--text-muted)] font-medium">
                              Marked at {new Date(r.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="text-right pr-6">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            r.status === 'present' ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-[var(--danger-bg)] text-[var(--danger)]"
                          )}>
                            {r.status === 'present' ? 'VERIFIED' : 'ABSENT'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Student Sidebar Info */}
          <motion.div variants={itemVariants} className="flex flex-col gap-6">
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="notion-card bg-gradient-to-br from-[var(--info-bg)] to-white border-[var(--info)] p-8 rounded-[2rem] relative overflow-hidden shadow-lg shadow-[var(--primary)]/5"
            >
              <div className="absolute -right-4 -top-4 opacity-[0.03] rotate-12">
                <GraduationCap size={160} />
              </div>
              
              <div className="relative z-10 flex flex-col gap-6">
                <div>
                  <h3 className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-[0.2em] mb-4">Current Enrollment</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-[var(--primary)]">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <p className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
                        {studentRecords[0]?.class_name || 'Classroom Media'}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-1">
                        <MapPin size={14} />
                        <span>Science Hall, B-12</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="h-px bg-[var(--border)]" />
                
                <p className="text-sm text-[var(--text-muted)] leading-relaxed font-medium">
                  You are an active participant in this classroom. Keep your attendance above 85% to maintain eligibility.
                </p>

                <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Academic Score</span>
                    <span className="text-sm font-black text-[var(--primary)]">{attendanceRate}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[var(--surface)] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${attendanceRate}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-[var(--primary)] rounded-full shadow-[0_0_8px_rgba(35,131,226,0.3)]" 
                    />
                  </div>
                  <p className="mt-3 text-[10px] text-center font-bold text-[var(--text-muted)] uppercase tracking-widest">Target: 95%</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="notion-card p-6 rounded-2xl flex flex-col gap-4">
              <h4 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">Resources & Actions</h4>
              <div className="flex flex-col gap-2">
                {[
                  { icon: Users, label: 'Classroom Peers' },
                  { icon: Calendar, label: 'Full Schedule' },
                  { icon: Target, label: 'Academic Goals' }
                ].map((action) => (
                  <button key={action.label} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all group">
                    <div className="p-1.5 rounded-lg bg-[var(--surface-hover)] group-hover:bg-white transition-colors">
                      <action.icon size={14} />
                    </div>
                    <span className="text-xs font-bold">{action.label}</span>
                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}

      {renderDebugInfo()}
    </motion.div>
  );
}
