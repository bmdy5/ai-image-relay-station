import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      top: '40px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '16px',
      zIndex: 10001,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)',
      animation: 'toast-in 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
      pointerEvents: 'none',
      whiteSpace: 'nowrap'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes toast-in {
          from { transform: translate(-50%, -20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}} />
      <span style={{ fontSize: '14px', fontWeight: '700' }}>{message}</span>
    </div>
  );
};

export default Toast;
