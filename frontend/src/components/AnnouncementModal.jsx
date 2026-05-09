import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Zap, Palette, Bug, CreditCard, TrendingUp, Layout } from 'lucide-react';
import request from '../api/request';
import './AnnouncementModal.css';

const ICON_MAP = {
  security: ShieldCheck,
  feature: Zap,
  ui: Layout,
  bug: Bug,
  payment: CreditCard,
  performance: TrendingUp,
  other: Palette,
};

const AnnouncementModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    request.get('/announcement').then(res => {
      const data = res.data || res;
      if (!data || !data.version || !data.items?.length) return;
      const seenKey = `announcement_seen_${data.version}`;
      if (localStorage.getItem(seenKey)) return;
      setAnnouncement(data);
      setTimeout(() => setIsOpen(true), 800);
    }).catch(() => {});
  }, []);

  const handleClose = () => {
    if (dontShowAgain && announcement) {
      localStorage.setItem(`announcement_seen_${announcement.version}`, 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen || !announcement) return null;

  return (
    <div className="announcement-overlay">
      <div className="announcement-card card">
        <div className="announcement-header">
          <div className="header-icon-wrapper">
            <Sparkles className="header-icon" />
          </div>
          <h2>{announcement.title || 'Visionary 持续进化'}</h2>
          <p className="subtitle">{new Date().toLocaleDateString('zh-CN', { year:'numeric', month:'long', day:'numeric' })}</p>
        </div>

        <div className="announcement-body">
          {announcement.items.map((item, i) => {
            const Icon = ICON_MAP[item.icon] || ICON_MAP.other;
            return (
              <div className="update-item" key={i}>
                <div className={`item-icon-box ${item.icon || 'other'}`}>
                  <Icon size={20} />
                </div>
                <div className="item-text">
                  <h4>{item.title}</h4>
                  <p>{item.content}</p>
                </div>
              </div>
            );
          })}
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
