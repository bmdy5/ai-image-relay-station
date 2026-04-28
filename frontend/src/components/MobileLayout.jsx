import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Images, Coins, User } from 'lucide-react';

const MobileLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from current path
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
      background: '#f8f9fa',
      overflow: 'hidden'
    }}>
      {/* 滚动内容区 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </div>

      {/* 底部 Tab 导航栏 */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: '70px',
        background: '#fff', display: 'flex',
        justifyContent: 'space-around', alignItems: 'center',
        paddingBottom: 'safe-area-inset-bottom', zIndex: 100,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.03)'
      }}>
        {[
          { id: 'home', icon: <Home size={24} />, label: '主页' },
          { id: 'history', icon: <Images size={24} />, label: '历史' },
          { id: 'pricing', icon: <Coins size={24} />, label: '会员' },
          { id: 'profile', icon: <User size={24} />, label: '我的' }
        ].map(tab => (
          <div 
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              color: activeTab === tab.id ? '#e66b33' : '#999',
              width: '60px',
              cursor: 'pointer'
            }}
          >
            {tab.icon}
            <span style={{ fontSize: '11px', fontWeight: activeTab === tab.id ? 'bold' : 'normal' }}>{tab.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default MobileLayout;
