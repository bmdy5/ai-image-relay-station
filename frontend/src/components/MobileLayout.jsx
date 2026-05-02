import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, LayoutGrid, Gem, User } from 'lucide-react';
import request from '../api/request';

const MobileLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState(null);

  // 获取用户信息
  const fetchUserInfo = async () => {
    const isGuest = localStorage.getItem('isGuest') === 'true';
    if (isGuest) {
      setUserInfo({ username: '游客用户', points: 0, uid: 'GUEST' });
      return;
    }
    try {
      const user = await request.get('/auth/me');
      setUserInfo(user);
    } catch (err) {
      console.error('Failed to fetch userInfo');
    }
  };

  useEffect(() => {
    fetchUserInfo();
    // 监听导航变化，在切换页面时刷新积分
    const interval = setInterval(fetchUserInfo, 30000); // 30秒轮询一次
    return () => clearInterval(interval);
  }, [location.pathname]);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith('/history')) return 'history';
    if (path.startsWith('/pricing')) return 'pricing';
    if (path.startsWith('/profile')) return 'profile';
    return 'home';
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tabId) => {
    if (tabId === 'home') navigate('/');
    else navigate(`/${tabId}`);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      width: '100vw',
      background: 'var(--bg-main)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* 顶部 Header */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        padding: '16px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        zIndex: 'var(--z-tabbar)',
        borderBottom: '1px solid rgba(0,0,0,0.03)'
      }}>
        <div style={{ fontWeight: '800', fontSize: '20px', color: '#C59C8F', letterSpacing: '-0.5px' }}>Visionary</div>
        <div style={{ 
          fontSize: '12px', fontWeight: '800', color: '#fff', 
          background: 'linear-gradient(135deg, #C59C8F 0%, #A87B6D 100%)', 
          padding: '6px 14px', borderRadius: '20px',
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 12px rgba(197,156,143,0.2)'
        }}>
          {userInfo?.points || 0} 积分
        </div>
      </header>

      {/* 滚动内容区 */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        paddingTop: '65px', // 为 Header 留位
        paddingBottom: '90px', // 为 Tab Bar 留位
        WebkitOverflowScrolling: 'touch'
      }}>
        {children}
      </div>

      {/* 底部 Tab 导航栏 */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, 
        height: '84px', // 增加高度以容纳安全区
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        justifyContent: 'space-around', alignItems: 'flex-start',
        paddingTop: '12px',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 'var(--z-tabbar)',
        borderTop: '1px solid rgba(255,255,255,0.9)'
      }}>
        {[
          { id: 'home', icon: <Sparkles size={22} />, label: '创作' },
          { id: 'history', icon: <LayoutGrid size={22} />, label: '历史' },
          { id: 'pricing', icon: <Gem size={22} />, label: '会员' },
          { id: 'profile', icon: <User size={22} />, label: '我的' }
        ].map(tab => (
          <div 
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              color: activeTab === tab.id ? '#C59C8F' : '#8E8E93',
              width: '25%',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <div style={{ 
              transition: 'transform 0.2s ease',
              transform: activeTab === tab.id ? 'scale(1.1)' : 'scale(1)'
            }}>
              {tab.icon}
            </div>
            <span style={{ 
              fontSize: '10px', 
              fontWeight: '700',
              opacity: activeTab === tab.id ? 1 : 0.8
            }}>{tab.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default MobileLayout;
