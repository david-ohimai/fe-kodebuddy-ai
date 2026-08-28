'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import Toast, { ToastData } from './Toast';

interface ToastContextType {
  showToast: (toast: ToastData) => void;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = useCallback((toastData: ToastData) => {
    setToast(toastData);
  }, []);

  const showSuccess = useCallback((title: string, message: string) => {
    setToast({ type: 'success', title, message });
  }, []);

  const showError = useCallback((title: string, message: string) => {
    setToast({ type: 'error', title, message });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, hideToast }}
    >
      {children}
      <Toast toast={toast} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
