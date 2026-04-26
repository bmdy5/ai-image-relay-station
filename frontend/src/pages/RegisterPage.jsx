import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import request from '../api/request';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const fingerprint = btoa(navigator.userAgent).substring(0, 32);
      await request.post('/auth/register', { username, password, fingerprint });
      alert('注册成功！');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || '注册失败');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fcfcfc' }}>
      <div className="card" style={{ padding: '40px', width: '400px', textAlign: 'center' }}>
        <h1 style={{ color: '#e66b33', marginBottom: '10px' }}>加入内测</h1>
        <p style={{ color: '#666', marginBottom: '10px' }}>体验 Visionary 的震撼效果</p>
        <div style={{ background: '#fff5f0', color: '#e66b33', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '20px' }}>
          ⚠️ 当前内测剩余名额：100 人
        </div>
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input
            type="text"
            placeholder="设置用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <input
            type="password"
            placeholder="设置密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          {error && <p style={{ color: '#ff4d4f', fontSize: '14px' }}>{error}</p>}
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>确认注册</button>
        </form>
        <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          已有账号？ <Link to="/login" style={{ color: '#e66b33', fontWeight: '600', textDecoration: 'none' }}>返回登录</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
