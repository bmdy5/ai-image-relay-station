import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, X
} from 'lucide-react';
import RechargeModal from '../components/RechargeModal';
import Showcase from '../components/Showcase';
import request from '../api/request';

import { PulseIcon, OrbitIcon, LatticeIcon } from '../components/PricingIcons';

// 终极 3D 艺术级卡片
const PricingCard = ({ tier, onRecharge }) => {
  const tiltRef = useRef(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleMouseMove = (e) => {
    if (!tiltRef.current) return;
    const rect = tiltRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // 灵敏度系数 10
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    tiltRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    // 更新所有高光层
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    tiltRef.current.querySelectorAll('.pricing-card-glint').forEach(glint => {
      glint.style.setProperty('--mouse-x', `${percentX}%`);
      glint.style.setProperty('--mouse-y', `${percentY}%`);
    });
  };

  const handleMouseLeave = () => {
    if (tiltRef.current) {
      tiltRef.current.style.transform = `rotateX(0deg) rotateY(0deg)`;
    }
  };

  return (
    <div
      className={`pricing-card-outer tier-${tier.id} ${isFlipped ? 'is-flipped' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {/* 独立背景流光层 (仅专业版) */}
      {tier.id === 'master' && <div className="liquid-border" />}

      {/* Tilt 物理倾斜层 */}
      <div ref={tiltRef} className="pricing-card-tilt-wrapper">
        {/* Flip 翻转层 */}
        <div className="pricing-card-flip-inner">
          {/* 正面 */}
          <div className={`pricing-card-face face-front face-${tier.id}`}>
            <div className="pricing-card-glint" />
            <div className="noise-overlay" />

            <div className="abstract-icon-stage">
              {tier.id === 'basic' && <PulseIcon />}
              {tier.id === 'advanced' && <OrbitIcon />}
              {tier.id === 'master' && <LatticeIcon />}
            </div>

            <h3 className="plan-title">{tier.name}</h3>
            <p className="plan-desc">{tier.description}</p>

            <div className="feature-list">
              {tier.features.map((f, i) => (
                <div key={i} className="feature-item">
                  <div className="feature-dot" />
                  <span className="feature-text">{f}</span>
                </div>
              ))}
            </div>

            <div className="flip-hint">点击翻转查看价格</div>
          </div>

          {/* 背面 */}
          <div className={`pricing-card-face face-back back-${tier.id}`}>
            <div className="pricing-card-glint" />
            <div className="noise-overlay" />

            <div className="back-content-centered">
              <div className="price-top-group">
                <span className="back-label">ENERGY REFILL</span>
                <p className="back-price">{tier.points}</p>
                <p className="back-info">CREDITS · ¥{tier.price}.00</p>
              </div>
              <button
                className="buy-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onRecharge(tier.price);
                }}
              >
                立即充值
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .pricing-card-outer {
          width: 360px;
          height: 540px;
          position: relative;
          cursor: pointer;
          perspective: 2000px;
        }

        /* 3D 逻辑分离：Tilt 与 Flip */
        .pricing-card-tilt-wrapper {
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.1s ease-out;
        }

        .pricing-card-flip-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pricing-card-outer.is-flipped .pricing-card-flip-inner {
          transform: rotateY(180deg);
        }

        /* 通用卡面 - 浅色毛玻璃材质 */
        .pricing-card-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 44px;
          padding: 60px 45px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: 0 20px 60px rgba(0,0,0,0.03);
          transition: all 0.3s;
        }

        .face-back { transform: rotateY(180deg); }

        /* 特殊材质方案 */
        .face-advanced { 
          background: rgba(230, 107, 51, 0.85); 
          border-color: var(--pricing-primary); 
        }
        .face-master { 
          background: linear-gradient(135deg, rgba(29, 29, 31, 0.85) 0%, rgba(0, 0, 0, 0.85) 100%); 
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .back-basic { background: rgba(255, 255, 255, 0.8); color: #000; }
        .back-advanced { background: rgba(230, 107, 51, 0.85); color: #fff; }
        .back-master { 
          background: linear-gradient(135deg, rgba(29, 29, 31, 0.85) 0%, rgba(0, 0, 0, 0.85) 100%); 
          color: #fff; 
        }

        /* 流光高光 */
        .pricing-card-glint {
          position: absolute; inset: 0; pointer-events: none; z-index: 5; opacity: 0; transition: opacity 0.5s;
          background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0,0,0,0.05) 0%, transparent 60%);
        }
        .face-master .pricing-card-glint {
          background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.1) 0%, transparent 60%);
        }
        .pricing-card-outer:hover .pricing-card-glint { opacity: 1; }

        /* 专业版流光边框 */
        .liquid-border {
          position: absolute; inset: -2px; border-radius: 46px; z-index: -1; opacity: 0.5;
          background: conic-gradient(from var(--angle), transparent 70%, var(--pricing-primary) 85%, #ffcc00 100%);
          animation: rotate-border 4s linear infinite;
        }
        @keyframes rotate-border { to { --angle: 360deg; } }

        /* 排版细节 */
        .plan-title { font-family: 'Outfit'; font-size: 32px; font-weight: 900; margin-bottom: 12px; letter-spacing: -1px; color: var(--text-main); }
        .tier-master .plan-title { color: #fff; }
        .plan-desc { font-size: 15px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 40px; }
        .tier-master .plan-desc { color: rgba(255,255,255,0.4); }
        
        .feature-item { display: grid; grid-template-columns: 12px 1fr; gap: 16px; margin-bottom: 24px; align-items: center; }
        .feature-dot { width: 6px; height: 6px; background: var(--pricing-primary); border-radius: 50%; }
        .feature-text { font-size: 15px; font-weight: 600; color: var(--text-main); }
        .tier-master .feature-text { color: rgba(255,255,255,0.8); }

        /* 背面排版 */
        .back-content-centered { display: flex; flex-direction: column; justify-content: space-between; align-items: center; height: 100%; width: 100%; text-align: center; }
        .back-label { font-size: 11px; letter-spacing: 6px; opacity: 0.5; margin-bottom: 20px; display: block; font-weight: 800; }
        .back-price { font-family: 'Outfit'; font-size: 84px; font-weight: 900; margin: 0; line-height: 1; letter-spacing: -3px; }
        .back-info { font-size: 18px; font-weight: 700; color: var(--pricing-primary); margin-top: 15px; }
        .back-advanced .back-info { color: #fff; opacity: 0.9; }
        .back-master .back-price { color: var(--pricing-primary); text-shadow: 0 0 30px rgba(230, 107, 51, 0.3); }

        .buy-btn {
          width: 100%; padding: 24px; border-radius: 24px; border: none; font-size: 18px; font-weight: 800; cursor: pointer; transition: all 0.3s;
          background: #1d1d1f; color: #fff;
        }
        .back-basic .buy-btn { background: #000; color: #fff; }
        .back-advanced .buy-btn { background: #fff; color: var(--pricing-primary); }
        .back-master .buy-btn { background: var(--pricing-primary); color: #fff; }
        .buy-btn:hover { transform: scale(1.02); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        
        .flip-hint { margin-top: auto; font-size: 12px; opacity: 0.3; text-align: center; font-weight: 700; }
      `}</style>
    </div>
  );
};


const PCPricingPage = () => {
  const [showRecharge, setShowRecharge] = useState(false);
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
      description: '开启 AI 艺术之旅，体验初步感知力',
      features: ['100 创作积分永久有效', '标准生成引擎支持', '约可创作 20 张艺术作品'] 
    },
    { 
      id: 'advanced',
      name: '进阶版', 
      price: 45, 
      points: 450, 
      description: '为高频创作者而生，解锁更高画质',
      features: ['450 创作积分永久有效', '解锁 HD 高清生成模式', '优先创作队列 (无须等待)'],
      recommended: true 
    },
    { 
      id: 'master',
      name: '专业版', 
      price: 90, 
      points: 900, 
      description: '大师级视觉引擎，掌控顶级算力',
      features: ['900 创作积分永久有效', '4K 极致视觉引擎通道', '全商业用途授权许可'] 
    }
  ];

  const handleRecharge = (amount) => {
    setShowRecharge(amount);
    setShowRecharge(true);
  };

  return (
    <div className="pricing-page-root" style={{ 
      color: 'var(--text-main)', 
      background: 'transparent', 
      position: 'relative', 
      padding: '40px 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%'
    }}>
      <div className="pricing-header" style={{ textAlign: 'center', marginBottom: '60px', position: 'relative', zIndex: 4 }}>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: '900', 
          letterSpacing: '-1.5px', 
          margin: 0,
          background: 'linear-gradient(180deg, #1d1d1f 0%, #6e6e73 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: 'Outfit'
        }}>
          注入无限创作能量
        </h1>
        <p style={{ marginTop: '12px', fontSize: '18px', color: 'var(--text-secondary)', fontWeight: '500' }}>
          选择适合您的计划，释放极致艺术创造力
        </p>
      </div>

      <div className="pricing-grid" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '30px', 
        position: 'relative', 
        zIndex: 4,
        flexWrap: 'nowrap', // 锁定不折行
        width: '100%',
        maxWidth: '1100px' // 限制最大宽度确保不会太散
      }}>
        {tiers.map(tier => (
          <PricingCard key={tier.id} tier={tier} onRecharge={handleRecharge} />
        ))}
      </div>

      <footer style={{
        opacity: 0.3,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        paddingTop: '80px',
        fontWeight: '600'
      }}>
        <ShieldCheck size={18} /> 企业级支付安全加密 · 积分秒级到账 · 7x24h 运行
      </footer>

      {showRecharge && (
        <RechargeModal
          uid={userInfo?.uid} onClose={() => setShowRecharge(false)}
          onSuccess={() => { setShowRecharge(false); fetchData(); }}
        />
      )}

      {previewImage && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)',
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
            style={{ maxHeight: '90vh', maxWidth: '95vw', borderRadius: '24px', boxShadow: '0 50px 100px rgba(0,0,0,0.8)', objectFit: 'contain' }}
            alt="Preview"
          />
        </div>
      )}
    </div>
  );
};


export default PCPricingPage;
