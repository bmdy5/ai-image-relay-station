import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import request from '../api/request';
import NeuralPlexus from '../components/NeuralPlexus';
import TermsModal from '../components/TermsModal';
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

  const [verifyEmail, setVerifyEmail] = useState(''); // 手机注册时用于验证的邮箱
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
    const targetEmail = regMode === 'email' ? email : verifyEmail;
    if (!targetEmail || !targetEmail.includes('@')) {
      setError('请输入有效的邮箱地址');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await request.post('/auth/send-code', { email: targetEmail });
      setCountdown(60);
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
        if (!agreeTerms) {
          setError('请先阅读并同意服务协议');
          setLoading(false);
          return;
        }
        if (regMode === 'email' && !username.trim()) {
          setError('请输入用户名');
          setLoading(false);
          return;
        }
        if (regMode === 'email' && (!code || code.trim() === '')) {
          setError('请输入邮箱验证码');
          setLoading(false);
          return;
        }
        if (regMode === 'phone' && (!phone || phone.length !== 11 || !/^\d{11}$/.test(phone))) {
          setError('请输入正确的11位手机号');
          setLoading(false);
          return;
        }
        if (regMode === 'phone' && (!code || code.trim() === '')) {
          setError('请输入验证码');
          setLoading(false);
          return;
        }
        if (regMode === 'phone' && (!verifyEmail || !verifyEmail.includes('@'))) {
          setError('请输入验证邮箱');
          setLoading(false);
          return;
        }
        if (!password || password.length < 6) {
          setError('密码长度不能少于6位');
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
            username, phone, password, captcha_code: code, fingerprint, invite_code: inviteCode
          });
        }
        
        // 自动登录
        if (resp && resp.access_token) {
          localStorage.setItem('token', resp.access_token);
          localStorage.removeItem('isGuest');
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
            placeholder={regMode === 'email' ? '您的用户名' : '您的用户名 (选填)'}
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
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="email"
                  placeholder="验证邮箱（用于接收验证码）"
                  value={verifyEmail}
                  onChange={(e) => setVerifyEmail(e.target.value)}
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
        <TermsModal type={termsType} onClose={() => setShowTerms(false)} />
      )}
    </div>
  );
};

export default RegisterPage;
