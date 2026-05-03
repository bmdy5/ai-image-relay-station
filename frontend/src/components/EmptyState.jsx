import React from 'react';
import { Sparkles, ShoppingBag } from 'lucide-react';

const EmptyState = ({ icon: Icon = Sparkles, title = "暂无数据", description = "开启您的创作之旅吧", actionText, onAction }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 20px',
      textAlign: 'center',
      background: 'rgba(255, 255, 255, 0.5)',
      borderRadius: '32px',
      border: '1px dashed rgba(0,0,0,0.05)',
      marginTop: '20px'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '24px',
        background: 'rgba(230, 107, 51, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#e66b33',
        marginBottom: '24px',
        animation: 'float 3s ease-in-out infinite'
      }}>
        <Icon size={40} strokeWidth={1.5} />
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1D1D1F', marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: '#8E8E93', marginBottom: '32px' }}>{description}</p>
      
      {actionText && (
        <button 
          onClick={onAction}
          style={{
            padding: '12px 32px',
            borderRadius: '20px',
            background: '#1D1D1F',
            color: 'white',
            border: 'none',
            fontWeight: '800',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
          }}
        >
          {actionText}
        </button>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}} />
    </div>
  );
};

export default EmptyState;
