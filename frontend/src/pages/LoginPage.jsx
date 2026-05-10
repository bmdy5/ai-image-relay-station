import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useLoginController } from '../controllers/useLoginController';
import Captcha from '../components/Captcha';
import NeuralPlexus from '../components/NeuralPlexus';
import TermsModal from '../components/TermsModal';
import request from '../api/request';

const LoginPage = () => {
  const {
    username, setUsername,
    password, setPassword,
    showPassword, setShowPassword,
    error, handleLogin
  } = useLoginController();

  // 登录模式切换
  const [loginMode, setLoginMode] = useState('password'); // 'password' | 'code'

  // 验证码登录状态
  const [codeEmail, setCodeEmail] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [codeSending, setCodeSending] = useState(false);
  const [codeLoginError, setCodeLoginError] = useState('');
  const [codeLoginLoading, setCodeLoginLoading] = useState(false);

  // 密码登录状态
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaError, setCaptchaError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsType, setTermsType] = useState('service');

  const onCaptchaMatch = useCallback((matched) => {
    setCaptchaValid(matched);
    if (matched) setCaptchaError('');
  }, []);

  const onPasswordSubmit = (e) => {
    e.preventDefault();
    if (!captchaValid) {
      setCaptchaError('请输入正确的验证码');
      return;
    }
    if (!agreeTerms) {
      setCaptchaError('请先阅读并同意服务协议和隐私政策');
      return;
    }
    setCaptchaError('');
    handleLogin(e);
  };

  // 发送登录验证码
  const handleSendLoginCode = async () => {
    if (!codeEmail || codeCountdown > 0) return;
    setCodeSending(true);
    setCodeLoginError('');
    try {
      await request.post('/auth/send-login-code', { email: codeEmail });
      let seconds = 60;
      setCodeCountdown(seconds);
      const timer = setInterval(() => {
        seconds--;
        setCodeCountdown(seconds);
        if (seconds <= 0) clearInterval(timer);
      }, 1000);
    } catch (err) {
      setCodeLoginError(err.response?.data?.detail || '发送失败');
    } finally {
      setCodeSending(false);
    }
  };

  // 验证码登录提交
  const handleCodeLogin = async (e) => {
    e.preventDefault();
    if (!codeEmail || !loginCode) return;
    setCodeLoginLoading(true);
    setCodeLoginError('');
    try {
      const res = await request.post('/auth/login-by-code', { email: codeEmail, code: loginCode });
      localStorage.setItem('token', res.data.access_token);
      localStorage.removeItem('isGuest');
      window.location.href = '/';
    } catch (err) {
      setCodeLoginError(err.response?.data?.detail || '登录失败');
    } finally {
      setCodeLoginLoading(false);
    }
  };

  const containerStyle = {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '100vh', background: 'transparent', position: 'relative'
  };

  const cardStyle = {
    padding: '30px 24px', width: '90%', maxWidth: '400px', textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.5)', position: 'relative', zIndex: 1
  };

  const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd' };

  return (
    <div style={containerStyle}>
      <NeuralPlexus />
      <div className="card" style={cardStyle}>
        <h1 style={{ color: '#e66b33', marginBottom: '10px' }}>Visionary</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>欢迎回来，开始您的创意之旅</p>

        {/* 登录模式切换 */}
        <div style={{ display: 'flex', marginBottom: '24px', borderBottom: '1px solid #eee' }}>
          {[
            { key: 'password', label: '密码登录' },
            { key: 'code', label: '验证码登录' },
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => { setLoginMode(tab.key); setCodeLoginError(''); }}
              style={{
                flex: 1, padding: '10px 0', border: 'none', background: 'none',
                fontSize: '14px', fontWeight: loginMode === tab.key ? '600' : '400',
                color: loginMode === tab.key ? '#e66b33' : '#999',
                borderBottom: loginMode === tab.key ? '2px solid #e66b33' : '2px solid transparent',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 密码登录表单 */}
        {loginMode === 'password' && (
          <form onSubmit={onPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input
              type="text" placeholder="用户名 / 邮箱 / 手机号"
              value={username} onChange={(e) => setUsername(e.target.value)}
              required style={inputStyle}
            />
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"} placeholder="密码"
                value={password} onChange={(e) => setPassword(e.target.value)}
                required
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', paddingRight: '40px' }}
              />
              <div
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', cursor: 'pointer', color: '#999',
                  display: 'flex', alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>
            <Captcha onMatch={onCaptchaMatch} />
            {(error || captchaError) && <p style={{ color: '#ff4d4f', fontSize: '14px', margin: 0 }}>{captchaError || error}</p>}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="agreeTerms" checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#e66b33' }}
              />
              <label htmlFor="agreeTerms" style={{ fontSize: '13px', color: '#666', cursor: 'pointer' }}>
                我已阅读并同意
                <span onClick={(e) => { e.preventDefault(); setTermsType('service'); setShowTerms(true); }}
                  style={{ color: '#e66b33', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                >《用户服务协议》</span>
                与
                <span onClick={(e) => { e.preventDefault(); setTermsType('privacy'); setShowTerms(true); }}
                  style={{ color: '#e66b33', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                >《隐私政策》</span>
              </label>
            </div>

            <div style={{ textAlign: 'right', marginTop: '-8px' }}>
              <Link to="/forgot-password" style={{ color: '#e66b33', fontSize: '13px', textDecoration: 'none', fontWeight: '500' }}>忘记密码？</Link>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>立即登录</button>
          </form>
        )}

        {/* 验证码登录表单 */}
        {loginMode === 'code' && (
          <form onSubmit={handleCodeLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="email" placeholder="请输入邮箱"
              value={codeEmail} onChange={(e) => setCodeEmail(e.target.value)}
              required style={inputStyle}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text" placeholder="验证码" maxLength="6"
                value={loginCode} onChange={(e) => setLoginCode(e.target.value)}
                required style={{ ...inputStyle, flex: 1 }}
              />
              <button
                type="button"
                onClick={handleSendLoginCode}
                disabled={codeCountdown > 0 || codeSending}
                style={{
                  padding: '12px 16px', borderRadius: '8px', border: '1px solid #e66b33',
                  background: codeCountdown > 0 ? '#f5f5f5' : 'transparent',
                  color: codeCountdown > 0 ? '#999' : '#e66b33',
                  fontSize: '13px', fontWeight: '500', cursor: codeCountdown > 0 ? 'default' : 'pointer',
                  whiteSpace: 'nowrap', minWidth: '110px'
                }}
              >
                {codeSending ? '发送中...' : codeCountdown > 0 ? `${codeCountdown}s 后重发` : '发送验证码'}
              </button>
            </div>
            {codeLoginError && <p style={{ color: '#ff4d4f', fontSize: '14px', margin: 0 }}>{codeLoginError}</p>}
            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={codeLoginLoading}>
              {codeLoginLoading ? '登录中...' : '立即登录'}
            </button>
          </form>
        )}

        <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          没有账号？ <Link to="/register" style={{ color: '#e66b33', fontWeight: '600', textDecoration: 'none' }}>立即注册</Link>
        </p>

        <div style={{ marginTop: '24px', opacity: 0.8 }}>
          <button
            onClick={() => {
              localStorage.setItem('isGuest', 'true');
              window.location.href = '/';
            }}
            style={{
              background: 'none', border: 'none', color: '#666',
              fontSize: '13px', fontWeight: '500', cursor: 'pointer',
              textDecoration: 'underline', padding: 0
            }}
          >
            先随便逛逛 (游客模式)
          </button>
        </div>
      </div>

      {showTerms && (
        <TermsModal type={termsType} onClose={() => setShowTerms(false)} />
      )}
    </div>
  );
};

export default LoginPage;
