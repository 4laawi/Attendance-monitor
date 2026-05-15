'use client';

import React, { useState, useEffect } from 'react';
import { 
  QrCode, UserCheck, Search, RefreshCw, X, Clock, 
  CheckCircle2, Download, BookOpen, ChevronDown, Loader2,
  ArrowLeft, Users, Monitor, MapPin
} from 'lucide-react';
import QRCode from 'qrcode';
import { 
  fetchClasses, createAttendanceSession, fetchAttendanceForSession, 
  closeAttendanceSession,
  type Class, type AttendanceSession, type AttendanceRecord 
} from '@/lib/attendanceService';

export default function AttendancePage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isSummaryMode, setIsSummaryMode] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Load classes on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchClasses();
        setClasses(data);
      } catch (err) {
        console.error('Error loading classes', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Generate QR code when session changes
  useEffect(() => {
    if (session) {
      QRCode.toDataURL(session.token, {
        width: 300,
        margin: 2,
        color: { dark: '#37352f', light: '#ffffff' }
      }).then(url => setQrDataUrl(url))
        .catch(err => console.error('QR Gen error', err));
    }
  }, [session]);

  // Load records for active session
  const loadRecords = async () => {
    if (!session || isClosing || isSummaryMode) return;
    setLoadingRecords(true);
    try {
      const data = await fetchAttendanceForSession(session.id);
      setRecords(data);
    } catch (err) {
      console.error('Error loading records', err);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    if (session && !isSummaryMode) {
      loadRecords();
      const interval = setInterval(loadRecords, 5000); // Auto refresh every 5s
      return () => clearInterval(interval);
    }
  }, [session, isClosing, isSummaryMode]);

  const handleStartSession = async (cls: Class) => {
    setSelectedClass(cls);
    setLoading(true);
    try {
      const newSession = await createAttendanceSession(cls.id);
      setSession(newSession);
      setIsSummaryMode(false);
    } catch (err) {
      console.error('Error creating session', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (session && selectedClass && !isSummaryMode) {
      setIsClosing(true);
      try {
        await closeAttendanceSession(session.id, selectedClass.id);
        // Fetch final records including the newly marked absent ones
        const finalData = await fetchAttendanceForSession(session.id);
        setRecords(finalData);
        setIsSummaryMode(true);
      } catch (err) {
        console.error('Error closing session', err);
        // Fallback: just clear everything if it fails
        resetState();
      } finally {
        setIsClosing(false);
      }
    } else {
      resetState();
    }
  };

  const resetState = () => {
    setSession(null);
    setSelectedClass(null);
    setRecords([]);
    setQrDataUrl('');
    setIsSummaryMode(false);
  };

  const exportCSV = () => {
    if (!records.length) return;
    
    // Format requested: First Name, Last Name, Attended, Absent (Exactly 4 columns)
    const headers = ['First Name', 'Last Name', 'Attended', 'Absent'];
    const rows = records.map(r => {
      // Use profile names if available, otherwise try to split the student_name (which might be an email)
      let firstName = r.student_first_name || '';
      let lastName = r.student_last_name || '';
      
      if (!firstName && !lastName && r.student_name.includes('@')) {
        // If it looks like an email and we have no names, try to extract from email
        const part = r.student_name.split('@')[0];
        const parts = part.split(/[\._]/);
        firstName = parts[0] || 'Unknown';
        lastName = parts.slice(1).join(' ') || '';
      } else if (!firstName && !lastName) {
        const names = r.student_name.split(' ');
        firstName = names[0] || 'Unknown';
        lastName = names.slice(1).join(' ') || '';
      }

      return [
        `"${firstName}"`, 
        `"${lastName}"`, 
        r.status === 'present' ? '"[X]"' : '"[ ]"',
        r.status === 'absent' ? '"[X]"' : '"[ ]"'
      ];
    });

    // Use semicolon (;) as separator for regional Excel compatibility
    // Add UTF-8 BOM (\uFEFF) at the beginning for proper character encoding
    const csvContent = "\uFEFF" + [headers.map(h => `"${h}"`), ...rows].map(e => e.join(";")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_${selectedClass?.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading && classes.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" color="var(--primary)" size={32} />
      </div>
    );
  }

  // --- View 1: Classroom Picker ---
  if (!session) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Attendance Flow</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Select a classroom to generate a secure attendance QR code.
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search for a classroom..."
            className="notion-input"
            style={{ paddingLeft: '40px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredClasses.map((cls) => (
            <div 
              key={cls.id} 
              className="notion-card" 
              style={{ display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer' }}
              onClick={() => handleStartSession(cls)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '8px',
                  background: 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <BookOpen size={20} color="var(--info)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{cls.name}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Classroom</p>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {cls.description || 'No description provided for this classroom.'}
              </p>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '12px' }}>
                  <Users size={14} />
                  <span>Session ready</span>
                </div>
                <button className="notion-btn-primary" style={{ padding: '4px 12px', fontSize: '12px' }}>
                  Select
                </button>
              </div>
            </div>
          ))}
          {filteredClasses.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '8px' }}>
              <p style={{ color: 'var(--text-muted)' }}>No classrooms found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- View 2: Active Session / Summary ---
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            onClick={handleEndSession}
            disabled={isClosing}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '6px', 
              color: 'var(--text-muted)', fontSize: '14px', background: 'none', 
              border: 'none', cursor: 'pointer', padding: 0, width: 'fit-content',
              opacity: isClosing ? 0.5 : 1
            }}
          >
            <ArrowLeft size={14} />
            {isSummaryMode ? 'Back to Classrooms' : 'Cancel & Go Back'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 700 }}>
              {isSummaryMode ? 'Session Summary' : selectedClass?.name}
            </h1>
            <span className="notion-badge" style={{ 
              background: isSummaryMode ? 'var(--surface-hover)' : 'var(--success-bg)', 
              color: isSummaryMode ? 'var(--text-muted)' : 'var(--success)' 
            }}>
              {isSummaryMode ? 'COMPLETED' : 'LIVE SESSION'}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {isSummaryMode 
              ? `Attendance report for ${selectedClass?.name}`
              : 'Students can scan the QR code to mark their attendance.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={exportCSV}
            disabled={records.length === 0}
            className="notion-btn-primary"
            style={{ opacity: records.length === 0 ? 0.5 : 1 }}
          >
            <Download size={16} /> Export CSV Report
          </button>
          {!isSummaryMode ? (
            <button 
              onClick={handleEndSession}
              disabled={isClosing}
              className="notion-btn-ghost"
              style={{ color: 'var(--danger)', opacity: isClosing ? 0.5 : 1 }}
            >
              {isClosing ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Closing...
                </>
              ) : (
                <>
                  <X size={16} /> Stop & Close QR
                </>
              )}
            </button>
          ) : (
            <button 
              onClick={resetState}
              className="notion-btn-ghost"
            >
              Done
            </button>
          )}
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isSummaryMode ? '1fr' : '1fr 1.5fr', 
        gap: '32px' 
      }}>
        {/* Left Column: QR Code (Hidden in Summary Mode) */}
        {!isSummaryMode && (
          <div className="notion-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '32px' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>Scan to Attend</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>QR Code expires in 10 minutes</p>
            </div>

            <div style={{ 
              padding: '16px', background: 'white', borderRadius: '12px', 
              border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)'
            }}>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Session QR Code" style={{ width: '220px', height: '220px', display: 'block' }} />
              ) : (
                <div style={{ width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 className="animate-spin" color="var(--primary)" />
                </div>
              )}
            </div>

            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', 
              background: 'var(--info-bg)', borderRadius: '100px', color: 'var(--info)'
            }}>
              <RefreshCw size={14} className="animate-spin" />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Syncing live...</span>
            </div>
            
            <button 
              onClick={() => setShowQRModal(true)}
              className="notion-btn-ghost"
              style={{ fontSize: '13px', textDecoration: 'underline' }}
            >
              Open Fullscreen
            </button>
          </div>
        )}

        {/* Right Column: Stats & Records */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
            <div className="notion-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck size={18} color="var(--success)" />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Present</p>
                <p style={{ fontSize: '20px', fontWeight: 700 }}>{records.filter(r => r.status === 'present').length}</p>
              </div>
            </div>

            {isSummaryMode && (
              <div className="notion-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={18} color="var(--danger)" />
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Absent</p>
                  <p style={{ fontSize: '20px', fontWeight: 700 }}>{records.filter(r => r.status === 'absent').length}</p>
                </div>
              </div>
            )}

            <div className="notion-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} color="var(--info)" />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{isSummaryMode ? 'Session Time' : 'Started'}</p>
                <p style={{ fontSize: '14px', fontWeight: 600 }}>
                  {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>

          {/* Records Table */}
          <div className="notion-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600 }}>
                {isSummaryMode ? 'Final Attendance Report' : 'Checked-in Students'}
              </h3>
              {loadingRecords && <Loader2 size={14} className="animate-spin" color="var(--text-muted)" />}
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {records.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Waiting for students to scan the QR code...</p>
                </div>
              ) : (
                <table className="notion-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ 
                              width: '24px', height: '24px', borderRadius: '4px', background: 'var(--surface-hover)', 
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 
                            }}>
                              {r.student_name[0]}
                            </div>
                            <span>{r.student_name}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {r.status === 'present' 
                            ? new Date(r.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                            : '—'}
                        </td>
                        <td>
                          <span style={{ 
                            padding: '2px 8px', 
                            borderRadius: '100px', 
                            background: r.status === 'present' ? 'var(--success-bg)' : 'var(--danger-bg)', 
                            color: r.status === 'present' ? 'var(--success)' : 'var(--danger)', 
                            fontSize: '11px', 
                            fontWeight: 600,
                            textTransform: 'uppercase'
                          }}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen QR Modal */}
      {showQRModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(10px)',
          padding: '40px',
        }}>
          <button 
            onClick={() => setShowQRModal(false)}
            className="notion-btn-ghost"
            style={{ position: 'absolute', top: '40px', right: '40px' }}
          >
            <X size={24} />
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', textAlign: 'center', maxWidth: '600px' }}>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Scan to mark attendance</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>{selectedClass?.name}</p>
            </div>
            
            <div style={{ 
              padding: '24px', background: 'white', borderRadius: '24px', 
              boxShadow: '0 20px 50px rgba(0,0,0,0.1)', border: '1px solid var(--border)'
            }}>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Session QR Code" style={{ width: '400px', height: '400px', display: 'block' }} />
              ) : (
                <div style={{ width: '400px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 className="animate-spin" color="var(--primary)" size={48} />
                </div>
              )}
            </div>

            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', 
              background: 'var(--success-bg)', borderRadius: '100px', color: 'var(--success)'
            }}>
              <CheckCircle2 size={20} />
              <span style={{ fontSize: '16px', fontWeight: 700 }}>Active session — scanning enabled</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
