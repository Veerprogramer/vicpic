import React, { useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useVicPicStore } from '../store/useVicPicStore';

interface ToastItemProps {
  id: string;
  message: string;
  type: 'success' | 'error';
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ id, message, type, onRemove }) => {
  const elRef = useRef<HTMLDivElement>(null);

  // Animate out before removal
  const dismiss = () => {
    const el = elRef.current;
    if (!el) { onRemove(id); return; }
    el.style.animation = 'vp-toast-out 0.25s ease-in forwards';
    setTimeout(() => onRemove(id), 240);
  };

  useEffect(() => {
    const t = setTimeout(dismiss, 3000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isError = type === 'error';

  return (
    <div
      ref={elRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg,rgba(6,13,22,0.98),rgba(15,32,64,0.98))',
        border: `1px solid ${isError ? 'rgba(255,60,60,0.4)' : 'rgba(0,212,255,0.35)'}`,
        boxShadow: isError
          ? '0 0 20px rgba(255,60,60,0.15), 0 4px 16px rgba(0,0,0,0.4)'
          : '0 0 20px rgba(0,212,255,0.15), 0 4px 16px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(20px)',
        maxWidth: '230px',
        position: 'relative',
        overflow: 'hidden',
        animation: 'vp-toast-in 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
        marginBottom: '8px',
      }}
    >
      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, height: '2px', width: '100%',
        background: isError ? 'rgba(255,60,60,0.6)' : 'linear-gradient(90deg,#00d4ff,#bf00ff)',
        borderRadius: '0 0 12px 12px',
        animation: 'vp-bar 3s linear forwards',
        transformOrigin: 'left',
      }} />

      {isError
        ? <AlertCircle size={14} style={{ color: 'rgba(255,100,100,0.9)', flexShrink: 0 }} />
        : <CheckCircle2 size={14} style={{ color: 'rgba(0,212,255,0.9)', flexShrink: 0 }} />
      }

      <span style={{
        fontSize: '11px',
        fontFamily: 'Rajdhani, sans-serif',
        fontWeight: 600,
        letterSpacing: '0.04em',
        color: 'rgba(255,255,255,0.85)',
        flex: 1,
      }}>
        {message}
      </span>

      <button
        onClick={dismiss}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: 0.4, lineHeight: 1 }}
      >
        <X size={11} color="white" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useVicPicStore((s) => s.toasts);
  const removeToast = useVicPicStore((s) => s.removeToast);

  return (
    <div style={{
      position: 'fixed',
      bottom: '12px',
      right: '12px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      pointerEvents: 'none',
    }}>
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem id={t.id} message={t.message} type={t.type} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
};