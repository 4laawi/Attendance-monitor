'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, BarChart2, 
  Activity, Users, Calendar, Download
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Cell
} from 'recharts';

const monthlyData = [
  { month: 'Jan', attendance: 88, absences: 145, justifications: 67 },
  { month: 'Feb', attendance: 85, absences: 167, justifications: 80 },
  { month: 'Mar', attendance: 91, absences: 112, justifications: 54 },
  { month: 'Apr', attendance: 87, absences: 138, justifications: 71 },
  { month: 'May', attendance: 84, absences: 162, justifications: 89 },
  { month: 'Jun', attendance: 79, absences: 201, justifications: 112 },
];

const radarData = [
  { subject: 'CS', A: 92, fullMark: 100 },
  { subject: 'Engineering', A: 85, fullMark: 100 },
  { subject: 'Business', A: 78, fullMark: 100 },
  { subject: 'Arts', A: 88, fullMark: 100 },
  { subject: 'Medicine', A: 95, fullMark: 100 },
  { subject: 'Law', A: 81, fullMark: 100 },
];

const topAbsenceStudents = [
  { name: 'Marcus Johnson', absences: 18, rate: '32%', trend: 'up' },
  { name: 'Lena Fischer', absences: 15, rate: '27%', trend: 'up' },
  { name: 'Omar Hassan', absences: 13, rate: '23%', trend: 'down' },
  { name: 'Priya Sharma', absences: 11, rate: '20%', trend: 'down' },
  { name: 'Chen Wei', absences: 10, rate: '18%', trend: 'up' },
];

const classPerformance = [
  { class: 'CS-301', rate: 94, students: 32 },
  { class: 'ENG-201', rate: 88, students: 28 },
  { class: 'BIZ-101', rate: 76, students: 40 },
  { class: 'ART-202', rate: 91, students: 24 },
  { class: 'MED-301', rate: 97, students: 20 },
  { class: 'LAW-101', rate: 83, students: 36 },
];

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'semester' | 'month' | 'week'>('semester');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--info), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px oklch(var(--secondary-raw) / 0.4)',
            }}>
              <BarChart2 size={18} color="black" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.04em' }}>
              Analytics
            </h1>
          </div>
          <p style={{ color: 'oklch(100% 0 0 / 0.4)', fontSize: '0.875rem' }}>Comprehensive attendance analytics and insights</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['week', 'month', 'semester'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              style={{
                padding: '8px 16px', borderRadius: '10px',
                background: selectedPeriod === period ? 'var(--info-bg)' : 'oklch(100% 0 0 / 0.03)',
                border: `1px solid ${selectedPeriod === period ? 'oklch(var(--secondary-raw) / 0.4)' : 'var(--card-border)'}`,
                color: selectedPeriod === period ? 'var(--info)' : 'oklch(100% 0 0 / 0.4)',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: selectedPeriod === period ? 700 : 500,
                textTransform: 'capitalize', transition: 'all 0.2s',
              }}
            >
              {period}
            </button>
          ))}
          <button style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#475569', cursor: 'pointer', fontSize: '0.8rem',
          }}>
            <Download size={13} />
            Export
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Avg. Attendance', value: '84.2%', change: '+2.1%', positive: true, icon: Activity, color: 'var(--info)' },
          { label: 'Total Sessions', value: '1,847', change: '+8.3%', positive: true, icon: Calendar, color: 'var(--success)' },
          { label: 'At-Risk Students', value: '38', change: '+5', positive: false, icon: Users, color: 'var(--warning)' },
          { label: 'Justified Absences', value: '68%', change: '+3.2%', positive: true, icon: TrendingUp, color: 'var(--accent)' },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} style={{
              background: 'var(--card-bg)', borderRadius: '16px',
              border: '1px solid var(--card-border)', padding: '20px',
              backdropFilter: 'blur(12px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <Icon size={18} color={kpi.color} />
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '100px',
                  background: kpi.positive ? 'var(--success-bg)' : 'var(--error-bg)',
                  color: kpi.positive ? 'var(--success)' : 'var(--error)',
                }}>
                  {kpi.change}
                </span>
              </div>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: kpi.color, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.04em' }}>
                {kpi.value}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '4px' }}>{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.25rem' }}>
        {/* Monthly Trend */}
        <div style={{
          background: 'rgba(15,23,42,0.6)', borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.06)', padding: '24px',
          backdropFilter: 'blur(12px)',
        }}>
          <h3 style={{ fontWeight: 700, color: '#fff', fontFamily: 'Outfit, sans-serif', marginBottom: '4px' }}>
            Monthly Attendance vs Absences
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'oklch(100% 0 0 / 0.4)', marginBottom: '24px' }}>6-month overview</p>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#334155', fontSize: 11}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#334155', fontSize: 11}} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', color: '#f1f5f9', fontSize: '0.8rem',
                  }}
                />
                <Line type="monotone" dataKey="attendance" name="Attendance %" stroke="oklch(var(--secondary-raw))" strokeWidth={2.5} dot={{ fill: 'oklch(var(--secondary-raw))', r: 4 }} />
                <Line type="monotone" dataKey="absences" name="Absences" stroke="var(--error)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div style={{
          background: 'rgba(15,23,42,0.6)', borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.06)', padding: '24px',
          backdropFilter: 'blur(12px)',
        }}>
          <h3 style={{ fontWeight: 700, color: '#f1f5f9', fontFamily: 'Outfit, sans-serif', marginBottom: '4px' }}>
            Department Radar
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '12px' }}>Attendance by department</p>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{fill: '#334155', fontSize: 10}} />
                <PolarRadiusAxis angle={30} domain={[60, 100]} tick={{fill: 'oklch(100% 0 0 / 0.2)', fontSize: 9}} />
                <Radar name="Attendance" dataKey="A" stroke="var(--success)" fill="var(--success)" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: '1.25rem' }}>
        {/* Top Absent Students */}
        <div style={{
          background: 'rgba(15,23,42,0.6)', borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.06)', padding: '24px',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontWeight: 700, color: '#f1f5f9', fontFamily: 'Outfit, sans-serif', marginBottom: '2px' }}>
                At-Risk Students
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#475569' }}>Highest absence rates</p>
            </div>
            <span style={{
              padding: '4px 10px', borderRadius: '100px', fontSize: '0.7rem',
              background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 700,
            }}>
              ⚠ Alert
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topAbsenceStudents.map((student, i) => (
              <div key={student.name} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '10px',
                background: i === 0 ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${i === 0 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)'}`,
              }}>
                <span style={{ 
                  width: '20px', height: '20px', borderRadius: '6px',
                  background: i < 2 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 800, color: i < 2 ? '#ef4444' : '#f59e0b',
                  flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>{student.name}</p>
                  <p style={{ fontSize: '0.7rem', color: '#334155' }}>{student.absences} absences</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {student.trend === 'up' 
                    ? <TrendingUp size={12} color="#ef4444" />
                    : <TrendingDown size={12} color="#10b981" />
                  }
                  <span style={{ 
                    fontSize: '0.75rem', fontWeight: 700,
                    color: student.trend === 'up' ? '#ef4444' : '#10b981',
                  }}>
                    {student.rate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Class Performance Bar */}
        <div style={{
          background: 'rgba(15,23,42,0.6)', borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.06)', padding: '24px',
          backdropFilter: 'blur(12px)',
        }}>
          <h3 style={{ fontWeight: 700, color: '#f1f5f9', fontFamily: 'Outfit, sans-serif', marginBottom: '4px' }}>
            Class Performance
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '24px' }}>Attendance rate by class</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {classPerformance.map(cls => (
              <div key={cls.class}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>{cls.class}</span>
                    <span style={{ fontSize: '0.7rem', color: '#334155' }}>{cls.students} students</span>
                  </div>
                  <span style={{ 
                    fontSize: '0.8rem', fontWeight: 700,
                    color: cls.rate >= 90 ? '#10b981' : cls.rate >= 80 ? '#f59e0b' : '#ef4444',
                  }}>
                    {cls.rate}%
                  </span>
                </div>
                <div style={{ height: '6px', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '100px', transition: 'width 1s ease',
                    width: `${cls.rate}%`,
                    background: cls.rate >= 90 
                      ? 'linear-gradient(90deg, var(--success), #059669)'
                      : cls.rate >= 80 
                        ? 'linear-gradient(90deg, var(--warning), #d97706)'
                        : 'linear-gradient(90deg, var(--error), #dc2626)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
