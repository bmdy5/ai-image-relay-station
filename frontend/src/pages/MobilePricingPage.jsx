import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Zap, Diamond, Crown, ShieldCheck, Check, Info, ArrowRight, X
} from 'lucide-react';
import RechargeModal from '../components/RechargeModal';
import Showcase from '../components/Showcase';
import request from '../api/request';
import { PulseIcon, OrbitIcon, LatticeIcon } from '../components/PricingIcons';

// 手机端专用高级翻转卡片
const MobilePricingCard = ({ tier, onRecharge }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className={`mobile-pricing-card ${isFlipped ? 'is-flipped' : ''} tier-${tier.id}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {/* 独立背景流光层 (仅专业版) */}
      {tier.id === 'master' && <div className="liquid-border" />}
      
      <div className="card-inner">
        {/* 正面 */}
        <div className={`card-face face-front face-${tier.id}`}>
          <div className="noise-overlay" />
          <div className="icon-wrapper">
            {tier.id === 'basic' && <PulseIcon />}
            {tier.id === 'advanced' && <OrbitIcon />}
            {tier.id === 'master' && <LatticeIcon />}
          </div>
          <h3 className="tier-name">{tier.name}</h3>
          <p className="tier-desc">{tier.description}</p>
          <div className="feature-group">
            {tier.features.map((f, i) => (
              <div key={i} className="feature-row">
                <div className="feature-dot" />
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div className="flip-hint">点击查看价格 ⟳</div>
        </div>

        {/* 背面 - 重新设计的苹果风格卡片 */}
        <div className={`card-face face-back back-${tier.id}`}>
          <div className="noise-overlay" />
          <div className="back-content-stack">
            <div className="top-branding">
              <span className="back-label">ENERGY REFILL</span>
            </div>
            
            <div className="middle-price">
              <div className="points-main">{tier.points}</div>
              <div className="points-sub">CREDITS AVAILABLE</div>
            </div>

            <div className="bottom-action">
              <div className="price-tag">¥{tier.price}.00</div>
              <button 
                className="buy-btn-premium"
                onClick={(e) => {
                  e.stopPropagation();
                  onRecharge(tier.price);
                }}
              >
                立即充值
              </button>
            </div>
            <div className="flip-hint-back">点击返回详情</div>
          </div>
        </div>
      </div>

      <style>{`
        .mobile-pricing-card {
          flex: 0 0 85%;
          height: 520px;
          perspective: 2000px;
          position: relative;
          scroll-snap-align: center;
          margin-bottom: 20px;
        }
        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
          transform-style: preserve-3d;
        }
        .mobile-pricing-card.is-flipped .card-inner {
          transform: rotateY(180deg);
        }
        .card-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 40px;
          padding: 40px 30px;
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 20px 50px rgba(0,0,0,0.06);
          overflow: hidden;
        }
        .face-back { transform: rotateY(180deg); }
        
        /* 品牌配色 */
        .face-advanced, .back-advanced { background: rgba(230, 107, 51, 0.95); color: #fff; }
        .face-master, .back-master { background: linear-gradient(135deg, #1d1d1f 0%, #000 100%); color: #fff; border-color: rgba(255,255,255,0.1); }

        /* 正面样式 */
        .icon-wrapper { margin-bottom: 30px; align-self: center; transform: scale(1.1); }
        .tier-name { font-size: 26px; font-weight: 900; margin-bottom: 10px; text-align: center; letter-spacing: -0.5px; }
        .tier-desc { font-size: 14px; opacity: 0.6; text-align: center; line-height: 1.6; margin-bottom: 30px; padding: 0 10px; }
        .feature-group { width: 100%; display: flex; flex-direction: column; gap: 16px; margin-bottom: auto; }
        .feature-row { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; }
        .feature-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--primary); }
        .face-advanced .feature-dot, .face-master .feature-dot { background: #fff; }

        /* 背面样式 - 终极对齐 */
        .back-content-stack { height: 100%; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: space-between; }
        .back-label { font-size: 12px; letter-spacing: 6px; opacity: 0.5; font-weight: 800; }
        
        .middle-price { text-align: center; }
        .points-main { font-family: 'Outfit'; font-size: 100px; font-weight: 900; line-height: 0.9; letter-spacing: -4px; margin-bottom: 10px; }
        .points-sub { font-size: 11px; font-weight: 800; letter-spacing: 2px; opacity: 0.4; }
        
        .bottom-action { width: 100%; text-align: center; }
        .price-tag { font-size: 24px; font-weight: 800; color: var(--primary); margin-bottom: 20px; }
        .back-advanced .price-tag, .back-master .price-tag { color: #fff; }
        
        .buy-btn-premium {
          width: 100%; padding: 20px; border-radius: 22px; border: none; font-size: 18px; font-weight: 800; cursor: pointer;
          background: #1d1d1f; color: #fff; transition: all 0.3s;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .back-advanced .buy-btn-premium { background: #fff; color: var(--primary); }
        .back-master .buy-btn-premium { background: var(--primary); color: #fff; box-shadow: 0 10px 30px rgba(124, 77, 255, 0.3); }
        
        .flip-hint, .flip-hint-back { font-size: 12px; opacity: 0.3; font-weight: 700; margin-top: 15px; text-align: center; }

        /* 专业版流光边框 */
        .liquid-border {
          position: absolute; inset: -1.5px; border-radius: 41.5px; z-index: -1;
          background: conic-gradient(from var(--angle), transparent 70%, var(--primary) 85%, #ffcc00 100%);
          animation: rotate-border 4s linear infinite;
        }
        @keyframes rotate-border { to { --angle: 360deg; } }
      `}</style>

    </div>
  );
};

const MobilePricingPage = ({ isMobile }) => {
  const navigate = useNavigate();
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
      description: '开启 AI 艺术之旅，体验初步感知力',
      features: ['150 创作积分永久有效', '标准生成引擎支持', '移动端全功能同步'] 
    },
    { 
      id: 'advanced',
      name: '专业版', 
      price: 30, 
      points: 500, 
      description: '生产力全开，解锁更高画质与细节',
      features: ['500 创作积分永久有效', '解锁专业级生成模式', '优先创作队列支持'],
      recommended: true 
    },
    { 
      id: 'master',
      name: '旗舰版', 
      price: 50, 
      points: 800, 
      description: '顶级光影构建，掌控顶级算力',
      features: ['800 创作积分永久有效', '4K 旗舰视觉引擎通道', '全商业用途授权许可'] 
    }
  ];

  const handleRecharge = (amount) => {
    setRechargeAmount(amount);
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
        overflowX: 'auto',
        padding: '20px',
        gap: '20px',
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch'
      }}>
        {tiers.map(tier => (
          <MobilePricingCard key={tier.id} tier={tier} onRecharge={handleRecharge} />
        ))}
      </div>

      <div style={{ padding: '0 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px', opacity: 0.7 }}>
        * 支持 <span style={{ color: 'var(--primary)', fontWeight: '700' }}>自定义任意金额</span> 充值（1元起充）
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
                <span style={{ width: '45px', textAlign: 'center' }}>标准版</span>
                <span style={{ width: '45px', textAlign: 'center' }}>专业版</span>
                <span style={{ width: '45px', textAlign: 'center' }}>旗舰版</span>
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

      {/* 1元体验包自动弹窗 */}
      {showExperiencePopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(15px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '340px', padding: '40px 30px', borderRadius: '32px', textAlign: 'center', position: 'relative', background: '#fff', boxShadow: '0 30px 60px rgba(0,0,0,0.3)' }}>
            <button onClick={closePopup} style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}><X size={24} /></button>
            <div style={{ width: '70px', height: '70px', background: 'rgba(230,107,51,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <PulseIcon size={32} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '10px' }}>新用户特惠礼包</h2>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' }}>
              只需 <strong style={{ color: 'var(--primary)', fontSize: '18px' }}>¥1</strong> 即可获得 <strong style={{ color: 'var(--primary)', fontSize: '18px' }}>20</strong> 积分<br/>
              <span style={{ fontSize: '11px', opacity: 0.6 }}>（限时 24 小时，仅限一次）</span>
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px', cursor: 'pointer' }} onClick={() => setDontShowAgain(!dontShowAgain)}>
               <input type="checkbox" checked={dontShowAgain} readOnly style={{ cursor: 'pointer' }} />
               <span style={{ fontSize: '13px', color: '#999' }}>不再提示此优惠</span>
            </div>
            <button 
              className="buy-btn-premium" 
              style={{ background: 'var(--primary)', color: '#fff', width: '100%', padding: '16px' }}
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
          className="experience-floating-container-mobile"
          style={{
            position: 'fixed', right: '16px', bottom: '150px', zIndex: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end'
          }}
        >
          <div className="pill-expand-wrapper-mobile" style={{
            background: userInfo.has_used_experience 
              ? 'linear-gradient(135deg, #666, #999)' 
              : 'linear-gradient(135deg, var(--primary), #7c4dff)',
            borderRadius: '100px',
            display: 'flex',
            alignItems: 'center',
            height: '40px',
            padding: '3px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
            transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
            overflow: 'hidden',
            width: '40px' // 默认圆圈状态
          }}>
            <div style={{ 
              background: '#fff', minWidth: '34px', height: '34px', borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
               <div style={{ width: '8px', height: '8px', 
                 background: userInfo.has_used_experience ? '#666' : 'var(--primary)', 
                 borderRadius: '50%', animation: 'inner-pulse 1.5s infinite' }} 
               />
            </div>
            
            <div className="pill-text-content-mobile" style={{ 
              color: '#fff', 
              whiteSpace: 'nowrap',
              padding: '0 12px 0 6px',
              opacity: 0,
              transition: 'opacity 0.2s'
            }}>
              <span style={{ fontSize: '12px', fontWeight: '900', marginRight: '6px' }}>
                {userInfo.has_used_experience ? '积分充值' : '1元特惠'}
              </span>
              <span style={{ fontSize: '10px', fontWeight: '800', background: 'rgba(255,255,255,0.2)', padding: '1px 6px', borderRadius: '4px' }}>
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
        @keyframes inner-pulse {
          0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(230, 107, 51, 0.4); }
          100% { transform: scale(2); opacity: 0; box-shadow: 0 0 0 15px rgba(230, 107, 51, 0); }
        }
        .experience-floating-container-mobile:active .pill-expand-wrapper-mobile,
        .experience-floating-container-mobile:hover .pill-expand-wrapper-mobile {
          width: 160px;
        }
        .experience-floating-container-mobile:active .pill-text-content-mobile,
        .experience-floating-container-mobile:hover .pill-text-content-mobile {
          opacity: 1;
          transition: opacity 0.3s 0.1s;
        }
      `}} />
    </div>
  );
};

export default MobilePricingPage;
