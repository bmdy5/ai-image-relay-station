import React, { useState } from 'react';
import request from '../api/request';

const RechargeModal = ({ onClose, onSuccess, uid, initialAmount }) => {
  const [money, setMoney] = useState(initialAmount || 10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Guide, 2: Report

  const tiers = [9.9, 49.9, 99.9, 500];

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await request.post('/user/recharge/apply', {
        money_amount: money
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || '提交失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '400px', padding: '30px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' }}>×</button>
        
        <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>{step === 1 ? '充值指引' : '提交报备'}</h2>

        {step === 1 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#fff7e6', border: '1px solid #ffd591', padding: '15px', borderRadius: '8px', fontSize: '14px' }}>
              <p style={{ margin: 0, color: '#d46b08', fontWeight: 'bold' }}>第一步：添加客服微信并支付</p>
              <p style={{ margin: '8px 0 0', color: '#666' }}>客服微信：<strong style={{ color: '#000' }}>AI-Image-Support</strong></p>
              <p style={{ margin: '4px 0 0', color: '#666' }}>付款备注您的 UID：<strong style={{ color: '#e66b33' }}>{uid}</strong></p>
            </div>
            
            <div style={{ textAlign: 'center', fontSize: '13px', color: '#999' }}>
              支付完成后，请点击下方按钮进行报备
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '12px' }}
              onClick={() => setStep(2)}
            >
              已支付，去报备
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '10px' }}>选择充值金额 (元)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {tiers.map(t => (
                  <button 
                    key={t}
                    onClick={() => setMoney(t)}
                    style={{ 
                      padding: '10px', 
                      borderRadius: '8px', 
                      border: `1px solid ${money === t ? '#e66b33' : '#ddd'}`,
                      background: money === t ? '#fff7e6' : 'transparent',
                      color: money === t ? '#e66b33' : '#666',
                      cursor: 'pointer'
                    }}
                  >
                    ¥{t} ({t === 9.9 ? 1000 : t === 49.9 ? 6000 : t === 99.9 ? 15000 : t * 10}积分)
                  </button>
                ))}
              </div>
            </div>

            {error && <div style={{ color: '#ff4d4f', fontSize: '13px' }}>{error}</div>}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setStep(1)}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: 'transparent', cursor: 'pointer' }}
              >
                返回
              </button>
              <button 
                className="btn-primary" 
                style={{ flex: 2, padding: '12px' }}
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading ? '提交中...' : '确认报备'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RechargeModal;
