import { Chord } from '@types';

export interface SavedProgression {
  id: string;
  title: string;
  key: string;
  mode: 'major' | 'minor';
  tempo: number;
  chords: Chord[];
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

class ProgressionStorage {
  private readonly STORAGE_KEY = 'neume-progressions';

  save(progression: SavedProgression): void {
    const progressions = this.getAll();

    const index = progressions.findIndex(p => p.id === progression.id);
    if (index >= 0) {
      progressions[index] = {
        ...progression,
        updatedAt: new Date().toISOString()
      };
    } else {
      progressions.push(progression);
    }

    this._writeToStorage(progressions);
  }

  getAll(): SavedProgression[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getById(id: string): SavedProgression | null {
    const progressions = this.getAll();
    return progressions.find(p => p.id === id) || null;
  }

  delete(id: string): void {
    const progressions = this.getAll().filter(p => p.id !== id);
    this._writeToStorage(progressions);
  }

  search(query: string): SavedProgression[] {
    const all = this.getAll();
    const lowerQuery = query.toLowerCase();

    return all.filter(p =>
      p.title.toLowerCase().includes(lowerQuery) ||
      p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  getFavorites(): SavedProgression[] {
    return this.getAll().filter(p => p.isFavorite);
  }

  getRecent(limit = 10): SavedProgression[] {
    return this.getAll()
      .sort((a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
      )
      .slice(0, limit);
  }

  private _writeToStorage(progressions: SavedProgression[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progressions));
    } catch (e) {
      console.error('Failed to save progressions:', e);
      alert('Failed to save progression. Storage may be full.');
    }
  }
}

export const progressionStorage = new ProgressionStorage();
