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
          <h2>Visionary 焕新升级</h2>
          <p className="subtitle">{new Date().toLocaleDateString('zh-CN', { year:'numeric', month:'long', day:'numeric' })}</p>
        </div>

        <div className="announcement-body">
          <div className="update-item">
            <div className="item-icon-box style">
              <Zap size={20} />
            </div>
            <div className="item-text">
              <h4>每日签到领积分</h4>
              <p>每天签到 +5 积分，邀请好友首画再得 +10。</p>
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
              <h4>系统稳定性提升</h4>
              <p>修复多项已知问题，登录注册流程更加顺畅。</p>
            </div>
          </div>

          <div className="update-item">
            <div className="item-icon-box atmosphere">
              <Palette size={20} />
            </div>
            <div className="item-text">
              <h4>交互细节优化</h4>
              <p>积分即时显示、图片自定义命名、维护模式优雅降级。</p>
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
