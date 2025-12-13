// Toast notification component

import React from 'react';
import type { ToastMessage } from '../../types';

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`${bgColors[toast.type]} text-white px-6 py-4 rounded-lg shadow-lg mb-2 flex items-center justify-between min-w-[300px]`}>
      <span>{toast.message}</span>
      <button
        onClick={() => onClose(toast.id)}
        className="ml-4 text-white hover:text-gray-200"
      >
        ×
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}
