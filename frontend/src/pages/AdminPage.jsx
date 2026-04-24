import React, { useState } from 'react';
import request from '../api/request';

const AdminPage = () => {
  const [targetUsername, setTargetUsername] = useState('');
  const [amount, setAmount] = useState(100);
  const [message, setMessage] = useState('');

  const handleRecharge = async (e) => {
    e.preventDefault();
    try {
      const res = await request.post(`/admin/recharge?target_username=${targetUsername}&amount=${amount}`);
      setMessage(`✅ ${res.message}`);
      setTargetUsername('');
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.detail || '操作失败'}`);
    }
  };

  return (
    <div className="app-container" style={{ marginTop: '5rem' }}>
      <h1>管理员控制台</h1>
      <div className="glass-card" style={{ padding: '3rem', width: '500px' }}>
        <h3>手动积分充值</h3>
        <form onSubmit={handleRecharge} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
          <input
            type="text"
            placeholder="目标用户 ID"
            value={targetUsername}
            onChange={(e) => setTargetUsername(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#222', color: '#fff' }}
          />
          <input
            type="number"
            placeholder="充值积分数量"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#222', color: '#fff' }}
          />
          <button type="submit" className="btn-primary">确认充值</button>
        </form>
        {message && <p style={{ marginTop: '1.5rem' }}>{message}</p>}
      </div>
    </div>
  );
};

export default AdminPage;
