import React, { useState, useEffect } from 'react';
import request from './api/request';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/HomePage';
import MobileHomePage from './pages/MobileHomePage';
import ProfilePage from './pages/ProfilePage';
import HistoryPage from './pages/HistoryPage';
import PricingPage from './pages/PricingPage';
import GuidePage from './pages/GuidePage';
import PointsHistoryPage from './pages/PointsHistoryPage';
import PrivateRoute from './components/PrivateRoute';
import MobileLayout from './components/MobileLayout';
import PCLayout from './components/PCLayout';
import MaintenanceModal from './components/MaintenanceModal';
import AnnouncementModal from './components/AnnouncementModal';
import './App.css';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    
    const handleMaintenance = () => setIsMaintenance(true);
    window.addEventListener('system-maintenance', handleMaintenance);
    
    // 启动瞬间进行健康探测
    const checkHealth = async () => {
      try {
        await request.get('/health');
      } catch (err) {
        // 如果报错（拦截器会自动发出系统维护事件，这里只需捕获防止未处理异常）
      }
    };
    checkHealth();
    
    const handlePwaReward = (e) => {
      alert(`🎉 恭喜！您已成功安装桌面版，获赠 10 积分！`);
    };
    window.addEventListener('pwa-reward-success', handlePwaReward);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('system-maintenance', handleMaintenance);
      window.removeEventListener('pwa-reward-success', handlePwaReward);
    };
  }, []);

  if (isMaintenance) {
    return <MaintenanceModal />;
  }

  const renderWithLayout = (element) => {
    return isMobile ? <MobileLayout>{element}</MobileLayout> : <PCLayout>{element}</PCLayout>;
  };

  return (
    <Router>
      <AnnouncementModal />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route 
          path="/admin" 
          element={
            <PrivateRoute>
              {renderWithLayout(<AdminPage isMobile={isMobile} />)}
            </PrivateRoute>
          } 
        />
        <Route 
          path="/history" 
          element={
            <PrivateRoute>
              {renderWithLayout(<HistoryPage isMobile={isMobile} />)}
            </PrivateRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              {renderWithLayout(<ProfilePage isMobile={isMobile} />)}
            </PrivateRoute>
          } 
        />
        <Route 
          path="/points-history" 
          element={
            <PrivateRoute>
              {renderWithLayout(<PointsHistoryPage isMobile={isMobile} />)}
            </PrivateRoute>
          } 
        />
        <Route 
          path="/pricing" 
          element={
            <PrivateRoute>
              {renderWithLayout(<PricingPage isMobile={isMobile} />)}
            </PrivateRoute>
          } 
        />
        <Route 
          path="/guide" 
          element={
            <PrivateRoute>
              {renderWithLayout(<GuidePage isMobile={isMobile} />)}
            </PrivateRoute>
          } 
        />
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              {renderWithLayout(isMobile ? <MobileHomePage /> : <HomePage isMobile={isMobile} />)}
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
