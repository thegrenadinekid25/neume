import { create } from 'zustand';
import type { Toast, ToastType } from '../types/ui';

interface ToastState {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

let toastIdCounter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (type, message, duration = 4000) => {
    const id = `toast-${++toastIdCounter}`;
    const toast: Toast = { id, type, message, duration };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },
}));

// Convenience functions for common toast types
export const showSuccessToast = (message: string) => {
  useToastStore.getState().addToast('success', message);
};

export const showErrorToast = (message: string) => {
  useToastStore.getState().addToast('error', message, 6000);
};

export const showWarningToast = (message: string) => {
  useToastStore.getState().addToast('warning', message);
};

export const showInfoToast = (message: string) => {
  useToastStore.getState().addToast('info', message);
};
