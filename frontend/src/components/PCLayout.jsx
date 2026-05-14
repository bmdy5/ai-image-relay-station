import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import request, { logout } from '../api/request';
import { 
  Images, 
  Coins, 
  ShieldCheck, 
  User, 
  X,
  CheckCircle,
  ChevronLeft,
  Download
} from 'lucide-react';
import NeuralPlexus from './NeuralPlexus';
import { usePWA } from '../hooks/usePWA';
import { loadUserCache, saveUserCache } from '../utils/userCache';

const PCLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isInstallable, isStandalone, isInstalled, promptInstall } = usePWA();
  const [userInfo, setUserInfo] = useState(() => loadUserCache());
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  useEffect(() => {
    fetchUserInfo();

    const handlePointsUpdated = () => fetchUserInfo();
    window.addEventListener('points-updated', handlePointsUpdated);
    return () => {
      window.removeEventListener('points-updated', handlePointsUpdated);
    };
  }, [location.pathname]);

  const fetchUserInfo = async () => {
    const isGuest = localStorage.getItem('isGuest') === 'true';
    const hasToken = !!localStorage.getItem('token');
    if (isGuest && hasToken) {
      localStorage.removeItem('isGuest'); // 已登录，清除残留游客标记
    }
    if (isGuest && !hasToken) {
      setUserInfo({ username: '游客用户', points: 0, uid: 'GUEST' });
      return;
    }
    try {
      const data = await request.get('/auth/me');
      setUserInfo(data);
      saveUserCache(data);
    } catch (err) {}
  };

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', position: 'relative' }}>
      <NeuralPlexus />
      
      {/* 消息提示 */}
      {toast.visible && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'error' ? '#fff1f0' : '#f6ffed',
          border: `1px solid ${toast.type === 'error' ? '#ffa39e' : '#b7eb8f'}`,
          padding: '12px 24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: '12px', zIndex: 9999
        }}>
          {toast.type === 'error' ? <X size={18} color="#f5222d" /> : <CheckCircle size={18} color="#52c41a" />}
          <span style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>{toast.message}</span>
        </div>
      )}

      {/* 顶部导航栏 */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
        <header style={{ 
          maxWidth: '1160px', margin: '0 auto', height: '80px', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
            <div 
              onClick={() => navigate('/')}
              style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-1px', cursor: 'pointer' }}
            >
              Visionary
            </div>
            <nav style={{ display: 'flex', gap: '24px', fontSize: '15px', fontWeight: '600' }}>
              <span 
                onClick={() => navigate('/')}
                style={{ 
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', 
                  color: isActive('/') ? 'var(--primary)' : 'var(--text-secondary)',
                  transition: 'var(--transition)'
                }}
              >
                创作首页
              </span>
              <span 
                id="guide-history-tab"
                onClick={() => navigate('/history')}
                style={{ 
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', 
                  color: isActive('/history') ? 'var(--primary)' : 'var(--text-secondary)',
                  transition: 'var(--transition)'
                }}
              >
                <Images size={18} strokeWidth={2} /> 我的创作
              </span>
              <span
                onClick={() => alert('内测阶段暂不支持充值\n\n可通过每日签到和邀请好友获取积分')}
                style={{
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                  color: isActive('/pricing') ? 'var(--primary)' : 'var(--text-secondary)',
                  transition: 'var(--transition)'
                }}
              >
                <Coins size={18} strokeWidth={2} /> 价格
              </span>
              {userInfo?.is_admin && (
                <span 
                  onClick={() => navigate('/admin')}
                  style={{ 
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    color: isActive('/admin') ? 'var(--primary)' : 'var(--text-secondary)'
                  }}
                >
                  <ShieldCheck size={18} strokeWidth={2} /> 管理后台
                </span>
              )}
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* PWA 安装按钮 — 非游客始终可见 */}
            {localStorage.getItem('isGuest') !== 'true' && !isStandalone && (
              <button
                onClick={() => {
                  if (isInstallable) {
                    promptInstall();
                  } else {
                    alert('点击浏览器地址栏右侧的安装图标 ⬇\n或 菜单 → "安装 Visionary"\n即可添加到桌面，首次安装送 10 积分');
                  }
                }}
                style={{
                  background: 'linear-gradient(135deg, #E88D72 0%, #C56A50 100%)',
                  border: 'none', padding: '8px 16px', borderRadius: '14px',
                  color: '#fff', fontSize: '13px', fontWeight: '700',
                  display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(197, 106, 80, 0.2)',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Download size={16} strokeWidth={2.5} />
                添加桌面版 <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '8px', fontSize: '11px', marginLeft: '4px' }}>+10积分</span>
              </button>
            )}

            <div 
              id="guide-points"
              style={{ 
              background: 'white', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '14px', 
              fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: 'var(--primary)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <Coins size={16} strokeWidth={2.5} />
              <span>{userInfo?.points || 0}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div 
                onClick={() => navigate('/profile')}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                }}
              >
                <div style={{ 
                  width: '40px', height: '40px', background: isActive('/profile') ? 'var(--primary-glow)' : '#e0e0e3', 
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  transition: 'var(--transition)',
                  color: isActive('/profile') ? 'var(--primary)' : 'inherit'
                }}>
                  <User size={20} strokeWidth={2} />
                </div>
                {userInfo?.username && (
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                    {userInfo.username}
                  </span>
                )}
              </div>
              <button 
                onClick={() => {
                  if (localStorage.getItem('isGuest') === 'true') {
                    localStorage.removeItem('isGuest');
                  }
                  logout();
                }} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}
              >
                {localStorage.getItem('isGuest') === 'true' ? '去登录' : '退出'}
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* 主内容区 - 毛玻璃舞台 */}
      <main 
        id="pc-main-stage"
        style={{ 
          maxWidth: '1160px', 
          margin: '20px auto 40px auto', 
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderRadius: '32px',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)',
          position: 'relative',
          zIndex: 1,
          minHeight: 'calc(100vh - 160px)'
        }}
      >
        {children}
      </main>

      {/* 页脚 - 备案信息 */}
      <footer style={{
        maxWidth: '1160px',
        margin: '0 auto 40px auto',
        padding: '20px',
        textAlign: 'center',
        fontSize: '13px',
        color: 'var(--text-secondary)',
        opacity: 0.8
      }}>
        <div style={{ marginBottom: '8px', fontWeight: '500' }}>
          © {new Date().getFullYear()} Visionary AI. All rights reserved.
        </div>
        <a 
          href="https://beian.miit.gov.cn/" 
          target="_blank" 
          rel="noreferrer"
          style={{ 
            color: 'inherit', 
            textDecoration: 'none',
            transition: 'var(--transition)'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}
        >
          苏ICP备2026029034号-1
        </a>
      </footer>
    </div>
  );
};

export default PCLayout;
