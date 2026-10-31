import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import './Toast.css';

let toastTimeout = null;

/**
 * Global helper to trigger toast notifications from anywhere in the app
 * Usage: triggerToast({ type: 'warning', title: 'Second Name Required', message: 'Please enter your second name.' })
 */
export const triggerToast = (options = {}) => {
  let payload = {};
  if (typeof options === 'string') {
    payload = { type: 'info', title: '', message: options, duration: 4500 };
  } else if (typeof options === 'object' && options !== null) {
    payload = {
      type: options.type || 'info',
      title: options.title || '',
      message: options.message || '',
      duration: options.duration || 4500
    };
  }
  // Fallback so toast is never completely blank
  if (!payload.title && !payload.message) {
    payload.message = 'Notification';
  }
  window.dispatchEvent(new CustomEvent('lulu-toast', {
    detail: { id: Date.now() + Math.random(), ...payload }
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
    <div className="lulu-toast-container no-reveal" aria-live="polite">
      {toasts.map(toast => {
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';

        return (
          <div key={toast.id} className={`lulu-toast lulu-toast-${toast.type} animate-slide-in no-reveal`}>
            <div className="lulu-toast-icon-wrap">
              {isSuccess && <CheckCircle size={20} className="toast-icon success" />}
              {isError && <AlertCircle size={20} className="toast-icon error" />}
              {isWarning && <AlertTriangle size={20} className="toast-icon warning" />}
              {!isSuccess && !isError && !isWarning && <Info size={20} className="toast-icon info" />}
            </div>

            <div className="lulu-toast-content no-reveal">
              {toast.title && (
                <h4 className="lulu-toast-title no-reveal" style={{ opacity: 1, visibility: 'visible', transform: 'none' }}>
                  {toast.title}
                </h4>
              )}
              {toast.message && (
                <p className="lulu-toast-message no-reveal" style={{ opacity: 1, visibility: 'visible', transform: 'none' }}>
                  {toast.message}
                </p>
              )}
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
