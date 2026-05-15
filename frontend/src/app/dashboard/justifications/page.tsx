'use client';

import React, { useState } from 'react';
import { FileText, Check, X, Clock, Eye, Upload, Filter, Search } from 'lucide-react';

const mockJustifications = [
  { id: '1', student: 'Sarah Williams', class: 'Math 101', date: '2026-05-08', reason: 'Medical appointment – provided doctor certificate', status: 'PENDING', document: true },
  { id: '2', student: 'James Wilson', class: 'CS Algorithms', date: '2026-05-07', reason: 'Family emergency', status: 'APPROVED', document: false },
  { id: '3', student: 'Marcus Johnson', class: 'Physics 201', date: '2026-05-06', reason: 'Car breakdown', status: 'REJECTED', document: true },
  { id: '4', student: 'Lena Fischer', class: 'Business Law', date: '2026-05-05', reason: 'Sick leave – fever and flu symptoms', status: 'PENDING', document: true },
  { id: '5', student: 'Omar Hassan', class: 'Art History', date: '2026-05-04', reason: 'University sports competition', status: 'APPROVED', document: true },
  { id: '6', student: 'Priya Sharma', class: 'Data Structures', date: '2026-05-03', reason: 'Religious holiday observance', status: 'PENDING', document: false },
];

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'var(--warning)', bg: 'var(--warning-bg)', border: 'oklch(var(--accent-raw) / 0.3)' },
  APPROVED: { label: 'Approved', color: 'var(--success)', bg: 'var(--success-bg)', border: 'oklch(var(--primary-raw) / 0.3)' },
  REJECTED: { label: 'Rejected', color: 'var(--error)', bg: 'var(--error-bg)', border: 'oklch(20% 0.18 20 / 0.3)' },
};

export default function JustificationsPage() {
  const [justifications, setJustifications] = useState(mockJustifications);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = justifications.filter(j => {
    const matchStatus = filterStatus === 'ALL' || j.status === filterStatus;
    const matchSearch = j.student.toLowerCase().includes(search.toLowerCase()) || j.reason.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
    setJustifications(prev => prev.map(j => j.id === id ? { ...j, status: action } : j));
    setSelectedId(null);
  };

  const pending = justifications.filter(j => j.status === 'PENDING').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent), var(--primary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px oklch(var(--accent-raw) / 0.4)',
            }}>
              <FileText size={18} color="black" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.04em' }}>
              Justifications
            </h1>
          </div>
          <p style={{ color: 'oklch(100% 0 0 / 0.4)', fontSize: '0.875rem' }}>Review and approve absence justification requests</p>
        </div>
        {pending > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--warning-bg)', border: '1px solid oklch(var(--accent-raw) / 0.25)',
            borderRadius: '12px', padding: '10px 16px',
          }}>
            <Clock size={16} color="var(--warning)" />
            <span style={{ color: 'var(--warning)', fontWeight: 700, fontSize: '0.875rem' }}>
              {pending} pending review{pending !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: '12px', flexWrap: 'wrap',
        background: 'rgba(15,23,42,0.6)', borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.06)', padding: '16px',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={15} color="#475569" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by student or reason…"
            style={{
              width: '100%', paddingLeft: '38px', paddingRight: '16px',
              paddingTop: '10px', paddingBottom: '10px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px', color: '#e2e8f0', fontSize: '0.875rem', outline: 'none',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '8px 14px', borderRadius: '10px',
                background: filterStatus === status ? 'var(--info-bg)' : 'oklch(100% 0 0 / 0.03)',
                border: `1px solid ${filterStatus === status ? 'oklch(var(--secondary-raw) / 0.4)' : 'var(--card-border)'}`,
                color: filterStatus === status ? 'var(--info)' : 'oklch(100% 0 0 / 0.4)',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: filterStatus === status ? 700 : 500,
                transition: 'all 0.2s',
              }}
            >
              {status === 'ALL' ? 'All' : STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].label}
              {status === 'PENDING' && pending > 0 && (
                <span style={{
                  marginLeft: '6px', background: 'var(--warning)', color: '#000',
                  borderRadius: '100px', padding: '1px 6px', fontSize: '0.65rem', fontWeight: 800,
                }}>
                  {pending}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map(j => {
          const conf = STATUS_CONFIG[j.status as keyof typeof STATUS_CONFIG];
          const isSelected = selectedId === j.id;
          return (
            <div key={j.id} style={{
              background: 'var(--card-bg)', borderRadius: '16px',
              border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--card-border)'}`,
              overflow: 'hidden', backdropFilter: 'blur(12px)',
              transition: 'all 0.2s',
            }}>
              {/* Main row */}
              <div style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                alignItems: 'center', padding: '16px 20px', gap: '16px',
              }}>
                {/* Student info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: `${conf.bg}`, border: `1px solid ${conf.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.875rem', fontWeight: 700, color: conf.color, flexShrink: 0,
                  }}>
                    {j.student.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.875rem' }}>{j.student}</p>
                    <p style={{ fontSize: '0.75rem', color: '#334155' }}>{j.class} · {j.date}</p>
                  </div>
                </div>

                {/* Reason */}
                <p style={{ fontSize: '0.8rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {j.reason}
                </p>

                {/* Document */}
                <div>
                  {j.document ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '4px 10px', borderRadius: '100px',
                      background: 'var(--info-bg)', border: '1px solid oklch(var(--secondary-raw) / 0.2)',
                      color: 'var(--info)', fontSize: '0.7rem', fontWeight: 700,
                    }}>
                      <Upload size={10} />
                      Document
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: '#334155' }}>No document</span>
                  )}
                </div>

                {/* Status */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '4px 10px', borderRadius: '100px',
                  background: conf.bg, border: `1px solid ${conf.border}`,
                  color: conf.color, fontSize: '0.7rem', fontWeight: 700,
                }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: conf.color }} />
                  {conf.label}
                </span>

                {/* Actions */}
                <button
                  onClick={() => setSelectedId(isSelected ? null : j.id)}
                  style={{
                    padding: '8px 14px', borderRadius: '10px',
                    background: isSelected ? 'var(--primary-glow)' : 'oklch(100% 0 0 / 0.04)',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--card-border)'}`,
                    color: isSelected ? 'var(--primary)' : 'oklch(100% 0 0 / 0.4)',
                    cursor: 'pointer', fontSize: '0.8rem', display: 'flex',
                    alignItems: 'center', gap: '6px',
                  }}
                >
                  <Eye size={13} />
                  {isSelected ? 'Close' : 'Review'}
                </button>
              </div>

              {/* Expanded review panel */}
              {isSelected && (
                <div style={{
                  padding: '16px 20px 20px',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(139,92,246,0.04)',
                }}>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.6 }}>
                    <strong style={{ color: '#c4b5fd' }}>Full reason: </strong>{j.reason}
                  </p>
                  {j.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleAction(j.id, 'APPROVED')}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '10px 20px', borderRadius: '10px',
                          background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                          color: '#10b981', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
                          transition: 'all 0.2s',
                        }}
                      >
                        <Check size={14} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(j.id, 'REJECTED')}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '10px 20px', borderRadius: '10px',
                          background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                          color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
                          transition: 'all 0.2s',
                        }}
                      >
                        <X size={14} />
                        Reject
                      </button>
                    </div>
                  )}
                  {j.status !== 'PENDING' && (
                    <p style={{ 
                      fontSize: '0.8rem', color: conf.color, fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                      {j.status === 'APPROVED' ? <Check size={14} /> : <X size={14} />}
                      This justification has been {conf.label.toLowerCase()}.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        input::placeholder { color: #334155; }
      `}</style>
    </div>
  );
}
