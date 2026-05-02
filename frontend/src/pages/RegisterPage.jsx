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
  const [captchaValid, setCaptchaValid] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
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
      
      if (regMode === 'email') {
        await request.post('/auth/register', { 
          username, email, password, code, fingerprint 
        });
      } else {
        if (!captchaValid) {
          setError('请输入正确的验证码');
          setLoading(false);
          return;
        }
        await request.post('/auth/register-phone', { 
          username, phone, password, fingerprint 
        });
      }
      
      alert('注册成功！');
      navigate('/login');
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
    </div>
  );
};

export default RegisterPage;
