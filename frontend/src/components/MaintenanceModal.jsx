import React, { useState, useEffect } from 'react';
import { AlertTriangle, LogOut } from 'lucide-react';

const MaintenanceModal = () => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          localStorage.removeItem('token');
          window.location.href = '/login';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
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
          抱歉，系统正在进行紧急维护或数据库连接异常。<br/>
          为了您的数据安全，我们将暂时关闭访问。
        </p>
        <div style={{ 
          background: '#F97316', color: '#fff', padding: '16px', 
          borderRadius: '16px', fontWeight: 'bold', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', gap: '8px',
          boxShadow: '0 10px 20px rgba(249, 115, 22, 0.2)'
        }}>
          <LogOut size={18} /> {countdown}s 后安全退出
        </div>
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
