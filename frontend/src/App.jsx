import React, { useState, useEffect } from 'react';
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
import './App.css';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderWithLayout = (element) => {
    return isMobile ? <MobileLayout>{element}</MobileLayout> : element;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route 
          path="/admin" 
          element={
            <PrivateRoute>
              <AdminPage />
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
