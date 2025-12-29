import { create } from 'zustand';

const STORAGE_KEY = 'neume-accessibility';

interface AccessibilityState {
  colorblindMode: boolean;
  setColorblindMode: (enabled: boolean) => void;
}

// Load from localStorage
const loadStoredState = (): Partial<AccessibilityState> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        colorblindMode: parsed.colorblindMode ?? false,
      };
    }
  } catch (e) {
    console.error('Failed to load accessibility settings:', e);
  }
  return {};
};

// Save to localStorage
const saveState = (state: AccessibilityState) => {
  try {
    const data = {
      colorblindMode: state.colorblindMode,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save accessibility settings:', e);
  }
};

const storedState = loadStoredState();

export const useAccessibilityStore = create<AccessibilityState>((set) => ({
  colorblindMode: storedState.colorblindMode ?? false,

  setColorblindMode: (enabled: boolean) => {
    set((state) => {
      const newState = { ...state, colorblindMode: enabled };
      saveState(newState);
      return { colorblindMode: enabled };
    });
  },
}));
