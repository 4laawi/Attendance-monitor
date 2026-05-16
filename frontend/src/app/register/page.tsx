'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, User, Zap, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2, GraduationCap, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        router.refresh();
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return <div className="min-h-screen bg-[var(--background)]" />;

  return (
    <div className="min-h-screen bg-[var(--background)] relative flex items-center justify-center p-6 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[var(--primary)] opacity-[0.03] blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-[var(--info)] opacity-[0.03] blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.01]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[480px]"
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20 -rotate-3 hover:rotate-0 transition-transform">
              <Zap size={24} className="text-white" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-2xl font-black tracking-tight text-[var(--text-primary)]">PFE Hub</span>
              <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest leading-none">Identity Management</span>
            </div>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight"
          >
            Begin your academic journey
          </motion.h2>
        </div>

        {/* Register Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-[var(--border)] rounded-[2.5rem] p-8 md:p-10 shadow-[var(--shadow-lg)] relative overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
            {/* Identity Group */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                  className="notion-input px-4 py-3 rounded-xl border-[var(--border-regular)] focus:border-[var(--primary)] transition-all bg-[var(--surface)]/30 focus:bg-white"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="notion-input px-4 py-3 rounded-xl border-[var(--border-regular)] focus:border-[var(--primary)] transition-all bg-[var(--surface)]/30 focus:bg-white"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Identify As</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'student', label: 'Student', icon: GraduationCap },
                  { id: 'teacher', label: 'Teacher', icon: Users },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id as any)}
                    className={cn(
                      "flex items-center justify-center gap-2.5 py-3 rounded-xl border-2 transition-all font-bold text-sm",
                      role === item.id 
                        ? "bg-[var(--primary)]/5 border-[var(--primary)] text-[var(--primary)] shadow-sm" 
                        : "bg-white border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-regular)]"
                    )}
                  >
                    <item.icon size={16} />
                    {item.label}
                    {role === item.id && <CheckCircle2 size={12} className="ml-auto mr-1 animate-in zoom-in" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Credentials */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">University Email</label>
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.doe@university.edu"
                  className="notion-input pl-12 py-3.5 rounded-xl border-[var(--border-regular)] focus:border-[var(--primary)] transition-all bg-[var(--surface)]/30 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Security Code</label>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="notion-input pl-12 pr-12 py-3.5 rounded-xl border-[var(--border-regular)] focus:border-[var(--primary)] transition-all bg-[var(--surface)]/30 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors z-20"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3.5 bg-[var(--danger-bg)] border border-[var(--danger)]/20 rounded-xl text-[var(--danger)] text-[11px] font-bold flex gap-3 items-center"
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="notion-btn-primary w-full justify-center py-4 rounded-2xl text-sm font-bold shadow-xl shadow-[var(--primary)]/20 mt-2 relative overflow-hidden group"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Loader2 size={20} className="animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    Initialize Identity <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          <div className="mt-8 pt-8 border-t border-[var(--border)] text-center">
            <p className="text-sm text-[var(--text-muted)] font-medium">
              Existing member? <Link href="/login" className="text-[var(--primary)] font-bold hover:underline">Log in to Hub</Link>
            </p>
          </div>
        </motion.div>

        {/* Security Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] opacity-40">
              <ShieldCheck size={12} />
              <span>University Verified</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-[var(--border)] opacity-40" />
            <div className="flex items-center gap-1.5 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] opacity-40">
              <CheckCircle2 size={12} />
              <span>GDPR Compliant</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
