# Week 5 Prompt 004: My Progressions System

## Objective
Complete save/load/organize system for chord progressions using localStorage with beautiful UI and robust data management.

## Requirements

### Save Flow

**Trigger:** Button in header or canvas: [💾 Save]

**Save Dialog**
```
┌─────────────────────────────────────────┐
│  Save Progression                  [×]  │
├─────────────────────────────────────────┤
│                                         │
│  Title: [________________]              │
│  (e.g., "My Sacred Progression")        │
│                                         │
│  Tags: [______] (comma-separated)       │
│  (e.g., "ethereal, Lauridsen-style")    │
│                                         │
│  ☐ Add to favorites                     │
│                                         │
│  [Cancel]  [Save]                       │
│                                         │
└─────────────────────────────────────────┘
```

### My Progressions Modal

**Trigger:** Button in header: "My Progressions"

**Modal Layout**
```
┌───────────────────────────────────────────────┐
│  My Progressions                         [×]  │
├───────────────────────────────────────────────┤
│  [Search...] [All▼] [Favorites] [Recent]     │
├───────────────────────────────────────────────┤
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │ ⭐ My Sacred Progression                │ │
│  │ D major • 66 BPM • 8 chords             │ │
│  │ Tags: ethereal, Lauridsen-style         │ │
│  │ Saved: Nov 30, 2024                     │ │
│  │ [Load] [Edit] [Export MIDI] [Delete]   │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │ Canon Progression                       │ │
│  │ C major • 120 BPM • 12 chords           │ │
│  │ Saved: Nov 29, 2024                     │ │
│  │ [Load] [Edit] [Export MIDI] [Delete]   │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  ... (scrollable list)                        │
│                                               │
└───────────────────────────────────────────────┘
```

### Data Structure

```typescript
interface SavedProgression {
  id: string;
  title: string;
  key: string;
  mode: 'major' | 'minor';
  tempo: number;
  timeSignature: string;
  chords: Chord[];
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Optional metadata
  analyzedFrom?: {
    source: 'youtube' | 'audio';
    title: string;
    url?: string;
  };
  
  buildUpSteps?: DeconstructionStep[];
}
```

### Storage Service

```typescript
// progression-storage.ts

class ProgressionStorage {
  private readonly STORAGE_KEY = 'neume-progressions';
  
  save(progression: SavedProgression): void {
    const progressions = this.getAll();
    
    // Check if updating existing
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
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
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
    localStorage.setItem(
      this.STORAGE_KEY, 
      JSON.stringify(progressions)
    );
  }
  
  // Storage limit warning
  getStorageUsage(): { used: number; limit: number; percentage: number } {
    const data = localStorage.getItem(this.STORAGE_KEY) || '';
    const used = new Blob([data]).size;
    const limit = 5 * 1024 * 1024; // 5MB typical limit
    
    return {
      used,
      limit,
      percentage: (used / limit) * 100
    };
  }
}

export const progressionStorage = new ProgressionStorage();
```

### Zustand Store

```typescript
// progressions-store.ts

interface ProgressionsState {
  isModalOpen: boolean;
  savedProgressions: SavedProgression[];
  currentFilter: 'all' | 'favorites' | 'recent';
  searchQuery: string;
  
  openModal: () => void;
  closeModal: () => void;
  loadProgressions: () => void;
  saveProgression: (progression: SavedProgression) => void;
  deleteProgression: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setFilter: (filter: 'all' | 'favorites' | 'recent') => void;
  setSearchQuery: (query: string) => void;
  
  // Computed
  getFilteredProgressions: () => SavedProgression[];
}

export const useProgressionsStore = create<ProgressionsState>((set, get) => ({
  isModalOpen: false,
  savedProgressions: [],
  currentFilter: 'all',
  searchQuery: '',
  
  openModal: () => {
    get().loadProgressions();
    set({ isModalOpen: true });
  },
  
  closeModal: () => set({ isModalOpen: false }),
  
  loadProgressions: () => {
    const progressions = progressionStorage.getAll();
    set({ savedProgressions: progressions });
  },
  
  saveProgression: (progression) => {
    progressionStorage.save(progression);
    get().loadProgressions();
  },
  
  deleteProgression: (id) => {
    if (confirm('Delete this progression?')) {
      progressionStorage.delete(id);
      get().loadProgressions();
    }
  },
  
  toggleFavorite: (id) => {
    const progression = progressionStorage.getById(id);
    if (progression) {
      progression.isFavorite = !progression.isFavorite;
      progressionStorage.save(progression);
      get().loadProgressions();
    }
  },
  
  setFilter: (filter) => set({ currentFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  getFilteredProgressions: () => {
    const { savedProgressions, currentFilter, searchQuery } = get();
    
    let filtered = savedProgressions;
    
    // Apply filter
    if (currentFilter === 'favorites') {
      filtered = filtered.filter(p => p.isFavorite);
    } else if (currentFilter === 'recent') {
      filtered = filtered.slice(0, 10);
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }
}));
```

### Export MIDI Feature

```typescript
// Export button for each progression
function exportToMIDI(progression: SavedProgression) {
  const track = new MidiWriter.Track();
  
  // Set tempo
  track.setTempo(progression.tempo);
  
  // Add chords
  for (const chord of progression.chords) {
    track.addEvent(new MidiWriter.NoteEvent({
      pitch: [
        chord.voices.bass,
        chord.voices.tenor,
        chord.voices.alto,
        chord.voices.soprano
      ],
      duration: chord.duration.toString(),
      velocity: 80
    }));
  }
  
  // Create file
  const write = new MidiWriter.Writer([track]);
  const dataUri = write.dataUri();
  
  // Download
  const link = document.createElement('a');
  link.download = `${progression.title}.mid`;
  link.href = dataUri;
  link.click();
}
```

### Storage Limit Warning

```typescript
// Show warning at 80% capacity
const { percentage } = progressionStorage.getStorageUsage();

if (percentage > 80) {
  showWarning(
    `Storage ${percentage.toFixed(0)}% full. ` +
    `Consider exporting and deleting old progressions.`
  );
}
```

## Quality Criteria
- [ ] Save dialog is clear and simple
- [ ] Progressions save reliably (no data loss)
- [ ] Load is instant (<100ms)
- [ ] Search/filter work correctly
- [ ] Favorites toggle works
- [ ] Export MIDI generates valid files
- [ ] Storage limit warning appears at 80%
- [ ] Handles errors gracefully (storage full, corrupted data)

**Estimated Time:** 3-4 hours
