import { create } from 'zustand';

const STORAGE_KEY = 'neume-expert-mode';

interface ExpertModeProgress {
  progressionsCreated: number;
  uniqueChordsUsed: string[];
  cadencesCompleted: number;
  firstProgressionDate: string | null;
  lastActivityDate: string | null;
}

interface ExpertModeState {
  // Progress tracking
  progress: ExpertModeProgress;

  // Unlock thresholds
  thresholds: {
    progressionsRequired: number;
    uniqueChordsRequired: number;
    cadencesRequired: number;
  };

  // Unlock state
  isUnlocked: boolean;
  forceUnlocked: boolean;

  // Feature toggles (when unlocked)
  showExtendedChords: boolean;
  showAlteredChords: boolean;

  // Actions
  trackProgressionSaved: () => void;
  trackChordUsed: (chordIdentifier: string) => void;
  trackCadenceCompleted: () => void;
  checkUnlockStatus: () => boolean;
  forceUnlock: () => void;
  resetProgress: () => void;
  setShowExtendedChords: (show: boolean) => void;
  setShowAlteredChords: (show: boolean) => void;

  // Computed
  getUnlockProgress: () => {
    progressions: { current: number; required: number; percentage: number };
    uniqueChords: { current: number; required: number; percentage: number };
    cadences: { current: number; required: number; percentage: number };
    overall: number;
  };
}

// Load from localStorage
const loadStoredProgress = (): Partial<ExpertModeState> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        progress: {
          progressionsCreated: parsed.progressionsCreated || 0,
          uniqueChordsUsed: parsed.uniqueChordsUsed || [],
          cadencesCompleted: parsed.cadencesCompleted || 0,
          firstProgressionDate: parsed.firstProgressionDate || null,
          lastActivityDate: parsed.lastActivityDate || null,
        },
        isUnlocked: parsed.isUnlocked || false,
        forceUnlocked: parsed.forceUnlocked || false,
        showExtendedChords: parsed.showExtendedChords ?? true,
        showAlteredChords: parsed.showAlteredChords ?? true,
      };
    }
  } catch (e) {
    console.error('Failed to load expert mode progress:', e);
  }
  return {};
};

// Save to localStorage
const saveProgress = (state: ExpertModeState) => {
  try {
    const data = {
      progressionsCreated: state.progress.progressionsCreated,
      uniqueChordsUsed: state.progress.uniqueChordsUsed,
      cadencesCompleted: state.progress.cadencesCompleted,
      firstProgressionDate: state.progress.firstProgressionDate,
      lastActivityDate: state.progress.lastActivityDate,
      isUnlocked: state.isUnlocked,
      forceUnlocked: state.forceUnlocked,
      showExtendedChords: state.showExtendedChords,
      showAlteredChords: state.showAlteredChords,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save expert mode progress:', e);
  }
};

const storedProgress = loadStoredProgress();

export const useExpertModeStore = create<ExpertModeState>((set, get) => ({
  // Initial state
  progress: storedProgress.progress || {
    progressionsCreated: 0,
    uniqueChordsUsed: [],
    cadencesCompleted: 0,
    firstProgressionDate: null,
    lastActivityDate: null,
  },

  thresholds: {
    progressionsRequired: 3,
    uniqueChordsRequired: 7,
    cadencesRequired: 5,
  },

  isUnlocked: storedProgress.isUnlocked || false,
  forceUnlocked: storedProgress.forceUnlocked || false,
  showExtendedChords: storedProgress.showExtendedChords ?? true,
  showAlteredChords: storedProgress.showAlteredChords ?? true,

  // Actions
  trackProgressionSaved: () => {
    set((state) => {
      const now = new Date().toISOString();
      const newProgress = {
        ...state.progress,
        progressionsCreated: state.progress.progressionsCreated + 1,
        firstProgressionDate: state.progress.firstProgressionDate || now,
        lastActivityDate: now,
      };
      const newState = { ...state, progress: newProgress };

      // Check if unlocked
      if (get().checkUnlockStatus()) {
        newState.isUnlocked = true;
      }

      saveProgress(newState as ExpertModeState);
      return { progress: newProgress, isUnlocked: newState.isUnlocked };
    });
  },

  trackChordUsed: (chordIdentifier) => {
    set((state) => {
      if (state.progress.uniqueChordsUsed.includes(chordIdentifier)) {
        return state;
      }

      const newProgress = {
        ...state.progress,
        uniqueChordsUsed: [...state.progress.uniqueChordsUsed, chordIdentifier],
        lastActivityDate: new Date().toISOString(),
      };
      const newState = { ...state, progress: newProgress };

      // Check if unlocked
      if (get().checkUnlockStatus()) {
        newState.isUnlocked = true;
      }

      saveProgress(newState as ExpertModeState);
      return { progress: newProgress, isUnlocked: newState.isUnlocked };
    });
  },

  trackCadenceCompleted: () => {
    set((state) => {
      const newProgress = {
        ...state.progress,
        cadencesCompleted: state.progress.cadencesCompleted + 1,
        lastActivityDate: new Date().toISOString(),
      };
      const newState = { ...state, progress: newProgress };

      // Check if unlocked
      if (get().checkUnlockStatus()) {
        newState.isUnlocked = true;
      }

      saveProgress(newState as ExpertModeState);
      return { progress: newProgress, isUnlocked: newState.isUnlocked };
    });
  },

  checkUnlockStatus: () => {
    const state = get();
    if (state.forceUnlocked) return true;

    const { progress, thresholds } = state;
    return (
      progress.progressionsCreated >= thresholds.progressionsRequired &&
      progress.uniqueChordsUsed.length >= thresholds.uniqueChordsRequired &&
      progress.cadencesCompleted >= thresholds.cadencesRequired
    );
  },

  forceUnlock: () => {
    set((state) => {
      const newState = { ...state, forceUnlocked: true, isUnlocked: true };
      saveProgress(newState);
      return { forceUnlocked: true, isUnlocked: true };
    });
  },

  resetProgress: () => {
    const initialProgress = {
      progressionsCreated: 0,
      uniqueChordsUsed: [],
      cadencesCompleted: 0,
      firstProgressionDate: null,
      lastActivityDate: null,
    };
    set((state) => {
      const newState = {
        ...state,
        progress: initialProgress,
        isUnlocked: false,
        forceUnlocked: false,
      };
      saveProgress(newState);
      return newState;
    });
  },

  setShowExtendedChords: (show) => {
    set((state) => {
      const newState = { ...state, showExtendedChords: show };
      saveProgress(newState);
      return { showExtendedChords: show };
    });
  },

  setShowAlteredChords: (show) => {
    set((state) => {
      const newState = { ...state, showAlteredChords: show };
      saveProgress(newState);
      return { showAlteredChords: show };
    });
  },

  getUnlockProgress: () => {
    const { progress, thresholds } = get();

    const progressions = {
      current: progress.progressionsCreated,
      required: thresholds.progressionsRequired,
      percentage: Math.min(100, (progress.progressionsCreated / thresholds.progressionsRequired) * 100),
    };

    const uniqueChords = {
      current: progress.uniqueChordsUsed.length,
      required: thresholds.uniqueChordsRequired,
      percentage: Math.min(100, (progress.uniqueChordsUsed.length / thresholds.uniqueChordsRequired) * 100),
    };

    const cadences = {
      current: progress.cadencesCompleted,
      required: thresholds.cadencesRequired,
      percentage: Math.min(100, (progress.cadencesCompleted / thresholds.cadencesRequired) * 100),
    };

    const overall = (progressions.percentage + uniqueChords.percentage + cadences.percentage) / 3;

    return { progressions, uniqueChords, cadences, overall };
  },
}));
