import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'teacher' | 'student';
  classId?: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),

  loadUser: async () => {
    set({ loading: true });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      set({ user: null, loading: false });
      return;
    }

    // Load profile from app_profiles table
    const { data: profile } = await supabase
      .from('app_profiles')
      .select('first_name, last_name, role, class_id')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      set({
        user: {
          id: session.user.id,
          email: session.user.email!,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          role: profile.role as 'teacher' | 'student',
          classId: profile.class_id,
        },
        loading: false,
      });
    } else {
      // Fallback: use email if no profile yet
      set({
        user: {
          id: session.user.id,
          email: session.user.email!,
          firstName: session.user.email!.split('@')[0],
          lastName: '',
          role: 'student',
        },
        loading: false,
      });
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
    window.location.href = '/login';
  },
}));
