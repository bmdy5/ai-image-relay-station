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
  const [rechargeAmount, setRechargeAmount] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  // 体验包状态
  const [showExperiencePopup, setShowExperiencePopup] = useState(false);
  const [showCornerCard, setShowCornerCard] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const fetchData = async () => {
    try {
      const user = await request.get('/auth/me');
      setUserInfo(user);
      
      const hasDismissed = localStorage.getItem('hideExperiencePopup');
      // 如果没用过体验包，且没有勾选不再显示
      if (user && !user.has_used_experience && !hasDismissed) {
        setShowExperiencePopup(true);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchData();
  }, []);

  const closePopup = () => {
    if (dontShowAgain) {
      localStorage.setItem('hideExperiencePopup', 'true');
    }
    setShowExperiencePopup(false);
  };

  const tiers = [
    { 
      id: 'basic',
      name: '标准版', 
      price: 10, 
      points: 150, 
      description: '开启 AI 艺术之旅，满足日常社交分享',
      features: ['150 创作积分永久有效', '全量 30+ 艺术风格解锁', '支持多任务并行创作'] 
    },
    { 
      id: 'advanced',
      name: '专业版', 
      price: 30, 
      points: 500, 
      description: '生产力全开，解锁专业级高清细节',
      features: ['500 创作积分永久有效', '高清增强引擎全功能支持', '更具性价比的创作方案'],
      recommended: true 
    },
    { 
      id: 'master',
      name: '旗舰版', 
      price: 50, 
      points: 800, 
      description: '顶级光影构想，掌控商用级视觉进化',
      features: ['800 创作积分永久有效', '大师级引擎与排版全功能', '大额充值最高优惠方案'] 
    }
  ];

  const handleRecharge = (amount) => {
    setRechargeAmount(amount);
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

      <div style={{ marginTop: '30px', color: 'var(--text-secondary)', fontSize: '14px', opacity: 0.6, fontWeight: '500' }}>
        * 以上为推荐套餐，您也可以点击“立即充值”后 <span style={{ color: 'var(--pricing-primary)', fontWeight: '700' }}>自定义任意金额</span>（1元起充）
      </div>

      {/* PC 端生成模式对比看板 */}
      <div style={{ 
        marginTop: '60px', 
        width: '100%', 
        maxWidth: '1000px', 
        background: 'rgba(255,255,255,0.03)', 
        borderRadius: '32px', 
        padding: '40px',
        border: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '30px', textAlign: 'center', letterSpacing: '1px' }}>生成模式能力矩阵</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '20px', fontSize: '14px', opacity: 0.5 }}>对比维度</th>
              <th style={{ padding: '20px', textAlign: 'center' }}>标准模式</th>
              <th style={{ padding: '20px', textAlign: 'center' }}>专业模式</th>
              <th style={{ padding: '20px', textAlign: 'center' }}>旗舰模式</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: '艺术风格库', std: '基础风格 (适合入门)', adv: '全量解锁 (30+ 风格)', master: '旗舰专属 (商业级排版)' },
              { label: '迭代精修能力', std: '不支持精修', adv: '支持 2 次重塑精修', master: '深度进化 (无限精修潜力)' },
              { label: '渲染引擎核心', std: 'Core 基础核心', adv: 'Visionary Pro 增强引擎', master: 'Master Ultra 顶级引擎' },
              { label: '单次积分消耗', std: '5 积分 / 张', adv: '10 积分 / 张', master: '15 积分 / 张' }
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: i === 3 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '25px 20px', fontWeight: '700', fontSize: '15px' }}>{row.label}</td>
                <td style={{ padding: '25px 20px', textAlign: 'center', fontSize: '14px', opacity: 0.7 }}>{row.std}</td>
                <td style={{ padding: '25px 20px', textAlign: 'center', fontSize: '14px', color: '#3b82f6', fontWeight: '600' }}>{row.adv}</td>
                <td style={{ padding: '25px 20px', textAlign: 'center', fontSize: '15px', color: '#e66b33', fontWeight: '900' }}>{row.master}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

      {/* 1元体验包自动弹窗 */}
      {showExperiencePopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '400px', padding: '40px', borderRadius: '32px', textAlign: 'center', position: 'relative', background: 'linear-gradient(135deg, #fff 0%, #fff7e6 100%)', boxShadow: '0 30px 60px rgba(0,0,0,0.3)' }}>
            <button onClick={closePopup} style={{ position: 'absolute', right: '24px', top: '24px', background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}><X size={24} /></button>
            <div style={{ width: '80px', height: '80px', background: 'rgba(230,107,51,0.1)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <PulseIcon />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '12px' }}>新用户专享特惠</h2>
            <p style={{ color: '#666', fontSize: '15px', marginBottom: '24px', lineHeight: '1.6' }}>
              只需 <strong style={{ color: '#e66b33', fontSize: '20px' }}>¥1</strong> 即可获得 <strong style={{ color: '#e66b33', fontSize: '20px' }}>20</strong> 创作积分<br/>
              <span style={{ fontSize: '12px', opacity: 0.6 }}>（限时 24 小时，仅限一次）</span>
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px', cursor: 'pointer' }} onClick={() => setDontShowAgain(!dontShowAgain)}>
               <input type="checkbox" checked={dontShowAgain} readOnly style={{ cursor: 'pointer' }} />
               <span style={{ fontSize: '13px', color: '#999' }}>不再提示此优惠</span>
            </div>
            <button 
              className="buy-btn" 
              style={{ background: '#e66b33', color: '#fff', padding: '18px', fontSize: '18px', width: '100%' }}
              onClick={() => {
                setShowExperiencePopup(false);
                handleRecharge(1);
              }}
            >
              立即 1 元抢购
            </button>
          </div>
        </div>
      )}

      {/* 右下角悬浮卡片 - 永久入口设计 */}
      {userInfo && (
        <div 
          onClick={() => handleRecharge(1)}
          className="experience-floating-container"
          style={{
            position: 'fixed', right: '20px', bottom: '150px', zIndex: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            cursor: 'pointer'
          }}
        >
          <div className="pill-expand-wrapper" style={{
            background: userInfo.has_used_experience 
              ? 'linear-gradient(135deg, #666, #999)' // 已购买后颜色变淡或改为品牌色
              : 'linear-gradient(135deg, #e66b33, #ff9259)',
            borderRadius: '100px',
            display: 'flex',
            alignItems: 'center',
            height: '44px',
            padding: '4px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
            overflow: 'hidden',
            width: '44px' // 默认圆圈状态
          }}>
            <div style={{ 
              background: '#fff', minWidth: '36px', height: '36px', borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
               <div style={{ width: '8px', height: '8px', 
                 background: userInfo.has_used_experience ? '#666' : '#e66b33', 
                 borderRadius: '50%', animation: 'inner-pulse 1.5s infinite' }} 
               />
            </div>
            <div className="pill-text-content" style={{ 
              color: '#fff', 
              whiteSpace: 'nowrap',
              padding: '0 16px 0 8px',
              opacity: 0,
              transition: 'opacity 0.2s'
            }}>
              <span style={{ fontSize: '13px', fontWeight: '900', marginRight: '8px' }}>
                {userInfo.has_used_experience ? '积分充值' : '1元特惠礼包'}
              </span>
              <span style={{ fontSize: '11px', fontWeight: '800', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                {userInfo.has_used_experience ? '去充值' : '立即抢购'}
              </span>
            </div>
          </div>
        </div>
      )}

      {showRecharge && userInfo && (
        <RechargeModal
          uid={userInfo?.uid} onClose={() => setShowRecharge(false)}
          initialAmount={rechargeAmount}
          hasUsedExperience={userInfo?.has_used_experience}
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

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes inner-pulse {
          0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(230, 107, 51, 0.4); }
          100% { transform: scale(2); opacity: 0; box-shadow: 0 0 0 15px rgba(230, 107, 51, 0); }
        }
        .experience-floating-container:hover .pill-expand-wrapper {
          width: 220px;
          box-shadow: 0 15px 40px rgba(230,107,51,0.5);
        }
        .experience-floating-container:hover .pill-text-content {
          opacity: 1;
          transition: opacity 0.3s 0.1s;
        }
      `}} />
    </div>
  );
};

export default PCPricingPage;
