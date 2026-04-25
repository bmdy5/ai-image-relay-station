import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useRegisterController } from '../controllers/useRegisterController';

const RegisterPage = () => {
  const {
    username, setUsername,
    password, setPassword,
    showPassword, setShowPassword,
    error, handleRegister
  } = useRegisterController();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fcfcfc' }}>
      <div className="card" style={{ padding: '40px', width: '400px', textAlign: 'center' }}>
        <h1 style={{ color: '#e66b33', marginBottom: '10px' }}>加入内测</h1>
        <p style={{ color: '#666', marginBottom: '10px' }}>体验 GPT Image 2 的震撼效果</p>
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
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="设置密码"
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
