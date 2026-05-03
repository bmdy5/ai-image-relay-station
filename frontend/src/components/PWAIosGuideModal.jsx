import React from 'react';
import { Share, PlusSquare, X } from 'lucide-react';

const PWAIosGuideModal = ({ onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '24px',
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom))'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: '#F5F5F5', border: 'none', borderRadius: '50%',
          width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer'
        }}>
          <X size={16} color="#666" />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px', height: '64px', margin: '0 auto 16px',
            borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <img src="/icon.png" alt="Visionary Icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#333' }}>
            添加到主屏幕
          </h3>
          <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#666' }}>
            添加至桌面，不仅体验更佳，首次安装还可<span style={{color: '#C56A50', fontWeight: '700'}}>获赠 10 积分</span>！
          </p>
        </div>

        <div style={{ background: '#FDFBF9', borderRadius: '16px', padding: '16px', border: '1px solid #F2EAE5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#FFF', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <Share size={18} color="#007AFF" />
            </div>
            <div style={{ fontSize: '15px', color: '#333' }}>
              1. 点击底部菜单栏的 <strong>分享</strong> 按钮
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#FFF', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <PlusSquare size={18} color="#333" />
            </div>
            <div style={{ fontSize: '15px', color: '#333' }}>
              2. 向上滑动，选择 <strong>“添加到主屏幕”</strong>
            </div>
          </div>
        </div>

        <div style={{ 
          marginTop: '24px', 
          display: 'flex', justifyContent: 'center', 
          animation: 'bounce 2s infinite' 
        }}>
          <div style={{ 
            width: '4px', height: '40px', background: 'linear-gradient(to bottom, transparent, #C56A50)', 
            borderRadius: '2px', position: 'relative'
          }}>
            <div style={{ 
              position: 'absolute', bottom: '-6px', left: '-4px', 
              width: '12px', height: '12px', borderBottom: '3px solid #C56A50', borderRight: '3px solid #C56A50', 
              transform: 'rotate(45deg)' 
            }} />
          </div>
        </div>
        <style>{`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(10px); }
            60% { transform: translateY(5px); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PWAIosGuideModal;
