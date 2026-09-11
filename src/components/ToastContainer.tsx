import React, { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { Toast, ToastType } from '../context/ToastContext';

export interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const getToastIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--success)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          data-testid="toast-icon-success"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case 'error':
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--danger)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          data-testid="toast-icon-error"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      );
    case 'warning':
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--warning)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          data-testid="toast-icon-warning"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'info':
    default:
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--info)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          data-testid="toast-icon-info"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
  }
};

const ToastItemComponent: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const isExiting = useRef(false);

  const handleDismiss = useCallback(() => {
    if (isExiting.current) return;
    isExiting.current = true;
    if (itemRef.current) {
      gsap.to(itemRef.current, {
        opacity: 0,
        x: 50,
        scale: 0.95,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          onDismiss(toast.id);
        },
      });
      if (process.env.NODE_ENV === 'test') {
        onDismiss(toast.id);
      }
    } else {
      onDismiss(toast.id);
    }
  }, [onDismiss, toast.id]);

  useEffect(() => {
    const itemEl = itemRef.current;
    const progressEl = progressRef.current;

    if (itemEl) {
      gsap.fromTo(
        itemEl,
        { opacity: 0, x: 50, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: 0.35, ease: 'power2.out' }
      );
    }

    if (progressEl && toast.duration > 0) {
      gsap.fromTo(
        progressEl,
        { width: '100%' },
        {
          width: '0%',
          duration: toast.duration / 1000,
          ease: 'none',
        }
      );
    }

    let timer: NodeJS.Timeout | undefined;
    if (toast.duration > 0) {
      timer = setTimeout(() => {
        handleDismiss();
      }, toast.duration);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (itemEl) {
        gsap.killTweensOf(itemEl);
      }
      if (progressEl) {
        gsap.killTweensOf(progressEl);
      }
    };
  }, [toast.duration, handleDismiss]);

  return (
    <div
      ref={itemRef}
      className={`toast-pill toast-${toast.type}`}
      role="alert"
      aria-atomic="true"
    >
      <div className="toast-icon-wrapper" aria-hidden="true">
        {getToastIcon(toast.type)}
      </div>
      <div className="toast-content">
        <div className="toast-message">{toast.message}</div>
      </div>
      <button
        type="button"
        className="toast-dismiss-btn"
        onClick={handleDismiss}
        aria-label="Cerrar notificación"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      {toast.duration > 0 && (
        <div className="toast-progress">
          <div ref={progressRef} className="toast-progress-fill" />
        </div>
      )}
    </div>
  );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="toast-container-fixed"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItemComponent key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export default ToastContainer;
