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

  // 微信扫码登录状态
  const [wechatQrcodeUrl, setWechatQrcodeUrl] = useState('/wechat_qrcode.jpg');
  const [wechatError, setWechatError] = useState('');
  const [wechatPasscode, setWechatPasscode] = useState('');
  const [wechatSubmitting, setWechatSubmitting] = useState(false);

  const handleWechatLogin = async (e) => {
    if (e) e.preventDefault();
    if (!agreeTerms) {
      setWechatError('请先阅读并勾选页面底部的用户服务协议与隐私政策');
      return;
    }
    if (!wechatPasscode.trim()) {
      setWechatError('请输入6位数字验证码');
      return;
    }
    setWechatSubmitting(true);
    setWechatError('');
    try {
      const res = await request.post('/auth/wechat/login-by-passcode', {
        code: wechatPasscode.trim()
      });
      localStorage.setItem('token', res.data.access_token);
      localStorage.removeItem('isGuest');
      window.location.href = '/';
    } catch (err) {
      setWechatError(err.response?.data?.detail || '登录失败，请确认验证码是否正确或已过期');
    } finally {
      setWechatSubmitting(false);
    }
  };




  // 微信登录状态轮询与倒计时生命周期管理


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
    if (!agreeTerms) {
      setCodeLoginError('请先阅读并同意服务协议和隐私政策');
      return;
    }
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
            { key: 'wechat', label: '微信登录' }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setLoginMode(tab.key);
                setCodeLoginError('');
                setWechatError('');
              }}
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

        {/* 微信扫码登录表单 */}
        {loginMode === 'wechat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', width: '100%' }}>
            
            {/* 二维码卡片容器 */}
            <div style={{
              position: 'relative', width: '180px', height: '180px',
              background: '#fff', padding: '8px',
              borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.04)', overflow: 'hidden',
              display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}>
              <img
                src={wechatQrcodeUrl}
                alt="微信公众号二维码"
                onError={(e) => {
                  // 回退使用默认关注占位符
                  e.target.src = "https://mp.weixin.qq.com/mp/qrcode?scene=10000004&size=102&block=1&type=10&key=0";
                }}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            {/* 引导指示 */}
            <div style={{ textAlign: 'center', width: '100%', padding: '0 10px' }}>
              <p style={{ color: '#1d1d1f', fontSize: '14px', fontWeight: '600', margin: '0 0 6px 0' }}>小肖不嚣张 官方公众号</p>
              <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.6', background: 'rgba(230,107,51,0.05)', padding: '10px', borderRadius: '8px', border: '1px dashed rgba(230,107,51,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', fontWeight: '500', color: '#e66b33', marginBottom: '2px' }}>
                  <span>微信扫码关注 ➡️ 后台发送【 登录 】</span>
                </div>
                <span>即可获取6位数字登录验证码</span>
              </div>
            </div>

            {/* 验证码输入框及登录按钮 */}
            <form onSubmit={handleWechatLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
              <input
                type="text"
                placeholder="请输入6位数字验证码"
                maxLength="6"
                value={wechatPasscode}
                onChange={(e) => setWechatPasscode(e.target.value.replace(/\D/g, ''))}
                required
                style={{ ...inputStyle, textAlign: 'center', letterSpacing: '2px', fontSize: '15px', fontWeight: '600' }}
              />
              
              {wechatError && (
                <p style={{ color: '#ff4d4f', fontSize: '13px', margin: '0', textAlign: 'center', fontWeight: '500' }}>
                  {wechatError}
                </p>
              )}

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '12px 0', fontSize: '14px', fontWeight: '600' }}
                disabled={wechatSubmitting}
              >
                {wechatSubmitting ? '登录中...' : '立即登录'}
              </button>
            </form>
          </div>
        )}

        {/* 全局服务协议和隐私政策复选框 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '24px', marginBottom: '16px' }}>
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
