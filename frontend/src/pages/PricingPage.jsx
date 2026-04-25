import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Zap, 
  Check, 
  Coins, 
  ShieldCheck,
  Star
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
    { name: '初探版', price: 9.9, points: 1000, features: ['快速生成', '基础支持', '永久有效'] },
    { name: '进阶版', price: 49.9, points: 6000, features: ['优先生成队列', '高清无水印', '赠送 1000 积分', '专属技巧指导'], recommended: true },
    { name: '专业版', price: 99.9, points: 15000, features: ['全速生成通道', '商业授权支持', '赠送 3000 积分', '1对1 技术支持'] }
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
            { label: '标准生成', cost: 10, desc: '极速预览，适合初稿' },
            { label: '高清生成', cost: 30, desc: '细节丰富，适合展示' },
            { label: '超清生成', cost: 50, desc: '印刷品质，极致细节' }
          ].map(item => (
            <div key={item.label} style={{ padding: '15px', borderLeft: '3px solid #e66b33', background: '#fff' }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{item.label}</div>
              <div style={{ color: '#e66b33', fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>{item.cost} <span style={{ fontSize: '14px' }}>积分/张</span></div>
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
            {tier.recommended && (
              <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: '#e66b33', color: '#fff', padding: '4px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Star size={12} fill="#fff" /> 最受欢迎
              </div>
            )}
            <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>{tier.name}</h2>
            <div style={{ color: '#e66b33', fontSize: '40px', fontWeight: 'bold', marginBottom: '5px' }}>{tier.points} <span style={{ fontSize: '16px' }}>积分</span></div>
            <div style={{ color: '#666', fontSize: '18px', marginBottom: '30px' }}>¥ {tier.price}</div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', textAlign: 'left', display: 'inline-block' }}>
              {tier.features.map(f => (
                <li key={f} style={{ fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#555' }}>
                  <Check size={16} color="#52c41a" /> {f}
                </li>
              ))}
            </ul>

            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '12px', background: tier.recommended ? '#e66b33' : '#444' }}
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
