import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Gracefully handle missing environment variables
// This allows the app to work in localStorage-only mode during development
const isMissingConfig = !supabaseUrl || !supabaseAnonKey;

if (isMissingConfig) {
  console.warn(
    'Supabase environment variables not configured. Running in localStorage-only mode.\n' +
    'To enable cloud sync, copy .env.local.example to .env.local and add your Supabase credentials.'
  );
}

// Create the client only if config is available
let supabaseClient: SupabaseClient<Database> | null = null;

if (!isMissingConfig) {
  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabase = supabaseClient;

/**
 * Check if Supabase is configured and available
 */
export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}
