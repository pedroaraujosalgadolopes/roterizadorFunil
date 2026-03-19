import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppState {
  currentTripId: number | null;
  toasts: ToastMessage[];
  setCurrentTripId: (id: number | null) => void;
  addToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentTripId: null,
  toasts: [],
  setCurrentTripId: (id) => set({ currentTripId: id }),
  addToast: (type, message) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
