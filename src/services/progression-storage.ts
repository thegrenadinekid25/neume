import type { SavedProgression } from '../types';

/**
 * ProgressionStorage manages persisting chord progressions to localStorage
 */
class ProgressionStorage {
  private readonly STORAGE_KEY = 'neume-progressions';

  /**
   * Save a progression (create or update)
   */
  save(progression: SavedProgression): void {
    const progressions = this.getAll();

    // Check if updating existing
    const index = progressions.findIndex((p) => p.id === progression.id);
    if (index >= 0) {
      progressions[index] = {
        ...progression,
        updatedAt: new Date().toISOString(),
      };
    } else {
      progressions.push(progression);
    }

    this._writeToStorage(progressions);
  }

  /**
   * Get all saved progressions
   */
  getAll(): SavedProgression[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Get a single progression by ID
   */
  getById(id: string): SavedProgression | null {
    const progressions = this.getAll();
    return progressions.find((p) => p.id === id) || null;
  }

  /**
   * Delete a progression by ID
   */
  delete(id: string): void {
    const progressions = this.getAll().filter((p) => p.id !== id);
    this._writeToStorage(progressions);
  }

  /**
   * Search progressions by title and tags
   */
  search(query: string): SavedProgression[] {
    const all = this.getAll();
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
  getFavorites(): SavedProgression[] {
    return this.getAll().filter((p) => p.isFavorite);
  }

  /**
   * Get recent progressions sorted by updatedAt
   */
  getRecent(limit = 10): SavedProgression[] {
    return this.getAll()
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, limit);
  }

  /**
   * Get storage usage statistics
   */
  getStorageUsage(): { used: number; limit: number; percentage: number } {
    const data = localStorage.getItem(this.STORAGE_KEY) || '';
    const used = new Blob([data]).size;
    const limit = 5 * 1024 * 1024; // 5MB typical limit

    return {
      used,
      limit,
      percentage: (used / limit) * 100,
    };
  }

  /**
   * Private method to persist data to localStorage
   */
  private _writeToStorage(progressions: SavedProgression[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progressions));
  }
}

// Export singleton instance
export const progressionStorage = new ProgressionStorage();
