import React, { useState, useEffect } from 'react';
import request from '../api/request';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('audit'); // 'recharge' or 'audit'
  const [targetUsername, setTargetUsername] = useState('');
  const [amount, setAmount] = useState(100);
  const [message, setMessage] = useState('');
  const [pendingLogs, setPendingLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchPendingLogs();
    }
  }, [activeTab]);

  const fetchPendingLogs = async () => {
    setLoading(true);
    try {
      const data = await request.get('/admin/recharge/pending');
      setPendingLogs(data);
    } catch (err) {}
    setLoading(false);
  };

  const handleAudit = async (logId, approved) => {
    try {
      await request.post(`/admin/recharge/audit/${logId}`, {
        approved,
        admin_note: approved ? '核对无误' : '未收到对应款项'
      });
      alert(approved ? '审核通过' : '已拒绝');
      fetchPendingLogs();
    } catch (err) {
      alert('审核操作失败');
    }
  };

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
    <div style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 20px' }}>
      <h1 style={{ marginBottom: '30px' }}>管理员控制台</h1>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #eee' }}>
        <div 
          onClick={() => setActiveTab('audit')}
          style={{ padding: '10px 20px', cursor: 'pointer', borderBottom: activeTab === 'audit' ? '2px solid #e66b33' : 'none', color: activeTab === 'audit' ? '#e66b33' : '#666' }}
        >
          待处理审核 ({pendingLogs.length})
        </div>
        <div 
          onClick={() => setActiveTab('recharge')}
          style={{ padding: '10px 20px', cursor: 'pointer', borderBottom: activeTab === 'recharge' ? '2px solid #e66b33' : 'none', color: activeTab === 'recharge' ? '#e66b33' : '#666' }}
        >
          手动强充积分
        </div>
      </div>

      {activeTab === 'recharge' ? (
        <div className="card" style={{ padding: '30px', maxWidth: '500px' }}>
          <h3>手动积分充值</h3>
          <form onSubmit={handleRecharge} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            <input
              type="text"
              placeholder="目标用户名"
              value={targetUsername}
              onChange={(e) => setTargetUsername(e.target.value)}
              required
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <input
              type="number"
              placeholder="充值积分数量"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '12px' }}>确认充值</button>
          </form>
          {message && <p style={{ marginTop: '1.5rem', fontSize: '14px' }}>{message}</p>}
        </div>
      ) : (
        <div className="card" style={{ padding: '24px' }}>
          <h3>充值申请审核</h3>
          <div style={{ overflowX: 'auto', marginTop: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f5f5f5', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px' }}>用户ID</th>
                  <th style={{ padding: '12px 8px' }}>申请金额</th>
                  <th style={{ padding: '12px 8px' }}>对应积分</th>
                  <th style={{ padding: '12px 8px' }}>提交时间</th>
                  <th style={{ padding: '12px 8px' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {pendingLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '12px 8px' }}>{log.user_id}</td>
                    <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>¥{log.money_amount}</td>
                    <td style={{ padding: '12px 8px' }}>{log.amount} 分</td>
                    <td style={{ padding: '12px 8px', color: '#888' }}>{new Date(log.created_at).toLocaleString()}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleAudit(log.id, true)}
                          style={{ padding: '4px 12px', background: '#52c41a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          通过
                        </button>
                        <button 
                          onClick={() => handleAudit(log.id, false)}
                          style={{ padding: '4px 12px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          拒绝
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pendingLogs.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>暂无待审核申请</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
