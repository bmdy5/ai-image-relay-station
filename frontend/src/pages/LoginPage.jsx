import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import request from '../api/request';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await request.post('/auth/login', { username, password });
      localStorage.setItem('token', data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || '登录失败');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fcfcfc' }}>
      <div className="card" style={{ padding: '40px', width: '400px', textAlign: 'center' }}>
        <h1 style={{ color: '#e66b33', marginBottom: '10px' }}>GPT Image 2</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>欢迎回来，开始您的创意之旅</p>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input
            type="text"
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
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
