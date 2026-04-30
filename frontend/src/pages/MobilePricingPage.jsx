import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Zap, Diamond, Crown, ShieldCheck, Check, Info, ArrowRight, X
} from 'lucide-react';
import RechargeModal from '../components/RechargeModal';
import Showcase from '../components/Showcase';
import request from '../api/request';

const MobilePricingPage = ({ isMobile }) => {
  const navigate = useNavigate();
  const [showRecharge, setShowRecharge] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const fetchData = async () => {
    try {
      const user = await request.get('/auth/me');
      setUserInfo(user);
    } catch (err) {}
  };

  useEffect(() => {
    fetchData();
  }, []);

  const tiers = [
    { 
      id: 'basic',
      name: '初探版', 
      price: 10, 
      points: 100, 
      color: 'var(--primary)',
      icon: <Zap size={24} />,
      estimate: '约可创作 20 张标准图',
      features: ['永久有效', '基础生成速度', '移动端同步'] 
    },
    { 
      id: 'advanced',
      name: '进阶版', 
      price: 45, 
      points: 450, 
      color: '#3b82f6',
      icon: <Diamond size={24} />,
      estimate: '约可创作 90 张标准图',
      features: ['优先生成队列', '解锁高清模式', '专属技巧指导'], 
      recommended: true 
    },
    { 
      id: 'master',
      name: '专业版', 
      price: 90, 
      points: 900, 
      color: 'var(--master)',
      icon: <Crown size={24} />,
      estimate: '解锁 60 张大师级笔记',
      features: ['全速商业通道', '视觉推理引擎', '1对1 技术支持'] 
    }
  ];

  const handleRecharge = (amount) => {
    setSelectedAmount(amount);
    setShowRecharge(true);
  };

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', minHeight: '100%', 
      background: 'var(--bg-main)', padding: isMobile ? '0 0 100px 0' : '40px 20px' 
    }}>
      {/* 移动端标题 */}
      {isMobile && (
        <div style={{ padding: '24px 20px 10px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-1px' }}>积分中心</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>选择最适合您的创作计划</p>
        </div>
      )}

      {/* 横向滚动套餐区 */}
      <div style={{
        display: 'flex',
        overflowX: isMobile ? 'auto' : 'hidden',
        padding: isMobile ? '20px' : '0',
        gap: '20px',
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch'
      }}>
        {tiers.map(tier => (
          <div 
            key={tier.id} 
            style={{ 
              flex: isMobile ? '0 0 85%' : 1,
              scrollSnapAlign: 'center',
              background: '#fff',
              borderRadius: '32px',
              padding: '40px 30px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: tier.id === 'master' ? '0 20px 40px rgba(124, 77, 255, 0.15)' : 'var(--shadow)',
              border: tier.recommended ? '2px solid var(--primary)' : '1px solid rgba(0,0,0,0.03)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {tier.recommended && (
              <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--primary)', color: 'white', fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '10px' }}>
                最受欢迎
              </div>
            )}
            
            <div style={{ 
              width: '60px', height: '60px', borderRadius: '20px', 
              background: `${tier.color}10`, color: tier.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '24px'
            }}>
              {tier.icon}
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1D1D1F', marginBottom: '4px' }}>{tier.name}</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
              <span style={{ fontSize: '42px', fontWeight: '900', color: tier.id === 'master' ? 'var(--master)' : '#1D1D1F' }}>{tier.points}</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)' }}>积分</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: tier.color, marginBottom: '24px' }}>¥ {tier.price}</div>

            <div style={{ width: '100%', height: '1px', background: 'rgba(0,0,0,0.03)', marginBottom: '24px' }} />

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1D1D1F', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={14} color={tier.color} /> {tier.estimate}
              </div>
              {tier.features.map(f => (
                <div key={f} style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={14} color="#34C759" /> {f}
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleRecharge(tier.price)}
              style={{
                width: '100%', padding: '16px', borderRadius: '18px', border: 'none',
                background: tier.id === 'master' ? 'var(--master)' : tier.recommended ? 'var(--primary)' : '#1D1D1F',
                color: 'white', fontWeight: '800', fontSize: '15px', cursor: 'pointer',
                boxShadow: tier.recommended ? '0 10px 25px var(--primary-glow)' : 'none'
              }}
            >
              立即购买
            </button>
          </div>
        ))}
      </div>

      {/* 权益对比看板 */}
      <div style={{ padding: '20px', marginTop: '10px' }}>
        <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', boxShadow: 'var(--shadow)' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={18} color="var(--primary)" /> 权益对比
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px', fontWeight: '800', color: '#999' }}>
              <span style={{ width: '80px' }}>对比项</span>
              <div style={{ display: 'flex', gap: '24px', marginRight: '4px' }}>
                <span style={{ width: '45px', textAlign: 'center' }}>标准</span>
                <span style={{ width: '45px', textAlign: 'center' }}>进阶</span>
                <span style={{ width: '45px', textAlign: 'center' }}>大师</span>
              </div>
            </div>
            {[
              { label: '生成画质', std: '720P', adv: '1080P', master: '4K Pro ✦' },
              { label: '生成速度', std: '排队', adv: '优先', master: '极速' },
              { label: 'AI 创作笔记', std: '✕', adv: '✕', master: '大师笔记' },
              { label: '商业授权', std: '✕', adv: '支持', master: '全支持' }
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{row.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#999', width: '45px', textAlign: 'center', fontSize: '11px' }}>{row.std}</span>
                  <ArrowRight size={10} color="#E5E5EA" />
                  <span style={{ color: '#3b82f6', width: '45px', textAlign: 'center', fontSize: '11px', fontWeight: '600' }}>{row.adv}</span>
                  <ArrowRight size={10} color="#E5E5EA" />
                  <span style={{ fontWeight: '800', color: 'var(--master)', width: '45px', textAlign: 'center', fontSize: '11px' }}>{row.master}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 作品画廊海报 */}
      <div style={{ padding: isMobile ? '0' : '20px', marginTop: '20px' }}>
        <Showcase setPreviewImage={setPreviewImage} />
      </div>

      <footer style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <ShieldCheck size={14} /> 支付安全保障 · 积分秒级到账
      </footer>

      {showRecharge && (
        <RechargeModal 
          uid={userInfo?.uid} onClose={() => setShowRecharge(false)} 
          onSuccess={() => { setShowRecharge(false); fetchData(); }}
        />
      )}

      {/* 图片预览 Modal */}
      {previewImage && (
        <div 
          style={{ 
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out'
          }}
          onClick={() => setPreviewImage(null)}
        >
          <button style={{ position: 'absolute', top: '30px', right: '30px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={32} />
          </button>
          <img 
            src={previewImage} 
            style={{ maxHeight: '90vh', maxWidth: '95vw', borderRadius: '12px', boxShadow: '0 0 50px rgba(0,0,0,0.5)', objectFit: 'contain' }} 
            alt="Preview" 
          />
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .loading-spin { animation: spin 1s linear infinite; }
        @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpDrawer { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}} />
    </div>
  );
};

export default MobilePricingPage;
