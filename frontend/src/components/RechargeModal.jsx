import React, { useState, useEffect, useRef } from 'react';
import request from '../api/request';
import { CreditCard, MessageSquare, ExternalLink, Loader2, CheckCircle2, Copy } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';
import Toast from './Toast';

const RechargeModal = ({ onClose, onSuccess, uid, initialAmount, hasUsedExperience }) => {
  const [money, setMoney] = useState(initialAmount || 10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Choose Method, 2: Manual Guide, 3: Manual Report, 4: Online Processing
  const [orderInfo, setOrderInfo] = useState(null);
  const [payStatus, setPayStatus] = useState('pending'); // pending, success
  const [toast, setToast] = useState({ show: false, message: '' });
  const pollTimer = useRef(null);

  // 如果已经使用过体验包，过滤掉 1 元选项
  // 增加对 0/1/true/false 的全兼容判断
  const isUsed = hasUsedExperience === true || hasUsedExperience === 1 || String(hasUsedExperience).toLowerCase() === 'true';
  const tiers = isUsed ? [10, 30, 50] : [1, 10, 30, 50];

  // 如果初始金额是 1 且已经使用过体验，重置为 10
  useEffect(() => {
    if (money === 1 && isUsed) {
      setMoney(10);
    }
  }, [isUsed, money]);

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
            window.dispatchEvent(new CustomEvent('points-updated'));
            onSuccess();
            onClose();
          }, 2000);
        }
      } catch (err) {
        console.error('轮询失败', err);
      }
    }, 3000);
  };

  // 手动触发状态检查
  const handleManualStatusCheck = async () => {
    if (!orderInfo?.out_trade_no) return;
    setLoading(true);
    try {
      const res = await request.get(`/payment/status/${orderInfo.out_trade_no}`);
      if (res.status === 'success') {
        setPayStatus('success');
        if (pollTimer.current) clearInterval(pollTimer.current);
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('points-updated'));
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setToast({ show: true, message: '支付确认中，请稍后' });
      }
    } catch (err) {
      setToast({ show: true, message: '查询失败，请稍后重试' });
    } finally {
      setLoading(false);
    }
  };

  // 发起在线支付
  const handleOnlinePay = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await request.post('/payment/create', { money_amount: money });
      setOrderInfo(res);
      setStep(4);
      
      // 环境感知跳转：移动端使用 location.href，PC 端维持 window.open
      const isMobile = window.innerWidth <= 1024;
      if (isMobile) {
        window.location.href = res.pay_url;
      } else {
        window.open(res.pay_url, '_blank');
      }
      
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
    const v = Number(val);
    if (v === 1) {
      return isUsed ? 10 : 20; // 已经买过就只给 10 积分
    }
    if (v === 10) return 150;
    if (v === 30) return 500;
    if (v === 50) return 800;
    return Math.floor(v * 10); // 自定义金额严格执行 1元=10积分
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
                  {t === 1 && (
                    <span style={{ 
                      position: 'absolute', top: '-8px', right: '-8px', 
                      background: 'linear-gradient(135deg, #52c41a, #73d13d)', 
                      color: '#fff', fontSize: '9px', padding: '2px 6px', 
                      borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      fontWeight: '800'
                    }}>
                      限时仅一次
                    </span>
                  )}
                  {[30, 50].includes(t) && (
                    <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#f5222d', color: '#fff', fontSize: '10px', padding: '2px 5px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      超值
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: '8px', fontSize: '13px', color: '#999', display: 'flex', justifyContent: 'space-between' }}>
              <span>或输入自定义金额</span>
              <span style={{ color: '#e66b33', fontWeight: '600' }}>可以任意金额，最低一元</span>
            </div>
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
            <div style={{ background: '#fff7e6', border: '1px solid #ffd591', padding: '20px', borderRadius: '16px', fontSize: '14px' }}>
              <p style={{ margin: 0, color: '#d46b08', fontWeight: 'bold', marginBottom: '12px' }}>第一步：添加客服微信并支付</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div 
                  onClick={() => copyToClipboard('wxid_4rp8jzrnord822', (msg) => setToast({ show: true, message: msg }))}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.6)', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer' }}
                >
                  <span style={{ color: '#666' }}>客服微信：<strong style={{ color: '#000' }}>wxid_4rp8jzrnord822</strong></span>
                  <Copy size={14} color="#e66b33" />
                </div>
                
                <div 
                  onClick={() => copyToClipboard(uid, (msg) => setToast({ show: true, message: `UID ${msg}` }))}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.6)', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer' }}
                >
                  <span style={{ color: '#666' }}>付款备注 UID：<strong style={{ color: '#e66b33' }}>{uid}</strong></span>
                  <Copy size={14} color="#e66b33" />
                </div>
              </div>
            </div>
            <button className="btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '16px' }} onClick={() => setStep(3)}>已支付，去报备</button>
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
                  style={{ background: 'none', border: 'none', color: '#e66b33', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', margin: '0 auto 15px' }}
                >
                  未打开窗口？点此重新跳转 <ExternalLink size={14} />
                </button>

                <button 
                  onClick={handleManualStatusCheck} 
                  disabled={loading}
                  style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 20px rgba(230,107,51,0.2)' }}
                >
                  {loading ? '正在校验...' : '我已支付，点击手动校验'}
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
      <div className="card recharge-modal-card" style={{ 
        width: '100%', maxWidth: '420px', padding: '30px', position: 'relative', borderRadius: '24px', 
        boxShadow: '0 20px 50px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' 
      }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' }}>×</button>
        <h2 style={{ marginBottom: '24px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}>充值积分</h2>
        {renderContent()}
        {toast.show && <Toast message={toast.message} onClose={() => setToast({ show: false, message: '' })} />}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
};

export default RechargeModal;
