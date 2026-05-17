import { create } from 'zustand';

export interface ConfirmOptions {
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'white' | 'glass';
  xPosition?: 'left' | 'center' | 'right';
  yPosition?: 'top' | 'center' | 'bottom';
}

interface ConfirmState {
  isOpen: boolean;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: 'white' | 'glass';
  xPosition: 'left' | 'center' | 'right';
  yPosition: 'top' | 'center' | 'bottom';
  resolveRef: ((value: boolean) => void) | null;
  
  openConfirm: (options: ConfirmOptions) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
  handleClose: () => void;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  isOpen: false,
  message: '',
  confirmText: '예',
  cancelText: '아니오',
  variant: 'glass',
  xPosition: 'center',
  yPosition: 'top',
  resolveRef: null,

  openConfirm: (options) => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        message: options.message,
        confirmText: options.confirmText ?? '예',
        cancelText: options.cancelText ?? '아니오',
        variant: options.variant ?? 'glass',
        xPosition: options.xPosition ?? 'center',
        yPosition: options.yPosition ?? 'top',
        resolveRef: resolve,
      });
    });
  },

  handleConfirm: () => {
    const { resolveRef } = get();
    if (resolveRef) resolveRef(true);
    set({ isOpen: false, resolveRef: null });
  },

  handleCancel: () => {
    const { resolveRef } = get();
    if (resolveRef) resolveRef(false);
    set({ isOpen: false, resolveRef: null });
  },

  handleClose: () => {
    const { resolveRef } = get();
    if (resolveRef) resolveRef(false);
    set({ isOpen: false, resolveRef: null });
  },
}));
