import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, ShieldCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useForgotPasswordController } from '../controllers/useForgotPasswordController';

const ForgotPasswordPage = () => {
  const {
    email, setEmail,
    code, setCode,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    error, success,
    loading, countdown,
    codeSent,
    handleSendCode,
    handleReset
  } = useForgotPasswordController();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fcfcfc' }}>
      <div className="card" style={{ padding: '40px', width: '420px', textAlign: 'center' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #e66b33, #f09060)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <KeyRound size={28} color="#fff" />
          </div>
          <h1 style={{ color: '#e66b33', marginBottom: '6px', fontWeight: '800', fontSize: '24px' }}>找回密码</h1>
          <p style={{ color: '#888', marginBottom: '24px', fontSize: '14px' }}>通过注册邮箱验证码重置您的密码</p>
        </div>

        <form onSubmit={handleReset} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* 邮箱 + 发送验证码 */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#bbb' }} />
              <input
                type="email"
                placeholder="注册时使用的邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{
                  width: '100%', padding: '12px 12px 12px 36px', borderRadius: '8px',
                  border: '1px solid #ddd', outline: 'none', boxSizing: 'border-box',
                  fontSize: '14px', transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#e66b33'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
            </div>
            <button
              type="button"
              disabled={countdown > 0 || loading}
              onClick={handleSendCode}
              style={{
                width: '120px', padding: '10px',
                background: loading ? '#fff5f0' : countdown > 0 ? '#f5f5f5' : '#fcfcfc',
                border: `1px solid ${loading ? '#e66b33' : countdown > 0 ? '#ccc' : '#e66b33'}`,
                color: loading ? '#e66b33' : countdown > 0 ? '#999' : '#e66b33',
                borderRadius: '8px', fontSize: '13px',
                cursor: (countdown > 0 || loading) ? 'not-allowed' : 'pointer',
                fontWeight: '600', transition: 'all 0.2s',
                flexShrink: 0,
                opacity: loading ? 0.8 : 1
              }}
            >
              {loading ? '发送中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
            </button>
          </div>

          {/* 验证码 */}
          <div style={{ position: 'relative' }}>
            <ShieldCheck size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#bbb' }} />
            <input
              type="text"
              placeholder="邮箱验证码"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              maxLength={6}
              autoComplete="one-time-code"
              style={{
                width: '100%', padding: '12px 12px 12px 36px', borderRadius: '8px',
                border: '1px solid #ddd', outline: 'none', boxSizing: 'border-box',
                fontSize: '14px', letterSpacing: '4px', transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#e66b33'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          {/* 新密码 */}
          <div style={{ position: 'relative' }}>
            <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#bbb' }} />
            <input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="设置新密码（至少6位）"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              style={{
                width: '100%', padding: '12px 40px 12px 36px', borderRadius: '8px',
                border: '1px solid #ddd', outline: 'none', boxSizing: 'border-box',
                fontSize: '14px', transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#e66b33'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
            <div
              onClick={() => setShowNewPassword(!showNewPassword)}
              style={{
                position: 'absolute', right: '12px', top: '50%',
                transform: 'translateY(-50%)', cursor: 'pointer',
                color: '#999', display: 'flex', alignItems: 'center'
              }}
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>

          {/* 确认密码 */}
          <div style={{ position: 'relative' }}>
            <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#bbb' }} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="再次确认新密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              style={{
                width: '100%', padding: '12px 40px 12px 36px', borderRadius: '8px',
                border: '1px solid #ddd', outline: 'none', boxSizing: 'border-box',
                fontSize: '14px', transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#e66b33'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
            <div
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute', right: '12px', top: '50%',
                transform: 'translateY(-50%)', cursor: 'pointer',
                color: '#999', display: 'flex', alignItems: 'center'
              }}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <p style={{
              color: '#ff4d4f', fontSize: '13px', textAlign: 'left', margin: 0,
              background: '#fff2f0', padding: '8px 12px', borderRadius: '6px',
              border: '1px solid #ffccc7'
            }}>
              ❌ {error}
            </p>
          )}

          {/* 成功提示 */}
          {success && (
            <p style={{
              color: '#52c41a', fontSize: '13px', textAlign: 'left', margin: 0,
              background: '#f6ffed', padding: '8px 12px', borderRadius: '6px',
              border: '1px solid #b7eb8f'
            }}>
              ✅ {success}
            </p>
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%', padding: '14px', marginTop: '6px',
              fontSize: '16px', opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? '处理中...' : '重置密码'}
          </button>
        </form>

        {/* 返回登录 */}
        <p style={{ marginTop: '24px', fontSize: '14px', color: '#666' }}>
          <Link to="/login" style={{
            color: '#e66b33', fontWeight: '600', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: '4px'
          }}>
            <ArrowLeft size={14} />
            返回登录
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
