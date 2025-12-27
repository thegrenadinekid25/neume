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
  duration?: number;
}

/**
 * Context menu item
 */
export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
  divider?: boolean;
}

/**
 * User settings
 */
export interface UserSettings {
  masterVolume: number;
  tempo: number;
  showConnectionLines: boolean;
  gridSnapping: boolean;
  snapResolution: number;
  hasSeenWelcome: boolean;
  keyboardShortcutsEnabled: boolean;
  defaultKey: string;
  defaultMode: 'major' | 'minor';
  defaultTempo: number;
}
