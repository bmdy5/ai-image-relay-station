import React, { useState, useEffect } from 'react';
import { Sparkles, Layout, Zap, Palette, CheckCircle2 } from 'lucide-react';
import './AnnouncementModal.css';

const AnnouncementModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const CURRENT_VERSION = '2026.05.08';

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
          <h2>Visionary 持续进化</h2>
          <p className="subtitle">{new Date().toLocaleDateString('zh-CN', { year:'numeric', month:'long', day:'numeric' })}</p>
        </div>

        <div className="announcement-body">
          <div className="update-item">
            <div className="item-icon-box style">
              <Zap size={20} />
            </div>
            <div className="item-text">
              <h4>游客模式上线</h4>
              <p>未登录也能浏览体验，橙色标签清晰区分，随时随地试用。</p>
            </div>
          </div>

          <div className="update-item">
            <div className="item-icon-box ui">
              <Layout size={20} />
            </div>
            <div className="item-text">
              <h4>一键安装到桌面</h4>
              <p>支持 Android / iOS / PC，像原生 App 一样流畅使用。</p>
            </div>
          </div>

          <div className="update-item">
            <div className="item-icon-box logic">
              <CheckCircle2 size={20} />
            </div>
            <div className="item-text">
              <h4>系统韧性增强</h4>
              <p>API 自动重试、维护模式智能恢复、网络异常优雅降级。</p>
            </div>
          </div>

          <div className="update-item">
            <div className="item-icon-box atmosphere">
              <Palette size={20} />
            </div>
            <div className="item-text">
              <h4>交互打磨</h4>
              <p>输入框智能引导、积分即时刷新、图片自定义命名、微信环境适配。</p>
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
