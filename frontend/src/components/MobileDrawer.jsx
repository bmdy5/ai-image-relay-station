import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

const MobileDrawer = ({ isOpen, onClose, title, children }) => {
  // 锁定 body 滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 'var(--z-drawer)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end'
    }}>
      {/* 遮罩层 */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeInOverlay 0.3s ease-out'
        }}
      />
      
      {/* 抽屉内容区 */}
      <div style={{
        position: 'relative',
        background: '#fff',
        borderRadius: '32px 32px 0 0',
        padding: '32px 24px',
        animation: 'slideUpDrawer 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
        maxHeight: '85vh',
        overflowY: 'auto'
      }}>
        {/* 顶部手柄装饰 */}
        <div style={{
          width: '36px',
          height: '5px',
          background: '#E5E5EA',
          borderRadius: '3px',
          margin: '-16px auto 24px'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{title}</h3>
          <button 
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', color: '#999', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        <div>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MobileDrawer;
