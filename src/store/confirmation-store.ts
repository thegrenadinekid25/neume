import { create } from 'zustand';

type ConfirmationVariant = 'confirm' | 'alert' | 'destructive';

interface ConfirmationOptions {
  title: string;
  message: string;
  variant?: ConfirmationVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ConfirmationState {
  isOpen: boolean;
  options: ConfirmationOptions | null;
  showConfirmation: (options: ConfirmationOptions) => void;
  confirm: () => void;
  cancel: () => void;
  close: () => void;
}

export const useConfirmationStore = create<ConfirmationState>((set, get) => ({
  isOpen: false,
  options: null,

  showConfirmation: (options) => {
    set({
      isOpen: true,
      options: {
        variant: 'confirm',
        confirmLabel: 'OK',
        cancelLabel: 'Cancel',
        ...options,
      },
    });
  },

  confirm: () => {
    const { options } = get();
    options?.onConfirm?.();
    set({ isOpen: false, options: null });
  },

  cancel: () => {
    const { options } = get();
    options?.onCancel?.();
    set({ isOpen: false, options: null });
  },

  close: () => {
    set({ isOpen: false, options: null });
  },
}));

// Convenience functions for use outside React components
export const showConfirmation = (options: ConfirmationOptions) => {
  useConfirmationStore.getState().showConfirmation(options);
};

export const showAlert = (title: string, message: string, onDismiss?: () => void) => {
  useConfirmationStore.getState().showConfirmation({
    title,
    message,
    variant: 'alert',
    confirmLabel: 'OK',
    onConfirm: onDismiss,
  });
};

export const showDestructiveConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  useConfirmationStore.getState().showConfirmation({
    title,
    message,
    variant: 'destructive',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    onConfirm,
    onCancel,
  });
};
