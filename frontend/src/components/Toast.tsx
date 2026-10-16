import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`} role="alert">
          {toast.type === 'success' && <CheckCircle2 size={18} color="#10b981" />}
          {toast.type === 'error' && <AlertCircle size={18} color="#ef4444" />}
          {toast.type === 'info' && <Info size={18} color="#818cf8" />}

          <div style={{ flex: 1, fontSize: '0.875rem' }}>{toast.message}</div>

          <button
            onClick={() => onDismiss(toast.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px',
            }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
