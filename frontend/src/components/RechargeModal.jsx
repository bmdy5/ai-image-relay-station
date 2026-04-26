import React, { useState, useEffect, useRef } from 'react';
import request from '../api/request';
import { CreditCard, MessageSquare, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';

const RechargeModal = ({ onClose, onSuccess, uid, initialAmount }) => {
  const [money, setMoney] = useState(initialAmount || 9.9);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Choose Method, 2: Manual Guide, 3: Manual Report, 4: Online Processing
  const [orderInfo, setOrderInfo] = useState(null);
  const [payStatus, setPayStatus] = useState('pending'); // pending, success
  const pollTimer = useRef(null);

  const tiers = [9.9, 45, 90, 500];

  // 清除轮询
  useEffect(() => {
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, []);

  // 轮询订单状态
  const startPolling = (out_trade_no) => {
    if (pollTimer.current) clearInterval(pollTimer.current);
    pollTimer.current = setInterval(async () => {
      try {
        const res = await request.get(`/payment/status/${out_trade_no}`);
        if (res.status === 'success') {
          setPayStatus('success');
          clearInterval(pollTimer.current);
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
        }
      } catch (err) {
        console.error('轮询失败', err);
      }
    }, 3000);
  };

  // 发起在线支付
  const handleOnlinePay = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await request.post('/payment/create', { money_amount: money });
      setOrderInfo(res);
      setStep(4);
      // 跳转支付页面
      window.open(res.pay_url, '_blank');
      // 开始轮询
      startPolling(res.out_trade_no);
    } catch (err) {
      setError(err.response?.data?.detail || '创建订单失败');
    } finally {
      setLoading(false);
    }
  };

  // 提交人工报备
  const handleManualSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await request.post('/user/recharge/apply', { money_amount: money });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || '提交失败');
    } finally {
      setLoading(false);
    }
  };

  const getPoints = (val) => {
    if (val === 9.9) return 100;
    if (val === 45) return 500;
    if (val === 90) return 1000;
    if (val === 500) return 8000;
    return Math.floor(Number(val) * 10);
  };

  const renderContent = () => {
    switch (step) {
      case 1: // 选择支付方式
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
             <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginBottom: '10px' }}>
              请选择充值金额：<strong style={{ color: '#e66b33' }}>¥{money}</strong>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
              {tiers.map(t => (
                <button 
                  key={t}
                  onClick={() => setMoney(t)}
                  style={{ 
                    padding: '10px', borderRadius: '8px', border: `1px solid ${money === t ? '#e66b33' : '#ddd'}`,
                    background: money === t ? '#fff7e6' : 'transparent', color: money === t ? '#e66b33' : '#666', cursor: 'pointer',
                    fontSize: '14px', transition: 'all 0.2s', position: 'relative'
                  }}
                >
                  ¥{t}
                  {[45, 90].includes(t) && (
                    <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#f5222d', color: '#fff', fontSize: '10px', padding: '2px 5px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      超值
                    </span>
                  )}
                  {t === 500 && (
                    <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#722ed1', color: '#fff', fontSize: '10px', padding: '2px 5px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      狂欢
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: '8px', fontSize: '13px', color: '#999' }}>或输入自定义金额 (1元起，仅限整数)</div>
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <input 
                type="number"
                placeholder="请输入金额"
                value={money}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Math.floor(Number(e.target.value));
                  setMoney(val);
                }}
                style={{
                  width: '100%', padding: '12px 15px', borderRadius: '12px', border: '1px solid #eee',
                  background: '#fcfcfc', fontSize: '14px', outline: 'none', color: '#333'
                }}
              />
              <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '12px' }}>
                = {getPoints(money)} 积分
              </div>
            </div>
            
            <button 
              className="btn-primary" 
              style={{ padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              onClick={handleOnlinePay}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : <CreditCard size={20} />}
              立即在线支付 (推荐)
            </button>
            
            <button 
              style={{ padding: '15px', borderRadius: '12px', border: '1px solid #ddd', background: '#f9f9f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#666' }}
              onClick={() => setStep(2)}
            >
              <MessageSquare size={20} />
              联系人工充值
            </button>
          </div>
        );
      
      case 2: // 人工指引
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#fff7e6', border: '1px solid #ffd591', padding: '15px', borderRadius: '8px', fontSize: '14px' }}>
              <p style={{ margin: 0, color: '#d46b08', fontWeight: 'bold' }}>第一步：添加客服微信并支付</p>
              <p style={{ margin: '8px 0 0', color: '#666' }}>客服微信：<strong style={{ color: '#000' }}>wxid_4rp8jzrnord822</strong></p>
              <p style={{ margin: '4px 0 0', color: '#666' }}>付款备注您的 UID：<strong style={{ color: '#e66b33' }}>{uid}</strong></p>
            </div>
            <button className="btn-primary" style={{ width: '100%', padding: '12px' }} onClick={() => setStep(3)}>已支付，去报备</button>
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>返回选择支付方式</button>
          </div>
        );

      case 3: // 人工报备
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <p style={{ fontSize: '14px', color: '#666' }}>您正在为金额 <strong>¥{money}</strong> 提交人工审核报备。</p>
             {error && <div style={{ color: '#ff4d4f', fontSize: '13px' }}>{error}</div>}
             <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: 'transparent', cursor: 'pointer' }}>返回</button>
                <button className="btn-primary" style={{ flex: 2, padding: '12px' }} disabled={loading} onClick={handleManualSubmit}>{loading ? '提交中...' : '确认报备'}</button>
             </div>
          </div>
        );

      case 4: // 在线支付处理中
        return (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            {payStatus === 'pending' ? (
              <>
                <div style={{ position: 'relative', width: '60px', height: '60px', margin: '0 auto 20px' }}>
                  <Loader2 size={60} color="#e66b33" className="animate-spin" />
                </div>
                <h3 style={{ marginBottom: '10px' }}>等待支付中...</h3>
                <p style={{ fontSize: '14px', color: '#999', marginBottom: '20px' }}>
                  请在打开的新窗口中完成支付。<br/>支付完成后系统将自动为您增加积分。
                </p>
                <button 
                  onClick={() => window.open(orderInfo?.pay_url, '_blank')}
                  style={{ background: 'none', border: 'none', color: '#e66b33', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', margin: '0 auto' }}
                >
                  未打开窗口？点此重新跳转 <ExternalLink size={14} />
                </button>
              </>
            ) : (
              <>
                <CheckCircle2 size={60} color="#52c41a" style={{ marginBottom: '20px' }} />
                <h3 style={{ color: '#52c41a' }}>支付成功！</h3>
                <p style={{ fontSize: '14px', color: '#999' }}>正在为您更新账户积分...</p>
              </>
            )}
            <button onClick={() => setStep(1)} style={{ marginTop: '30px', background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>更换支付方式</button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '420px', padding: '30px', position: 'relative', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' }}>×</button>
        <h2 style={{ marginBottom: '24px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}>充值积分</h2>
        {renderContent()}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
};

export default RechargeModal;
