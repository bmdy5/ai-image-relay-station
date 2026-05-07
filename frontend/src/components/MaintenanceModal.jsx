import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';

const MaintenanceModal = () => {
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // 每 5 秒探测后端是否恢复
    const poll = setInterval(async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          clearInterval(poll);
          window.location.href = '/';
        }
      } catch (err) {
        // 后端仍未恢复，继续等待
      }
    }, 5000);
    return () => clearInterval(poll);
  }, []);

  const handleRetry = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        window.location.href = '/';
      }
    } catch (err) {}
    setChecking(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', pointerEvents: 'all', userSelect: 'none'
    }}>
      <div style={{
        background: '#fff', padding: '40px', borderRadius: '32px',
        maxWidth: '400px', width: '100%', textAlign: 'center',
        boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
        animation: 'modalFadeIn 0.5s ease-out'
      }}>
        <div style={{ 
          width: '80px', height: '80px', background: '#FFF7ED', 
          borderRadius: '50%', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', margin: '0 auto 24px', color: '#EA580C' 
        }}>
          <AlertTriangle size={40} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', color: '#1D1D1F' }}>系统维护中</h2>
        <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '32px', fontSize: '15px' }}>
          抱歉，系统正在进行紧急维护。<br/>
          为了您的数据安全，我们将暂时关闭访问。
        </p>
        <p style={{ color: '#999', fontSize: '13px', marginBottom: '20px' }}>
          系统正在自动检测恢复状态，恢复后将自动返回
        </p>
        <button
          onClick={handleRetry}
          disabled={checking}
          style={{
            width: '100%', padding: '16px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #F97316, #EA580C)',
            color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '15px',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px',
            boxShadow: '0 10px 20px rgba(249, 115, 22, 0.2)'
          }}
        >
          {checking ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
          {checking ? '检测中...' : '手动重试'}
        </button>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}} />
    </div>
  );
};

export default MaintenanceModal;
