/**
 * Supabase Database Types
 * Generated for Neume cloud storage
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
        };
      };
      progressions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          key: string;
          mode: string;
          tempo: number;
          time_signature: string;
          chords: unknown; // JSON
          tags: string[];
          is_favorite: boolean;
          analyzed_from: unknown | null;
          build_up_steps: unknown | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          key?: string;
          mode?: string;
          tempo?: number;
          time_signature?: string;
          chords?: unknown;
          tags?: string[];
          is_favorite?: boolean;
          analyzed_from?: unknown | null;
          build_up_steps?: unknown | null;
        };
        Update: {
          title?: string;
          key?: string;
          mode?: string;
          tempo?: number;
          time_signature?: string;
          chords?: unknown;
          tags?: string[];
          is_favorite?: boolean;
          analyzed_from?: unknown | null;
          build_up_steps?: unknown | null;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Progression = Database['public']['Tables']['progressions']['Row'];
export type ProgressionInsert = Database['public']['Tables']['progressions']['Insert'];
export type ProgressionUpdate = Database['public']['Tables']['progressions']['Update'];
