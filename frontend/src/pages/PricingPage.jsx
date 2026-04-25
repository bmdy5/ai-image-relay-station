import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Zap, 
  Check, 
  Coins, 
  Star,
  Diamond,
  Crown,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import RechargeModal from '../components/RechargeModal';
import request from '../api/request';

const PricingPage = () => {
  const navigate = useNavigate();
  const [showRecharge, setShowRecharge] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [userInfo, setUserInfo] = useState(null);

  React.useEffect(() => {
    request.get('/auth/me').then(setUserInfo).catch(() => {});
  }, []);

  const tiers = [
    { 
      name: '初探版', 
      price: 9.9, 
      points: 100, 
      color: '#e66b33',
      icon: <Zap size={24} />,
      features: ['可生成 20 张标准图', '或 6 张大师级艺术图', '永久有效', '基础技术支持'] 
    },
    { 
      name: '进阶版', 
      price: 45, 
      points: 500, 
      color: '#3b82f6',
      icon: <Diamond size={24} />,
      features: ['可生成 100 张标准图', '或 33 张大师级艺术图', '优先生成队列', '专属技巧指导'], 
      recommended: true 
    },
    { 
      name: '专业版', 
      price: 90, 
      points: 1000, 
      color: '#8b5cf6',
      icon: <Crown size={24} />,
      features: ['可生成 200 张标准图', '或 66 张大师级艺术图', '全速商业通道', '1对1 技术专家支持'] 
    }
  ];

  const handleRecharge = (amount) => {
    setSelectedAmount(amount);
    setShowRecharge(true);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', animation: 'fadeIn 0.5s ease' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
        <button 
          onClick={() => navigate('/')} 
          style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}
        >
          <ArrowLeft size={20} /> 返回首页
        </button>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', flex: 1 }}>价格与积分计划</h1>
        <div style={{ width: '100px' }}></div>
      </header>

      {/* 消费规则 */}
      <section className="card" style={{ padding: '30px', marginBottom: '40px', background: '#fcfcfc' }}>
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap size={22} color="#e66b33" fill="#e66b33" /> 积分消耗规则
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {[
            { label: '标准生成', cost: 5, desc: '日常练手、极速草图', icon: <Zap size={18} />, color: '#e66b33' },
            { label: '高清生成', cost: 10, desc: '细腻光影、高保真细节', icon: <Diamond size={18} />, color: '#3b82f6' },
            { label: '大师生成', cost: 15, desc: '极致色彩、AI 画质增强', icon: <Crown size={18} />, color: '#8b5cf6' }
          ].map(item => (
            <div key={item.label} style={{ padding: '20px', borderRadius: '12px', border: '1px solid #eee', background: '#fff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: item.color }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: item.color, marginBottom: '10px' }}>
                {item.icon} <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{item.label}</span>
              </div>
              <div style={{ color: '#333', fontSize: '28px', fontWeight: '900', margin: '5px 0' }}>{item.cost} <span style={{ fontSize: '14px', color: '#999', fontWeight: 'normal' }}>积分/张</span></div>
              <div style={{ color: '#999', fontSize: '12px' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 套餐卡片 */}
      <div style={{ display: 'flex', gap: '25px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {tiers.map(tier => (
          <div 
            key={tier.name} 
            className="card" 
            style={{ 
              flex: 1, minWidth: '280px', padding: '40px 30px', textAlign: 'center', position: 'relative',
              border: tier.recommended ? '2px solid #e66b33' : '1px solid transparent',
              transform: tier.recommended ? 'scale(1.05)' : 'none',
              zIndex: tier.recommended ? 2 : 1
            }}
          >
            <div style={{ 
              display: 'flex', justifyContent: 'center', alignItems: 'center', 
              width: '50px', height: '50px', borderRadius: '12px', background: `${tier.color}15`, 
              color: tier.color, margin: '0 auto 20px' 
            }}>
              {tier.icon}
            </div>
            <h2 style={{ fontSize: '22px', marginBottom: '8px', fontWeight: '800' }}>{tier.name}</h2>
            <div style={{ color: tier.color, fontSize: '42px', fontWeight: '900', marginBottom: '0px' }}>{tier.points} <span style={{ fontSize: '16px', fontWeight: 'normal' }}>积分</span></div>
            <div style={{ color: '#999', fontSize: '16px', marginBottom: '30px' }}>
              售价 ¥ {tier.price} <span style={{ textDecoration: 'line-through', fontSize: '12px', marginLeft: '5px' }}>¥ {tier.points / 10}</span>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tier.features.map(f => (
                <li key={f} style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', color: '#555' }}>
                  <Sparkles size={14} color={tier.color} /> {f}
                </li>
              ))}
            </ul>

            <button 
              className="btn-primary" 
              style={{ 
                width: '100%', padding: '14px', 
                background: tier.recommended ? `linear-gradient(135deg, ${tier.color} 0%, #000 100%)` : '#333',
                borderRadius: '12px', border: 'none', fontWeight: 'bold', boxShadow: tier.recommended ? `0 10px 20px ${tier.color}30` : 'none'
              }}
              onClick={() => handleRecharge(tier.price)}
            >
              立即获取
            </button>
          </div>
        ))}
      </div>

      <footer style={{ marginTop: '60px', textAlign: 'center', color: '#999', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <ShieldCheck size={18} /> 支付安全保障：所有交易均通过加密通道处理，积分秒级到账。
      </footer>

      {showRecharge && (
        <RechargeModal 
          uid={userInfo?.uid} 
          initialAmount={selectedAmount}
          onClose={() => setShowRecharge(false)} 
          onSuccess={() => {
            alert('报备提交成功，请等待审核');
            setShowRecharge(false);
          }}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card:hover { transform: translateY(-5px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
      `}} />
    </div>
  );
};

export default PricingPage;
