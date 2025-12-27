import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { SavedProgression } from '../types';

// Raw database row type (matches Supabase schema)
interface ProgressionRow {
  id: string;
  user_id: string;
  title: string;
  key: string;
  mode: string;
  tempo: number;
  time_signature: string;
  chords: unknown;
  tags: string[];
  is_favorite: boolean;
  notes: string | null;
  annotations: unknown | null;
  analyzed_from: unknown | null;
  build_up_steps: unknown | null;
  created_at: string;
  updated_at: string;
}

/**
 * ProgressionStorage manages persisting chord progressions
 * Uses Supabase when authenticated, falls back to localStorage when not
 */
class ProgressionStorage {
  private readonly LOCAL_STORAGE_KEY = 'neume-progressions';

  /**
   * Check if user is authenticated and return user ID
   */
  private async getAuthenticatedUserId(): Promise<string | null> {
    if (!isSupabaseConfigured() || !supabase) {
      return null;
    }

    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  }

  /**
   * Save a progression (create or update)
   */
  async save(progression: SavedProgression): Promise<void> {
    const userId = await this.getAuthenticatedUserId();

    if (userId) {
      await this.saveToCloud(progression, userId);
    } else {
      this.saveToLocalStorage(progression);
    }
  }

  /**
   * Save to Supabase
   */
  private async saveToCloud(progression: SavedProgression, userId: string): Promise<void> {
    if (!supabase) return;

    const { id, title, key, mode, tempo, timeSignature, chords, tags, isFavorite, notes, annotations, analyzedFrom, buildUpSteps } = progression;

    // Check if exists
    const { data: existing } = await supabase
      .from('progressions')
      .select('id')
      .eq('id', id)
      .single();

    if (existing) {
      // Update existing progression
      const updateData = {
        title,
        key,
        mode,
        tempo,
        time_signature: timeSignature,
        chords: chords as unknown,
        tags,
        is_favorite: isFavorite,
        notes: notes || null,
        annotations: annotations as unknown || [],
        analyzed_from: analyzedFrom as unknown,
        build_up_steps: buildUpSteps as unknown,
      };

      const { error } = await supabase
        .from('progressions')
        .update(updateData as never)
        .eq('id', id);

      if (error) throw error;
    } else {
      // Insert new progression
      const insertData = {
        id,
        user_id: userId,
        title,
        key,
        mode,
        tempo,
        time_signature: timeSignature,
        chords: chords as unknown,
        tags,
        is_favorite: isFavorite,
        notes: notes || null,
        annotations: annotations as unknown || [],
        analyzed_from: analyzedFrom as unknown,
        build_up_steps: buildUpSteps as unknown,
      };

      const { error } = await supabase
        .from('progressions')
        .insert(insertData as never);

      if (error) throw error;
    }
  }

  /**
   * Save to localStorage (fallback)
   */
  private saveToLocalStorage(progression: SavedProgression): void {
    const progressions = this.getFromLocalStorage();
    const index = progressions.findIndex((p) => p.id === progression.id);

    if (index >= 0) {
      progressions[index] = {
        ...progression,
        updatedAt: new Date().toISOString(),
      };
    } else {
      progressions.push(progression);
    }

    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(progressions));
  }

  /**
   * Get all saved progressions
   */
  async getAll(): Promise<SavedProgression[]> {
    const userId = await this.getAuthenticatedUserId();

    if (userId) {
      return this.getFromCloud();
    } else {
      return this.getFromLocalStorage();
    }
  }

  /**
   * Get from Supabase
   */
  private async getFromCloud(): Promise<SavedProgression[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('progressions')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    const rows = (data || []) as unknown as ProgressionRow[];

    return rows.map(row => ({
      id: row.id,
      title: row.title,
      key: row.key,
      mode: row.mode as 'major' | 'minor',
      tempo: row.tempo,
      timeSignature: row.time_signature as SavedProgression['timeSignature'],
      chords: row.chords as SavedProgression['chords'],
      tags: row.tags,
      isFavorite: row.is_favorite,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      notes: row.notes || undefined,
      annotations: row.annotations as SavedProgression['annotations'],
      analyzedFrom: row.analyzed_from as SavedProgression['analyzedFrom'],
      buildUpSteps: row.build_up_steps as SavedProgression['buildUpSteps'],
    }));
  }

  /**
   * Get from localStorage
   */
  private getFromLocalStorage(): SavedProgression[] {
    const data = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Get a single progression by ID
   */
  async getById(id: string): Promise<SavedProgression | null> {
    const userId = await this.getAuthenticatedUserId();

    if (userId && supabase) {
      const { data, error } = await supabase
        .from('progressions')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) return null;

      const row = data as unknown as ProgressionRow;

      return {
        id: row.id,
        title: row.title,
        key: row.key,
        mode: row.mode as 'major' | 'minor',
        tempo: row.tempo,
        timeSignature: row.time_signature as SavedProgression['timeSignature'],
        chords: row.chords as SavedProgression['chords'],
        tags: row.tags,
        isFavorite: row.is_favorite,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        notes: row.notes || undefined,
        annotations: row.annotations as SavedProgression['annotations'],
        analyzedFrom: row.analyzed_from as SavedProgression['analyzedFrom'],
        buildUpSteps: row.build_up_steps as SavedProgression['buildUpSteps'],
      };
    } else {
      const progressions = this.getFromLocalStorage();
      return progressions.find((p) => p.id === id) || null;
    }
  }

  /**
   * Delete a progression by ID
   */
  async delete(id: string): Promise<void> {
    const userId = await this.getAuthenticatedUserId();

    if (userId && supabase) {
      const { error } = await supabase
        .from('progressions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } else {
      const progressions = this.getFromLocalStorage().filter((p) => p.id !== id);
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(progressions));
    }
  }

  /**
   * Search progressions by title and tags
   */
  async search(query: string): Promise<SavedProgression[]> {
    const all = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return all.filter(
      (p) =>
        p.title.toLowerCase().includes(lowerQuery) ||
        p.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get all favorite progressions
   */
  async getFavorites(): Promise<SavedProgression[]> {
    const all = await this.getAll();
    return all.filter((p) => p.isFavorite);
  }

  /**
   * Get recent progressions sorted by updatedAt
   */
  async getRecent(limit = 10): Promise<SavedProgression[]> {
    const all = await this.getAll();
    return all
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }

  /**
   * Migrate localStorage data to cloud after sign in
   */
  async migrateToCloud(userId: string): Promise<{ migrated: number; errors: number }> {
    if (!supabase) {
      return { migrated: 0, errors: 0 };
    }

    const localProgressions = this.getFromLocalStorage();

    if (localProgressions.length === 0) {
      return { migrated: 0, errors: 0 };
    }

    let migrated = 0;
    let errors = 0;

    for (const progression of localProgressions) {
      try {
        await this.saveToCloud(progression, userId);
        migrated++;
      } catch (error) {
        console.error('Migration error for progression:', progression.id, error);
        errors++;
      }
    }

    // Clear localStorage after successful migration
    if (errors === 0) {
      localStorage.removeItem(this.LOCAL_STORAGE_KEY);
    }

    return { migrated, errors };
  }

  /**
   * Get storage usage statistics (for localStorage)
   */
  getLocalStorageUsage(): { used: number; limit: number; percentage: number } {
    const data = localStorage.getItem(this.LOCAL_STORAGE_KEY) || '';
    const used = new Blob([data]).size;
    const limit = 5 * 1024 * 1024; // 5MB typical limit
    return {
      used,
      limit,
      percentage: (used / limit) * 100,
    };
  }

  /**
   * Check if user is authenticated (helper for UI)
   */
  async isAuthenticated(): Promise<boolean> {
    const userId = await this.getAuthenticatedUserId();
    return userId !== null;
  }
}

// Export singleton instance
export const progressionStorage = new ProgressionStorage();
