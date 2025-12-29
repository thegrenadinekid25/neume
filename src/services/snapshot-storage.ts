import type { Snapshot, SnapshotInput } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * SnapshotStorage manages persisting snapshots to localStorage
 */
class SnapshotStorage {
  private readonly STORAGE_KEY = 'neume-snapshots';

  /**
   * Get all snapshots
   */
  getAll(): Snapshot[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to parse snapshots from localStorage:', error);
      return [];
    }
  }

  /**
   * Get a single snapshot by ID
   */
  getById(id: string): Snapshot | null {
    const snapshots = this.getAll();
    return snapshots.find((s) => s.id === id) || null;
  }

  /**
   * Save a new snapshot or update existing
   */
  save(input: SnapshotInput): Snapshot {
    const snapshots = this.getAll();
    const id = uuidv4();
    const now = new Date().toISOString();

    const snapshot: Snapshot = {
      ...input,
      id,
      createdAt: now,
    };

    snapshots.push(snapshot);
    this.persist(snapshots);
    return snapshot;
  }

  /**
   * Update an existing snapshot
   */
  update(id: string, updates: Partial<SnapshotInput> & { usedAt?: string }): Snapshot | null {
    const snapshots = this.getAll();
    const index = snapshots.findIndex((s) => s.id === id);

    if (index === -1) return null;

    const snapshot = snapshots[index];
    const updated: Snapshot = {
      ...snapshot,
      ...updates,
      id: snapshot.id,
      createdAt: snapshot.createdAt,
    };

    snapshots[index] = updated;
    this.persist(snapshots);
    return updated;
  }

  /**
   * Delete a snapshot
   */
  delete(id: string): boolean {
    const snapshots = this.getAll();
    const filtered = snapshots.filter((s) => s.id !== id);

    if (filtered.length === snapshots.length) {
      return false; // Not found
    }

    this.persist(filtered);
    return true;
  }

  /**
   * Persist snapshots to localStorage
   */
  private persist(snapshots: Snapshot[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(snapshots));
    } catch (error) {
      console.error('Failed to persist snapshots to localStorage:', error);
      throw new Error('Failed to save snapshot');
    }
  }
}

export const snapshotStorage = new SnapshotStorage();
