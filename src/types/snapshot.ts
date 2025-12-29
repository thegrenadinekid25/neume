import type { ChordQuality, ChordExtensions, MusicalKey, Mode, Voices } from './index';

export interface SnapshotSource {
  type: 'analyzed' | 'composed' | 'library';
  pieceTitle?: string;
  composer?: string;
  progressionName?: string;
  beatRange?: { start: number; end: number };
}

export interface SnapshotChord {
  scaleDegree: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  quality: ChordQuality;
  extensions: ChordExtensions;
  duration: number;
  voices?: Voices;
  relativeBeat: number;
}

export interface Snapshot {
  id: string;
  name: string;
  description?: string;
  chords: SnapshotChord[];
  originalKey: MusicalKey;
  originalMode: Mode;
  originalTempo: number;
  source: SnapshotSource;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  usedAt?: string;
}

export type SnapshotInput = Omit<Snapshot, 'id' | 'createdAt' | 'usedAt'>;
