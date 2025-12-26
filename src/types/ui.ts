/**
 * Modal types
 */
export type ModalType =
  | 'analyze'
  | 'refine'
  | 'welcome'
  | 'settings'
  | 'progressions'
  | null;

/**
 * Panel types
 */
export type PanelType = 'whyThis' | 'buildFromBones' | null;

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast notification
 */
export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // ms, undefined = persistent
}

/**
 * Context menu item
 */
export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  disabled?: boolean;
  divider?: boolean; // Show divider after this item
}

/**
 * User settings (from spec)
 */
export interface UserSettings {
  // Audio
  masterVolume: number; // 0.0-1.0
  tempo: number; // BPM

  // Display
  showConnectionLines: boolean;
  gridSnapping: boolean;
  snapResolution: number; // Fraction of beat (0.25 = sixteenth)

  // Interface
  hasSeenWelcome: boolean;
  keyboardShortcutsEnabled: boolean;

  // Preferences
  defaultKey: string;
  defaultMode: 'major' | 'minor';
  defaultTempo: number;
}
