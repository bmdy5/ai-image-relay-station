import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import request from '../api/request';
import { CheckCircle2, XCircle, ShieldCheck, UserPlus, ListChecks, BookOpen, ArrowLeft } from 'lucide-react';

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('audit'); // 'recharge' or 'audit'
  const [targetUsername, setTargetUsername] = useState('');
  const [amount, setAmount] = useState(100);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [pendingLogs, setPendingLogs] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchPendingLogs();
    } else if (activeTab === 'feedback') {
      fetchFeedbacks();
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
      setMessage({ type: 'success', text: res.message });
      setTargetUsername('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || '操作失败' });
    }
  };

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await request.get('/feedback/list');
      setFeedbacks(data);
    } catch (err) {}
    setLoading(false);
  };

  const handleProcessFeedback = async (id) => {
    try {
      await request.patch(`/feedback/${id}`, { status: 'processed', admin_note: '已阅' });
      fetchFeedbacks();
    } catch (err) {
      alert('操作失败');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0 }}>管理员控制台</h1>
        <button 
          onClick={() => navigate('/')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'transparent', 
            border: '1px solid #ddd', 
            padding: '8px 16px', 
            borderRadius: '8px', 
            cursor: 'pointer',
            color: '#666',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.borderColor = '#ccc'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#ddd'; }}
        >
          <ArrowLeft size={16} /> 返回首页
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #eee' }}>
        <div 
          onClick={() => setActiveTab('audit')}
          style={{ padding: '10px 20px', cursor: 'pointer', borderBottom: activeTab === 'audit' ? '2px solid #e66b33' : 'none', color: activeTab === 'audit' ? '#e66b33' : '#666', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ListChecks size={18} strokeWidth={1.75} /> 待处理审核 ({pendingLogs.length})
        </div>
        <div 
          onClick={() => setActiveTab('recharge')}
          style={{ padding: '10px 20px', cursor: 'pointer', borderBottom: activeTab === 'recharge' ? '2px solid #e66b33' : 'none', color: activeTab === 'recharge' ? '#e66b33' : '#666', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <UserPlus size={18} strokeWidth={1.75} /> 手动强充积分
        </div>
        <div 
          onClick={() => setActiveTab('feedback')}
          style={{ padding: '10px 20px', cursor: 'pointer', borderBottom: activeTab === 'feedback' ? '2px solid #e66b33' : 'none', color: activeTab === 'feedback' ? '#e66b33' : '#666', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <BookOpen size={18} strokeWidth={1.75} /> 意见反馈 ({feedbacks.length})
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
          {message.text && (
            <p style={{ 
              marginTop: '1.5rem', fontSize: '14px', color: message.type === 'success' ? '#52c41a' : '#ff4d4f',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {message.text}
            </p>
          )}
        </div>
      ) : activeTab === 'audit' ? (
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
      ) : (
        <div className="card" style={{ padding: '24px' }}>
          <h3>用户意见反馈</h3>
          <div style={{ overflowX: 'auto', marginTop: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f5f5f5', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px', width: '80px' }}>状态</th>
                  <th style={{ padding: '12px 8px', width: '100px' }}>用户ID</th>
                  <th style={{ padding: '12px 8px' }}>反馈内容</th>
                  <th style={{ padding: '12px 8px', width: '150px' }}>联系方式</th>
                  <th style={{ padding: '12px 8px', width: '180px' }}>提交时间</th>
                  <th style={{ padding: '12px 8px', width: '100px' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map(fb => (
                  <tr key={fb.id} style={{ borderBottom: '1px solid #f5f5f5', opacity: fb.status === 'processed' ? 0.6 : 1 }}>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '10px', 
                        fontSize: '11px',
                        background: fb.status === 'processed' ? '#f5f5f5' : '#e66b3315',
                        color: fb.status === 'processed' ? '#999' : '#e66b33'
                      }}>
                        {fb.status === 'processed' ? '已阅' : '待处理'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px' }}>{fb.user_id || '匿名'}</td>
                    <td style={{ padding: '12px 8px', lineHeight: '1.5' }}>{fb.content}</td>
                    <td style={{ padding: '12px 8px', color: '#666' }}>{fb.contact || '-'}</td>
                    <td style={{ padding: '12px 8px', color: '#888' }}>{new Date(fb.created_at).toLocaleString()}</td>
                    <td style={{ padding: '12px 8px' }}>
                      {fb.status !== 'processed' && (
                        <button 
                          onClick={() => handleProcessFeedback(fb.id)}
                          style={{ padding: '4px 12px', background: '#eee', color: '#666', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          标记已阅
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {feedbacks.length === 0 && !loading && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>暂无反馈建议</td>
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
