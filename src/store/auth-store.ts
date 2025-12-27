import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import type { Profile } from '../types/database';

interface AuthState {
  // State
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  error: AuthError | null;

  // Actions
  initialize: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,
  initialized: false,
  error: null,

  initialize: async () => {
    // If Supabase is not configured, skip initialization
    if (!isSupabaseConfigured() || !supabase) {
      set({ loading: false, initialized: true });
      return;
    }

    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (session?.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({
          user: session.user,
          session,
          profile,
          loading: false,
          initialized: true,
        });
      } else {
        set({ loading: false, initialized: true });
      }

      // Listen for auth changes
      supabase!.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user && supabase) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          set({ user: session.user, session, profile });
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, session: null, profile: null });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ loading: false, initialized: true, error: error as AuthError });
    }
  },

  signInWithEmail: async (email, password) => {
    if (!isSupabaseConfigured() || !supabase) {
      const error = { message: 'Cloud features not configured. Please add Supabase credentials.' } as AuthError;
      set({ error });
      return { error };
    }

    set({ loading: true, error: null });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    set({ loading: false, error });
    return { error };
  },

  signUpWithEmail: async (email, password, displayName) => {
    if (!isSupabaseConfigured() || !supabase) {
      const error = { message: 'Cloud features not configured. Please add Supabase credentials.' } as AuthError;
      set({ error });
      return { error };
    }

    set({ loading: true, error: null });

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName,
        },
      },
    });

    set({ loading: false, error });
    return { error };
  },

  signInWithGoogle: async () => {
    if (!isSupabaseConfigured() || !supabase) {
      const error = { message: 'Cloud features not configured. Please add Supabase credentials.' } as AuthError;
      set({ error });
      return { error };
    }

    set({ loading: true, error: null });

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    set({ loading: false, error });
    return { error };
  },

  signOut: async () => {
    if (!isSupabaseConfigured() || !supabase) {
      set({ user: null, session: null, profile: null });
      return;
    }

    set({ loading: true });
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null, loading: false });
  },

  updateProfile: async (updates) => {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: new Error('Cloud features not configured') };
    }

    const { user } = get();
    if (!user) return { error: new Error('Not authenticated') };

    // Extract only the updatable fields
    const updateData: { email?: string | null; display_name?: string | null; avatar_url?: string | null } = {};
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.display_name !== undefined) updateData.display_name = updates.display_name;
    if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url;

    const { error } = await supabase
      .from('profiles')
      .update(updateData as never)
      .eq('id', user.id);

    if (!error) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      set({ profile });
    }

    return { error };
  },

  clearError: () => set({ error: null }),
}));
