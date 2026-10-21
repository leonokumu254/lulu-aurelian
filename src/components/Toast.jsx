import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import './Toast.css';

let toastTimeout = null;

/**
 * Global helper to trigger toast notifications from anywhere in the app
 * Usage: triggerToast({ type: 'warning', title: 'Second Name Required', message: 'Please enter your second name.' })
 */
export const triggerToast = ({ type = 'info', title = '', message = '', duration = 4500 }) => {
  window.dispatchEvent(new CustomEvent('lulu-toast', {
    detail: { id: Date.now() + Math.random(), type, title, message, duration }
  }));
};

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const newToast = e.detail;
      if (!newToast) return;

      setToasts(prev => [...prev.slice(-3), newToast]); // Keep max 4 toasts on screen

      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, newToast.duration || 4500);
    };

    window.addEventListener('lulu-toast', handleToast);
    return () => window.removeEventListener('lulu-toast', handleToast);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="lulu-toast-container" aria-live="polite">
      {toasts.map(toast => {
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';

        return (
          <div key={toast.id} className={`lulu-toast lulu-toast-${toast.type} animate-slide-in`}>
            <div className="lulu-toast-icon-wrap">
              {isSuccess && <CheckCircle size={20} className="toast-icon success" />}
              {isError && <AlertCircle size={20} className="toast-icon error" />}
              {isWarning && <AlertTriangle size={20} className="toast-icon warning" />}
              {!isSuccess && !isError && !isWarning && <Info size={20} className="toast-icon info" />}
            </div>

            <div className="lulu-toast-content">
              {toast.title && <h4 className="lulu-toast-title">{toast.title}</h4>}
              {toast.message && <p className="lulu-toast-message">{toast.message}</p>}
            </div>

            <button 
              className="lulu-toast-close" 
              onClick={() => removeToast(toast.id)} 
              aria-label="Dismiss alert"
            >
              <X size={16} />
            </button>
            <div className="lulu-toast-progress" style={{ animationDuration: `${toast.duration || 4500}ms` }} />
          </div>
        );
      })}
    </div>
  );
}
