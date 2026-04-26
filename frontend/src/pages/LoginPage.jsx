import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useLoginController } from '../controllers/useLoginController';

const LoginPage = () => {
  const {
    username, setUsername,
    password, setPassword,
    showPassword, setShowPassword,
    error, handleLogin
  } = useLoginController();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fcfcfc' }}>
      <div className="card" style={{ padding: '40px', width: '400px', textAlign: 'center' }}>
        <h1 style={{ color: '#e66b33', marginBottom: '10px' }}>Visionary</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>欢迎回来，开始您的创意之旅</p>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input
            type="text"
            placeholder="用户名 / 邮箱"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box', paddingRight: '40px' }}
            />
            <div 
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#999',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>
          {error && <p style={{ color: '#ff4d4f', fontSize: '14px' }}>{error}</p>}
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>立即登录</button>
        </form>
        <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          没有账号？ <Link to="/register" style={{ color: '#e66b33', fontWeight: '600', textDecoration: 'none' }}>立即注册</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
