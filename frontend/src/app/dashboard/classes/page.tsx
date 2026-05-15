'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Users, BookOpen, Loader2, Search, ArrowLeft, 
  Trash2, UserPlus, MoreHorizontal, Mail, Calendar, 
  X, Info, Copy, Check, Filter, ArrowRight,
  TrendingUp, Clock, AlertCircle, FileText, ChevronRight,
  GraduationCap, UserCheck, User, Zap
} from 'lucide-react';
import { 
  fetchClasses, createClass, updateClass, deleteClass,
  fetchClassStudents, addStudentToClass, removeStudentFromClass,
  addStudentsBulk, fetchStudentStatsInClass,
  type Class, type ClassStudent 
} from '@/lib/attendanceService';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Student Stats state
  const [selectedStudent, setSelectedStudent] = useState<ClassStudent | null>(null);
  const [studentStats, setStudentStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Import states
  const [addMethod, setAddMethod] = useState<'single' | 'bulk' | 'file'>('single');
  const [bulkInput, setBulkInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const data = await fetchClasses();
      setClasses(data);
    } catch (err) {
      console.error('Failed to load classes', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async (classId: string) => {
    setStudentsLoading(true);
    try {
      const data = await fetchClassStudents(classId);
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students', err);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    setCreateLoading(true);
    try {
      await createClass(newClassName, newClassDesc);
      setNewClassName('');
      setNewClassDesc('');
      setIsCreating(false);
      loadClasses();
    } catch (err) {
      console.error('Failed to create class', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class? All attendance data will be lost.')) return;
    try {
      await deleteClass(id);
      setSelectedClass(null);
      loadClasses();
    } catch (err) {
      console.error('Failed to delete class', err);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !newStudentName.trim()) return;

    try {
      await addStudentToClass(selectedClass.id, newStudentName, newStudentEmail);
      setNewStudentName('');
      setNewStudentEmail('');
      setIsAddingStudent(false);
      loadStudents(selectedClass.id);
    } catch (err) {
      console.error('Failed to add student', err);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!selectedClass) return;
    try {
      await removeStudentFromClass(studentId);
      loadStudents(selectedClass.id);
    } catch (err) {
      console.error('Failed to remove student', err);
    }
  };

  const handleViewStudentStats = async (student: ClassStudent) => {
    if (!selectedClass || !student.student_email) {
      alert("No email provided for this student. Stats are only available for students with emails.");
      return;
    }
    setSelectedStudent(student);
    setStatsLoading(true);
    setStudentStats(null);
    try {
      const stats = await fetchStudentStatsInClass(selectedClass.id, student.student_email);
      setStudentStats(stats);
    } catch (err) {
      console.error('Failed to load student stats', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !editName.trim()) return;

    try {
      const updated = await updateClass(selectedClass.id, editName, editDesc);
      setSelectedClass(updated);
      setIsEditing(false);
      loadClasses();
    } catch (err) {
      console.error('Failed to update class', err);
    }
  };

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !bulkInput.trim()) return;

    setIsProcessing(true);
    try {
      const lines = bulkInput.split('\n').filter(line => line.trim());
      const studentsToPulse = lines.map(line => {
        const parts = line.split(',').map(p => p.trim());
        return {
          name: parts[0],
          email: parts[1] || undefined
        };
      }).filter(s => s.name);

      await addStudentsBulk(selectedClass.id, studentsToPulse);
      setBulkInput('');
      setIsAddingStudent(false);
      loadStudents(selectedClass.id);
    } catch (err) {
      console.error('Failed to bulk add students', err);
      alert('Error adding students. Check your format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClass) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const startIdx = lines[0].toLowerCase().includes('name') ? 1 : 0;
        
        const studentsToPulse = lines.slice(startIdx).map(line => {
          const parts = line.split(',').map(p => p.trim());
          return {
            name: parts[0],
            email: parts[1] || undefined
          };
        }).filter(s => s.name);

        await addStudentsBulk(selectedClass.id, studentsToPulse);
        setIsAddingStudent(false);
        loadStudents(selectedClass.id);
      } catch (err) {
        console.error('File parsing failed', err);
        alert('Failed to parse CSV file. Please ensure it is a valid comma-separated file.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  const chatGptPrompt = `I have a photo of a list of students with their names and emails. Please extract this data and format it exactly like this:
Name, Email
Name, Email

Only provide the list, no extra text. Use the actual names and emails found in the image.`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(chatGptPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  // Animations
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  } as const;

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  } as const;

  if (selectedClass) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-8 max-w-6xl mx-auto"
      >
        {/* Detail Header */}
        <div className="flex flex-col gap-6">
          <motion.button 
            whileHover={{ x: -4 }}
            onClick={() => { setSelectedClass(null); setIsEditing(false); }}
            className="flex items-center gap-2 text-[var(--text-muted)] font-bold text-xs uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors w-fit"
          >
            <ArrowLeft size={16} />
            Back to Registry
          </motion.button>
          
          <div className="flex items-start justify-between gap-8">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.form 
                  key="editing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleUpdateClass} 
                  className="flex flex-col gap-4 flex-1 max-w-xl bg-white p-6 rounded-3xl border border-[var(--border)] shadow-[var(--shadow-lg)]"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Course Identity</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="notion-input text-xl font-bold py-3"
                      placeholder="e.g. CS101: Introduction to AI"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Description & Context</label>
                    <textarea 
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="notion-input min-h-[100px] resize-none"
                      placeholder="Specify semester, section, or learning objectives..."
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="notion-btn-primary px-6">Apply Changes</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="notion-btn-ghost">Discard</button>
                  </div>
                </motion.form>
              ) : (
                <motion.div 
                  key="viewing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--success-bg)] flex items-center justify-center shadow-inner">
                      <BookOpen size={28} className="text-[var(--success)]" />
                    </div>
                    <div className="flex flex-col">
                      <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight leading-none">{selectedClass.name}</h1>
                      <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Users size={12} /> {students.length} Enrolled</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
                        <span className="flex items-center gap-1"><Clock size={12} /> Established {new Date(selectedClass.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[var(--text-muted)] text-lg font-medium leading-relaxed max-w-2xl">
                    {selectedClass.description || 'No specialized description provided for this academic group.'}
                  </p>
                  <div className="flex gap-3 mt-6">
                    <button 
                      onClick={() => {
                        setEditName(selectedClass.name);
                        setEditDesc(selectedClass.description || '');
                        setIsEditing(true);
                      }}
                      className="notion-btn-ghost px-4 py-2 text-xs font-bold"
                    >
                      Refine Details
                    </button>
                    <button 
                      onClick={() => handleDeleteClass(selectedClass.id)}
                      className="notion-btn-ghost px-4 py-2 text-xs font-bold text-[var(--danger)] hover:bg-[var(--danger-bg)]"
                    >
                      Terminate Course
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="hidden lg:flex flex-col gap-4 w-64">
              <div className="bg-[var(--primary-bg)] p-5 rounded-3xl border border-[var(--primary)]/10">
                <TrendingUp size={24} className="text-[var(--primary)] mb-3" />
                <h4 className="text-xs font-black uppercase tracking-widest text-[var(--primary)]">Course Vitality</h4>
                <div className="text-2xl font-black text-[var(--text-primary)] mt-1">92%</div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1 uppercase tracking-tighter">Avg. Attendance Rank</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Management */}
        <div className="bg-white border border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-[var(--shadow-lg)]">
          <div className="px-8 py-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface)]/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--text-primary)] flex items-center justify-center">
                <Users size={16} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Student Registry</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-white border border-[var(--border)] text-[10px] font-black text-[var(--text-muted)]">
                {students.length} TOTAL
              </span>
            </div>
            <button 
              onClick={() => {
                setAddMethod('single');
                setIsAddingStudent(true);
              }}
              className="notion-btn-primary px-5 rounded-2xl text-xs font-black"
            >
              <UserPlus size={16} />
              ENROLL NEW
            </button>
          </div>

          <div className="min-h-[400px]">
            {studentsLoading ? (
              <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 size={32} className="animate-spin text-[var(--primary)]" />
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Synchronizing Registry...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[var(--surface-hover)] flex items-center justify-center mb-6 opacity-40">
                  <GraduationCap size={32} className="text-[var(--text-muted)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No students enrolled</h3>
                <p className="text-[var(--text-muted)] max-w-sm font-medium">Start building your classroom by adding students manually, pasting a list, or uploading a CSV.</p>
                <button 
                   onClick={() => setIsAddingStudent(true)}
                   className="mt-8 notion-btn-primary rounded-2xl px-8"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-left bg-[var(--surface)]/20">
                      <th className="px-8 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Student Identity</th>
                      <th className="px-8 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Contact Information</th>
                      <th className="px-8 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Enrollment Date</th>
                      <th className="px-8 py-4 w-20"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-regular)]">
                    {students.map((student, idx) => (
                      <motion.tr 
                        key={student.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        onClick={() => handleViewStudentStats(student)}
                        className="group hover:bg-[var(--surface-hover)] cursor-pointer transition-colors"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm border border-white",
                              idx % 3 === 0 ? "bg-blue-50 text-blue-600" : idx % 3 === 1 ? "bg-indigo-50 text-indigo-600" : "bg-teal-50 text-teal-600"
                            )}>
                              {student.student_name.charAt(0)}
                            </div>
                            <span className="font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">{student.student_name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] font-medium">
                            <Mail size={14} className="opacity-40" />
                            {student.student_email || <span className="opacity-30 italic">Not Provided</span>}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-tighter">
                            {new Date(student.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleRemoveStudent(student.id); }}
                            className="p-2 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)] rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          >
                            <X size={18} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* Modals are updated below in a consistent style */}
        <AnimatePresence>
          {isAddingStudent && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddingStudent(false)}
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white border border-[var(--border)] rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.15)] w-full max-w-xl overflow-hidden"
              >
                <div className="px-10 pt-10 pb-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-col">
                      <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Expand Registry</h2>
                      <p className="text-[var(--text-muted)] font-medium text-sm">Select your preferred enrollment protocol.</p>
                    </div>
                    <button onClick={() => setIsAddingStudent(false)} className="p-3 hover:bg-[var(--surface-hover)] rounded-2xl transition-colors"><X size={24}/></button>
                  </div>

                  {/* Enhanced Tabs */}
                  <div className="flex p-1 bg-[var(--surface-hover)] rounded-2xl mb-8">
                    {[
                      { id: 'single', label: 'Individual', icon: UserPlus },
                      { id: 'bulk', label: 'Multi-Paste', icon: FileText },
                      { id: 'file', label: 'CSV Upload', icon: Users },
                    ].map((tab) => (
                      <button 
                        key={tab.id}
                        onClick={() => { setAddMethod(tab.id as any); setShowHelp(false); }}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          addMethod === tab.id 
                            ? "bg-white shadow-sm text-[var(--primary)]" 
                            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        )}
                      >
                        <tab.icon size={14} />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="min-h-[300px]">
                    {addMethod === 'single' && (
                      <motion.form 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onSubmit={handleAddStudent} 
                        className="flex flex-col gap-5"
                      >
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Full Academic Name</label>
                          <div className="relative group">
                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors pointer-events-none" />
                            <input 
                              type="text" 
                              placeholder="e.g. Johnathan Smith"
                              required
                              value={newStudentName}
                              onChange={(e) => setNewStudentName(e.target.value)}
                              className="notion-input pl-12 py-4 rounded-2xl border-[var(--border-regular)]"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">University Email (Recommended)</label>
                          <div className="relative group">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors pointer-events-none" />
                            <input 
                              type="email" 
                              placeholder="name@university.edu"
                              value={newStudentEmail}
                              onChange={(e) => setNewStudentEmail(e.target.value)}
                              className="notion-input pl-12 py-4 rounded-2xl border-[var(--border-regular)]"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 pt-6">
                          <button type="submit" className="notion-btn-primary flex-1 h-14 rounded-2xl font-black shadow-lg shadow-[var(--primary)]/20">CONFIRM ENROLLMENT</button>
                        </div>
                      </motion.form>
                    )}

                    {addMethod === 'bulk' && (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col gap-6"
                      >
                        <div className="flex items-center justify-between p-4 bg-[var(--info-bg)] rounded-2xl border border-[var(--info)]/10">
                          <div className="flex items-center gap-3">
                            <Info size={18} className="text-[var(--info)]" />
                            <p className="text-[11px] font-bold text-[var(--info)] uppercase tracking-tight">Format: Name, email (one per line)</p>
                          </div>
                          <button 
                            onClick={() => setShowHelp(!showHelp)}
                            className="text-[10px] font-black text-[var(--info)] uppercase tracking-widest underline underline-offset-4"
                          >
                            AI Prompt Helper
                          </button>
                        </div>

                        <AnimatePresence>
                          {showHelp && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-[var(--success-bg)] p-6 rounded-2xl border border-[var(--success)]/10"
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <Zap size={16} className="text-[var(--success)]" />
                                <span className="text-[10px] font-black text-[var(--success)] uppercase tracking-[0.2em]">ChatGPT Extraction Protocol</span>
                              </div>
                              <p className="text-xs text-[var(--success)] font-bold mb-4 opacity-80">Use this prompt with a photo of your paper list:</p>
                              <div className="relative group">
                                <div className="bg-white/50 border border-[var(--success)]/20 rounded-xl p-4 text-[10px] font-mono text-[var(--text-muted)] pr-12 leading-relaxed">
                                  {chatGptPrompt}
                                </div>
                                <button 
                                  onClick={copyToClipboard}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white rounded-lg shadow-sm border border-[var(--border)] text-[var(--text-muted)]"
                                >
                                  {copied ? <Check size={16} className="text-[var(--success)]" /> : <Copy size={16} />}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <form onSubmit={handleBulkAdd} className="flex flex-col gap-4">
                          <textarea 
                            placeholder="Ali Taghi, ali.taghi@gmail.com&#10;John Doe, john@university.edu"
                            value={bulkInput}
                            onChange={(e) => setBulkInput(e.target.value)}
                            className="notion-input min-h-[160px] resize-none font-mono text-xs leading-relaxed py-4"
                            required
                          />
                          <button type="submit" disabled={isProcessing} className="notion-btn-primary h-14 rounded-2xl font-black">
                            {isProcessing ? <Loader2 size={20} className="animate-spin" /> : 'IMPORT BATCH'}
                          </button>
                        </form>
                      </motion.div>
                    )}

                    {addMethod === 'file' && (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col gap-8 items-center py-10"
                      >
                        <div className="relative w-full">
                          <label className="flex flex-col items-center justify-center w-full h-48 border-4 border-dashed border-[var(--border)] rounded-[2rem] bg-[var(--surface)]/30 hover:bg-[var(--surface)] hover:border-[var(--primary)]/30 cursor-pointer transition-all group overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
                            <div className="relative z-10 flex flex-col items-center gap-4">
                              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users size={32} className="text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">Deploy CSV Asset</span>
                                <span className="text-[10px] font-bold text-[var(--text-muted)] mt-1 opacity-60">XLSX, CSV, OR TEXT FORMATS</span>
                              </div>
                            </div>
                            <input 
                              type="file" 
                              accept=".csv"
                              onChange={handleFileUpload}
                              className="hidden"
                              disabled={isProcessing}
                            />
                          </label>
                        </div>
                        {isProcessing && (
                          <div className="flex items-center gap-3 animate-pulse">
                            <Loader2 size={18} className="animate-spin text-[var(--primary)]" />
                            <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.3em]">Parsing Data Streams...</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Student Stats Modal */}
        <AnimatePresence>
          {selectedStudent && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedStudent(null)}
                className="absolute inset-0 bg-black/40 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="relative bg-white border border-[var(--border)] rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.2)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
              >
                {/* Modal Header */}
                <div className="px-10 py-10 flex items-center justify-between bg-[var(--surface)]/50 border-b border-[var(--border)]">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-[var(--primary)]/20 rotate-3 transition-transform hover:rotate-0">
                      {selectedStudent.student_name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight leading-none">{selectedStudent.student_name}</h2>
                      <p className="text-sm font-bold text-[var(--text-muted)] mt-2 flex items-center gap-2">
                        <Mail size={14} className="opacity-40" /> {selectedStudent.student_email || 'No email associated'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedStudent(null)} className="p-4 hover:bg-white rounded-2xl shadow-sm transition-all border border-transparent hover:border-[var(--border)] text-[var(--text-muted)]"><X size={24}/></button>
                </div>

                <div className="px-10 py-8 overflow-y-auto flex-1">
                  {statsLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-6">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-[var(--primary)]/10 border-t-[var(--primary)] animate-spin" />
                        <UserCheck size={24} className="absolute inset-0 m-auto text-[var(--primary)] animate-pulse" />
                      </div>
                      <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Synthesizing Performance Analytics...</p>
                    </div>
                  ) : studentStats ? (
                    <div className="flex flex-col gap-10">
                      {/* Metric Orbitals */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-8 rounded-[2rem] bg-[var(--success-bg)] border border-[var(--success)]/10 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--success)] opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity" />
                          <p className="text-[10px] font-black text-[var(--success)] uppercase tracking-[0.2em] mb-2">Confirmed Presence</p>
                          <div className="text-4xl font-black text-[var(--success)]">{studentStats.presentCount}</div>
                          <p className="text-[10px] font-bold text-[var(--success)] opacity-60 mt-1 uppercase">SESSIONS MARKED PRESENT</p>
                        </div>
                        <div className="p-8 rounded-[2rem] bg-[var(--danger-bg)] border border-[var(--danger)]/10 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--danger)] opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity" />
                          <p className="text-[10px] font-black text-[var(--danger)] uppercase tracking-[0.2em] mb-2">Recorded Absence</p>
                          <div className="text-4xl font-black text-[var(--danger)]">{studentStats.absentCount}</div>
                          <p className="text-[10px] font-bold text-[var(--danger)] opacity-60 mt-1 uppercase">SESSIONS MARKED ABSENT</p>
                        </div>
                      </div>

                      {/* Vitality Progress */}
                      <div className="bg-white p-8 rounded-[2rem] border border-[var(--border)] shadow-sm">
                        <div className="flex justify-between items-end mb-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">Consistency Score</span>
                            <span className="text-3xl font-black text-[var(--text-primary)]">
                              {studentStats.totalSessions > 0 ? Math.round((studentStats.presentCount / studentStats.totalSessions) * 100) : 0}%
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-1">Universe Rank</span>
                            <span className="px-3 py-1 bg-[var(--primary-bg)] text-[var(--primary)] rounded-lg text-xs font-black">TOP 15%</span>
                          </div>
                        </div>
                        <div className="w-full h-4 bg-[var(--surface-hover)] rounded-full overflow-hidden p-1 shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${studentStats.totalSessions > 0 ? (studentStats.presentCount / studentStats.totalSessions) * 100 : 0}%` }}
                            transition={{ duration: 1, ease: "easeOut" as const }}
                            className="h-full bg-[var(--primary)] rounded-full shadow-lg shadow-[var(--primary)]/30"
                          />
                        </div>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] mt-4 uppercase tracking-widest opacity-60">
                          CALCULATED FROM {studentStats.totalSessions} INDIVIDUAL ENCOUNTERS
                        </p>
                      </div>

                      {/* Timeline */}
                      <div>
                        <div className="flex items-center justify-between mb-6 px-2">
                          <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-[0.2em] flex items-center gap-3">
                            <Clock size={16} className="text-[var(--primary)]" />
                            Session Chronology
                          </h4>
                          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">LATEST 5 EVENTS</span>
                        </div>
                        <div className="flex flex-col gap-3">
                          {studentStats.records.length === 0 ? (
                            <div className="p-10 text-center bg-[var(--surface-hover)] rounded-[2rem] border border-dashed border-[var(--border)]">
                              <AlertCircle size={24} className="mx-auto text-[var(--text-muted)] opacity-30 mb-3" />
                              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Zero Session Records Found</p>
                            </div>
                          ) : (
                            studentStats.records.slice(0, 5).map((record: any, ridx: number) => (
                              <motion.div 
                                key={record.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: ridx * 0.1 }}
                                className="flex items-center justify-between p-5 rounded-2xl border border-[var(--border-regular)] hover:bg-[var(--surface-hover)] transition-colors"
                              >
                                <div className="flex flex-col">
                                  <span className="text-sm font-black text-[var(--text-primary)]">{new Date(record.marked_at).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1 opacity-60">Encountered at {new Date(record.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <span className={cn(
                                  "text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-[0.2em] shadow-sm",
                                  record.status === 'present' ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-[var(--danger-bg)] text-[var(--danger)]"
                                )}>
                                  {record.status}
                                </span>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-20 text-center">
                      <p className="text-[var(--text-muted)] font-bold">Failed to retrieve analytic streams.</p>
                    </div>
                  )}
                </div>
                
                <div className="px-10 py-8 border-t border-[var(--border)] bg-[var(--surface)]/30">
                  <button onClick={() => setSelectedStudent(null)} className="notion-btn-primary w-full h-14 rounded-2xl font-black text-sm">CLOSE DOSSIER</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-12 max-w-6xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20 rotate-3">
              <BookOpen size={20} className="text-white" />
            </div>
            <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.4em]">Academic Hub</span>
          </div>
          <h1 className="text-5xl font-black text-[var(--text-primary)] tracking-tight">Course Registry</h1>
          <p className="text-[var(--text-muted)] text-lg font-medium mt-3 max-w-lg">
            Manage your academic ecosystems, student enrollments, and performance metrics from one command center.
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsCreating(true)}
          className="notion-btn-primary rounded-2xl px-8 h-14 font-black text-sm shadow-xl shadow-[var(--primary)]/20 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          ESTABLISH NEW COURSE
        </motion.button>
      </motion.div>

      {/* Control Bar */}
      <motion.div variants={item} className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors" />
          <input 
            type="text" 
            placeholder="Search academic catalog by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="notion-input pl-14 py-4 rounded-2xl border-[var(--border-regular)] focus:border-[var(--primary)] bg-white/50 backdrop-blur-sm transition-all"
          />
        </div>
        <button className="notion-btn-ghost h-14 rounded-2xl px-6 font-bold text-xs gap-3">
          <Filter size={16} />
          ACTIVE FILTERS
        </button>
      </motion.div>

      {/* Classes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 rounded-[2.5rem] bg-white border border-[var(--border)] animate-pulse shadow-sm" />
          ))}
        </div>
      ) : filteredClasses.length === 0 ? (
        <motion.div 
          variants={item}
          className="py-32 flex flex-col items-center justify-center border-4 border-dashed border-[var(--border)] rounded-[4rem] bg-[var(--surface)]/10"
        >
          <div className="w-24 h-24 rounded-[2rem] bg-white shadow-xl flex items-center justify-center mb-8 rotate-6">
            <BookOpen size={48} className="text-[var(--border)]" />
          </div>
          <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Academic Catalog Empty</h3>
          <p className="text-[var(--text-muted)] mt-2 font-medium max-w-sm text-center">Establish your first course to begin tracking student participation and performance data.</p>
          <button 
            onClick={() => setIsCreating(true)}
            className="mt-10 notion-btn-primary rounded-2xl px-10 h-14 font-black shadow-lg shadow-[var(--primary)]/20"
          >
            GET STARTED
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls, idx) => (
            <motion.div 
              key={cls.id}
              variants={item}
              whileHover={{ y: -8, scale: 1.01 }}
              onClick={() => {
                setSelectedClass(cls);
                loadStudents(cls.id);
              }}
              className="group bg-white border border-[var(--border)] rounded-[2.5rem] p-8 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] transition-all cursor-pointer flex flex-col relative overflow-hidden"
            >
              {/* Card Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] opacity-[0.02] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              
              <div className="flex items-center justify-between mb-8">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                  idx % 3 === 0 ? "bg-blue-50 text-blue-600" : idx % 3 === 1 ? "bg-indigo-50 text-indigo-600" : "bg-teal-50 text-teal-600"
                )}>
                  <BookOpen size={24} />
                </div>
                <div className="px-3 py-1 rounded-full bg-[var(--surface-hover)] text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest border border-white">
                  Spring 2024
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight group-hover:text-[var(--primary)] transition-colors mb-2">{cls.name}</h3>
                <p className="text-[var(--text-muted)] text-sm font-medium leading-relaxed line-clamp-3">
                  {cls.description || 'General course registry with active student enrollment tracking enabled.'}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--border-regular)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-lg bg-[var(--surface-hover)] border-2 border-white flex items-center justify-center text-[8px] font-bold">
                        {String.fromCharCode(64 + idx + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Enrolled</span>
                </div>
                <ArrowRight size={18} className="text-[var(--text-muted)] group-hover:translate-x-2 group-hover:text-[var(--primary)] transition-all" />
              </div>
            </motion.div>
          ))}
          
          {/* Create Shortcut Card */}
          <motion.div 
            variants={item}
            onClick={() => setIsCreating(true)}
            className="border-4 border-dashed border-[var(--border)] rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 group hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/[0.02] transition-all cursor-pointer text-center"
          >
            <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-[var(--border)] flex items-center justify-center group-hover:shadow-md transition-all">
              <Plus size={32} className="text-[var(--border)] group-hover:text-[var(--primary)] transition-colors" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-black text-[var(--text-primary)] tracking-tight uppercase">New Module</span>
              <span className="text-[10px] font-bold text-[var(--text-muted)] mt-1 opacity-60">ADD TO REGISTRY</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white border border-[var(--border)] rounded-[3rem] shadow-[0_32px_64px_rgba(0,0,0,0.15)] w-full max-w-lg overflow-hidden"
            >
              <div className="px-10 py-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--primary-bg)] flex items-center justify-center">
                    <BookOpen size={24} className="text-[var(--primary)]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Establish Course</h2>
                    <p className="text-[var(--text-muted)] font-medium text-sm">Initialize a new academic environment.</p>
                  </div>
                </div>
                
                <form onSubmit={handleCreateClass} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Course Designation</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Advanced Web Architecture"
                      required
                      autoFocus
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      className="notion-input py-4 px-6 rounded-2xl border-[var(--border-regular)] text-lg font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Registry Context (Optional)</label>
                    <textarea 
                      placeholder="Provide session times, syllabus summary, or semester goals..."
                      value={newClassDesc}
                      onChange={(e) => setNewClassDesc(e.target.value)}
                      className="notion-input min-h-[120px] resize-none py-4 px-6 rounded-2xl border-[var(--border-regular)]"
                    />
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="notion-btn-ghost flex-1 h-14 rounded-2xl font-bold"
                    >Discard</button>
                    <button 
                      type="submit"
                      disabled={createLoading}
                      className="notion-btn-primary flex-1 h-14 rounded-2xl font-black shadow-lg shadow-[var(--primary)]/20"
                    >
                      {createLoading ? <Loader2 size={24} className="animate-spin" /> : 'INITIALIZE'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
