'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, UserCheck, QrCode,
  LogOut, Menu, X, ChevronRight, Zap, Users, Search, Bell,
  Settings, HelpCircle, Command, MoreHorizontal
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', roles: ['teacher', 'student'] },
  { icon: Users, label: 'Classes', href: '/dashboard/classes', roles: ['teacher'] },
  { icon: UserCheck, label: 'Attendance', href: '/dashboard/attendance', roles: ['teacher'] },
  { icon: QrCode, label: 'Scan QR', href: '/dashboard/scan', roles: ['student'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, loadUser, logout } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user]);

  const currentPage = sidebarItems.find(item =>
    item.href === pathname || (item.href !== '/dashboard' && pathname.startsWith(item.href))
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-[var(--border)] border-t-[var(--primary)] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap size={16} className="text-[var(--primary)]" />
            </div>
          </div>
          <p className="text-sm font-medium text-[var(--text-muted)] animate-pulse">Initializing your workspace...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-[var(--surface)] border-r border-[var(--border)] z-50 flex flex-col transition-transform duration-300 lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Workspace Picker */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--surface-hover)] cursor-pointer transition-colors group flex-1">
            <div className="h-6 w-6 rounded bg-[var(--text-primary)] text-white flex items-center justify-center text-[10px] font-bold shadow-sm group-hover:scale-105 transition-transform">
              {user?.firstName?.[0] || 'S'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate leading-tight">
                {user?.firstName || 'User'}'s PFE Hub
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">
                {user?.role || 'Member'}
              </span>
            </div>
            <MoreHorizontal size={14} className="ml-auto text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-muted)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Global Tools */}
        <div className="px-4 py-2 flex flex-col gap-0.5">
          {[
            { icon: Search, label: 'Search', shortcut: '⌘K' },
            { icon: Bell, label: 'Notifications', count: 2 },
            { icon: Settings, label: 'Settings' },
          ].map((item) => (
            <div 
              key={item.label}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-md hover:bg-[var(--surface-hover)] cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all group"
            >
              <item.icon size={16} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{item.label}</span>
              {item.shortcut && <span className="ml-auto text-[10px] font-mono text-[var(--text-muted)]/50">{item.shortcut}</span>}
              {item.count && <span className="ml-auto h-4 w-4 rounded-full bg-[var(--primary)] text-white text-[9px] flex items-center justify-center font-bold">{item.count}</span>}
            </div>
          ))}
        </div>

        {/* Navigation Section */}
        <div className="mt-6 px-4">
          <h3 className="px-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 opacity-60">Main</h3>
          <nav className="flex flex-col gap-0.5">
            {sidebarItems
              .filter(item => item.roles.includes(user?.role || 'student'))
              .map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-all group",
                      isActive 
                        ? "bg-[var(--background)] text-[var(--text-primary)] shadow-sm border border-[var(--border)]" 
                        : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <Icon size={16} className={cn("transition-transform group-hover:scale-110", isActive ? "text-[var(--primary)]" : "opacity-70")} />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="ml-auto w-1 h-1 rounded-full bg-[var(--primary)]"
                      />
                    )}
                  </Link>
                );
              })}
          </nav>
        </div>

        {/* Secondary Section */}
        <div className="mt-6 px-4">
          <h3 className="px-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 opacity-60">Support</h3>
          <nav className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--surface-hover)] cursor-pointer transition-all group">
              <HelpCircle size={16} className="opacity-70 group-hover:scale-110 transition-transform" />
              <span>Help Center</span>
            </div>
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-[var(--border)]">
          <button
            onClick={logout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] transition-all group"
          >
            <LogOut size={16} className="opacity-70 group-hover:translate-x-1 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 lg:ml-64 relative">
        {/* Top Header */}
        <header className="h-14 sticky top-0 z-30 bg-white/80 backdrop-blur-md border-bottom border-[var(--border)] flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-muted)]"
            >
              <Menu size={20} />
            </button>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[var(--text-muted)] font-medium">SmartAttend</span>
              <ChevronRight size={14} className="text-[var(--text-muted)]/30" />
              <span className="text-[var(--text-primary)] font-semibold">
                {currentPage?.label || 'Overview'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-[var(--surface)] border border-[var(--border)] rounded-full px-3 py-1.5 gap-2 text-[var(--text-muted)] cursor-pointer hover:border-[var(--text-muted)]/30 transition-colors">
              <Command size={12} />
              <span className="text-xs font-medium">Search anything...</span>
            </div>
            
            <div className="h-8 w-8 rounded-full bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center text-[var(--text-primary)] cursor-pointer hover:bg-[var(--surface)] transition-colors relative">
              <Bell size={16} />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-[var(--danger)] border-2 border-white" />
            </div>
          </div>
        </header>

        {/* Page Container */}
        <div className="flex-1 overflow-y-auto">
          <motion.div 
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" as const }}
            className="max-w-[1100px] mx-auto px-6 py-10 w-100"
          >
            {user ? children : null}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
