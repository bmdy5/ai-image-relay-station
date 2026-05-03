import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import request from '../api/request';
import NeuralPlexus from '../components/NeuralPlexus';
import Captcha from '../components/Captcha';
import { useCallback } from 'react';

const RegisterPage = () => {
  const [regMode, setRegMode] = useState('phone'); // phone or email
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showTerms, setShowTerms] = useState(false);
  const [termsType, setTermsType] = useState('service'); // service or privacy
  const navigate = useNavigate();

  useEffect(() => {
    // 解析邀请码
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('invite');
    if (invite) setInviteCode(invite);

    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      setError('请输入有效的邮箱地址');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await request.post('/auth/send-code', { email });
      setCountdown(60);
      alert('验证码已发送，请检查您的邮箱');
    } catch (err) {
      setError(err.response?.data?.detail || '发送失败，请重试');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fingerprint = btoa(navigator.userAgent).substring(0, 32);
      
        if (!captchaValid) {
          setError('请输入正确的验证码');
          setLoading(false);
          return;
        }
        if (!agreeTerms) {
          setError('请先阅读并同意服务协议');
          setLoading(false);
          return;
        }
        
        let resp;
        if (regMode === 'email') {
          resp = await request.post('/auth/register', { 
            username, email, password, code, fingerprint, invite_code: inviteCode
          });
        } else {
          resp = await request.post('/auth/register-phone', { 
            username, phone, password, captcha_code: 'bypass', fingerprint, invite_code: inviteCode
          });
        }
        
        // 自动登录
        if (resp && resp.access_token) {
          localStorage.setItem('token', resp.access_token);
          alert('注册成功！已为您自动登录');
          navigate('/');
        } else {
          alert('注册成功！');
          navigate('/login');
        }
    } catch (err) {
      setError(err.response?.data?.detail || '注册失败');
    }
    setLoading(false);
  };

  const onCaptchaMatch = useCallback((matched) => {
    setCaptchaValid(matched);
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'transparent', position: 'relative' }}>
      <NeuralPlexus />
      <div id="pc-main-stage" className="card" style={{ 
        padding: '30px 24px', width: '90%', maxWidth: '420px', textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.5)', position: 'relative', zIndex: 1
      }}>
        <h1 style={{ color: '#e66b33', marginBottom: '10px', fontWeight: '800' }}>加入内测</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>开启您的 AI 视觉创意之旅</p>
        
        <div style={{ background: '#fff5f0', color: '#e66b33', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '25px', textAlign: 'left', border: '1px solid #ffdecb' }}>
          💡 <strong>内测提示：</strong>
          <br />当前仅开放 100 个内测名额，注册即送 10 积分。
        </div>

        {/* 注册方式切换 */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
          {['phone', 'email'].map(mode => (
            <div 
              key={mode}
              onClick={() => setRegMode(mode)}
              style={{ 
                fontSize: '15px', fontWeight: '800', cursor: 'pointer',
                color: regMode === mode ? '#e66b33' : '#999',
                position: 'relative', transition: 'all 0.3s'
              }}
            >
              {mode === 'phone' ? '手机号注册' : '邮箱注册'}
              {regMode === mode && (
                <div style={{ position: 'absolute', bottom: '-13px', left: 0, width: '100%', height: '3px', background: '#e66b33', borderRadius: '2px' }} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="text"
            placeholder="您的用户名 (选填)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }}
          />

          {regMode === 'email' ? (
            <>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="email"
                  placeholder="您的邮箱地址"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ flex: 1, minWidth: 0, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }}
                />
                <button
                  type="button"
                  disabled={countdown > 0 || loading}
                  onClick={handleSendCode}
                  style={{
                    width: '100px', padding: '10px',
                    background: countdown > 0 ? '#ccc' : '#fcfcfc',
                    border: '1px solid #e66b33', color: '#e66b33',
                    borderRadius: '8px', fontSize: '12px',
                    cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </button>
              </div>
              <input
                type="text"
                placeholder="邮箱验证码"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }}
              />
            </>
          ) : (
            <>
              <input
                type="tel"
                placeholder="您的手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }}
              />
              <Captcha onMatch={onCaptchaMatch} />
            </>
          )}

          <input
            type="password"
            placeholder="设置登录密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }}
          />

          <div style={{ textAlign: 'left' }}>
            <input
              type="text"
              placeholder="邀请码 (选填)"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', width: '100%', boxSizing: 'border-box' }}
            />
            <p style={{ fontSize: '12px', color: '#e66b33', marginTop: '6px', marginLeft: '4px' }}>
              💡 填写邀请码注册，额外赠送 5 积分奖励
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
            <input 
              type="checkbox" 
              id="agreeTerms" 
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#e66b33' }}
            />
            <label htmlFor="agreeTerms" style={{ fontSize: '13px', color: '#666', cursor: 'pointer' }}>
              我已阅读并同意 
              <span 
                onClick={(e) => { e.preventDefault(); setTermsType('service'); setShowTerms(true); }}
                style={{ color: '#e66b33', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
              >
                《用户服务协议》
              </span> 
              与 
              <span 
                onClick={(e) => { e.preventDefault(); setTermsType('privacy'); setShowTerms(true); }}
                style={{ color: '#e66b33', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
              >
                《隐私政策》
              </span>
            </label>
          </div>

          {error && <p style={{ color: '#ff4d4f', fontSize: '13px', textAlign: 'left', margin: 0 }}>❌ {error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary" 
            style={{ width: '100%', padding: '14px', marginTop: '10px', fontSize: '16px' }}
          >
            {loading ? '处理中...' : '立即开启创作'}
          </button>
        </form>

        <p style={{ marginTop: '25px', fontSize: '14px', color: '#666' }}>
          已有账号？ <Link to="/login" style={{ color: '#e66b33', fontWeight: '600', textDecoration: 'none' }}>直接登录</Link>
        </p>
      </div>

      {/* 协议详情弹窗 */}
      {showTerms && (
        <div style={{ 
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', 
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(5px)', padding: '20px'
        }}>
          <div style={{ 
            background: 'white', width: '100%', maxWidth: '500px', 
            borderRadius: '24px', padding: '30px', maxHeight: '80vh', 
            overflowY: 'auto', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px', color: '#1D1D1F' }}>
              {termsType === 'service' ? '用户服务协议' : '隐私政策'}
            </h2>
            <div style={{ fontSize: '14px', color: '#444', lineHeight: '1.8', textAlign: 'left' }}>
              {termsType === 'service' ? (
                <>
                  <p>欢迎使用 Visionary AI 创作平台。在您注册成为我们的用户前，请仔细阅读以下协议：</p>
                  <p>1. <b>服务内容：</b>我们为您提供 AI 辅助图像生成服务。您需遵守相关法律法规，不得生成色情、暴力、虚假或侵犯他人版权的内容。</p>
                  <p>2. <b>账号安全：</b>您负责维护账号及密码的保密性，并对该账号下发生的所有活动负责。</p>
                  <p>3. <b>积分说明：</b>积分用于支付生图费用。内测期间获赠的积分为系统奖励，不可提现或转让。</p>
                  <p>4. <b>免责声明：</b>AI 生成的内容具有不可控性，结果仅供娱乐与创作参考，不代表本平台立场。</p>
                </>
              ) : (
                <>
                  <p>我们非常重视您的隐私保护，以下是我们的隐私处理原则：</p>
                  <p>1. <b>信息收集：</b>我们仅收集实现服务所必须的信息，如邮箱、手机号（用于登录验证）以及浏览器指纹（用于防作弊）。</p>
                  <p>2. <b>数据安全：</b>我们采用行业标准的加密技术存储您的个人信息，严禁未经授权的访问。</p>
                  <p>3. <b>图片隐私：</b>您生成的图片将存储在私有云中。除非您主动分享，否则其他用户无法查看您的创作内容。</p>
                  <p>4. <b>第三方共享：</b>我们绝不会将您的个人信息出售或出租给任何第三方。</p>
                </>
              )}
            </div>
            <button 
              onClick={() => setShowTerms(false)}
              style={{ 
                width: '100%', padding: '16px', marginTop: '30px', 
                background: 'linear-gradient(135deg, #1D1D1F 0%, #333 100%)', 
                color: 'white', border: 'none', 
                borderRadius: '16px', fontWeight: '700', cursor: 'pointer'
              }}
            >
              已阅读并知晓
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
