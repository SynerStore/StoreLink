import { create } from 'zustand';

export interface AppError {
  title?: string;
  message: string;
  details?: string;
  stack?: string;
}

interface ErrorState {
  visible: boolean;
  error: AppError | null;
  showError: (error: AppError) => void;
  hideError: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  visible: false,
  error: null,
  showError: (error) => set({ visible: true, error }),
  hideError: () => set({ visible: false, error: null }),
}));
