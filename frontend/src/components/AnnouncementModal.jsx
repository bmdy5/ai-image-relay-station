import React, { useState, useEffect } from 'react';
import { Sparkles, Layout, Zap, Palette, CheckCircle2 } from 'lucide-react';
import './AnnouncementModal.css';

const AnnouncementModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const CURRENT_VERSION = '3.1';

  useEffect(() => {
    const hasSeen = localStorage.getItem(`announcement_seen_${CURRENT_VERSION}`);
    const token = localStorage.getItem('token');
    
    // 模拟延迟显示，增加仪式感
    if (token && !hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(`announcement_seen_${CURRENT_VERSION}`, 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="announcement-overlay">
      <div className="announcement-card card">
        <div className="announcement-header">
          <div className="header-icon-wrapper">
            <Sparkles className="header-icon" />
          </div>
          <h2>V3.0 焕新升级</h2>
          <p className="subtitle">更专业，更具创意</p>
        </div>

        <div className="announcement-body">
          <div className="update-item">
            <div className="item-icon-box style">
              <Palette size={20} />
            </div>
            <div className="item-text">
              <h4>风格实验室扩容</h4>
              <p>新增多种艺术风格，创作灵感不再受限。</p>
            </div>
          </div>
          
          <div className="update-item">
            <div className="item-icon-box ui">
              <Layout size={20} />
            </div>
            <div className="item-text">
              <h4>全端 UI 交互重塑</h4>
              <p>PC 专业工作台 + 移动端丝滑手势优化。</p>
            </div>
          </div>

          <div className="update-item">
            <div className="item-icon-box logic">
              <Zap size={20} />
            </div>
            <div className="item-text">
              <h4>智能影像还原</h4>
              <p>图生图精度大幅提升，支持图片智能预处理。</p>
            </div>
          </div>

          <div className="update-item">
            <div className="item-icon-box atmosphere">
              <CheckCircle2 size={20} />
            </div>
            <div className="item-text">
              <h4>沉浸式创作氛围</h4>
              <p>全场域动态背景，操作细节体验全面优化。</p>
            </div>
          </div>
        </div>

        <div className="announcement-footer">
          <label className="dont-show-label">
            <input 
              type="checkbox" 
              checked={dontShowAgain} 
              onChange={(e) => setDontShowAgain(e.target.checked)} 
            />
            <span className="checkbox-custom"></span>
            <span>不再显示</span>
          </label>
          <button className="start-btn btn-primary" onClick={handleClose}>
            立即开启创作
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;
