import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import request, { logout } from '../api/request';
import RechargeModal from '../components/RechargeModal';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [user, logs] = await Promise.all([
        request.get('/auth/me'),
        request.get('/user/consumption')
      ]);
      setUserInfo(user);
      setHistory(logs);
    } catch (err) {}
  };

  const handleCopyUID = () => {
    if (userInfo?.uid) {
      navigator.clipboard.writeText(userInfo.uid);
      alert('UID 已复制到剪贴板');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return setMsg({ type: 'error', text: '两次输入的新密码不一致' });
    }
    setLoading(true);
    try {
      await request.post('/auth/change-password', {
        old_password: passwords.old,
        new_password: passwords.new
      });
      setMsg({ type: 'success', text: '密码修改成功' });
      setPasswords({ old: '', new: '', confirm: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.detail || '修改失败' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px' }}>个人中心</h1>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {userInfo?.is_admin && (
            <button onClick={() => navigate('/admin')} style={{ background: '#fff7e6', border: '1px solid #ffd591', color: '#e66b33', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>🛠 管理后台</button>
          )}
          <button onClick={() => navigate('/history')} style={{ background: 'transparent', border: 'none', color: '#e66b33', cursor: 'pointer', fontWeight: '500' }}>🖼 我的创作</button>
          <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' }}>← 返回首页</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        {/* 左侧：用户信息与修改密码 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px' }}>账户概览</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>用户名</span>
                <span style={{ fontWeight: '600' }}>{userInfo?.username}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#666' }}>UID</span>
                <span 
                  onClick={handleCopyUID}
                  style={{ fontWeight: '600', color: '#e66b33', cursor: 'pointer', borderBottom: '1px dashed #e66b33' }}
                  title="点击复制"
                >
                  {userInfo?.uid}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>当前积分</span>
                <span style={{ fontWeight: '600', color: '#e66b33' }}>🪙 {userInfo?.points}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>注册时间</span>
                <span>{userInfo?.created_at && new Date(userInfo.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <button 
              className="btn-primary"
              onClick={() => setShowRecharge(true)}
              style={{ width: '100%', marginTop: '20px', padding: '10px' }}
            >
              充值积分
            </button>
            <button 
              onClick={logout}
              style={{ width: '100%', marginTop: '12px', padding: '10px', borderRadius: '8px', border: '1px solid #ff4d4f', color: '#ff4d4f', background: 'transparent', cursor: 'pointer', fontSize: '13px' }}
            >
              退出当前账号
            </button>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px' }}>修改密码</h3>
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input 
                type="password" 
                placeholder="当前密码" 
                required
                value={passwords.old}
                onChange={e => setPasswords({...passwords, old: e.target.value})}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
              <input 
                type="password" 
                placeholder="新密码" 
                required
                value={passwords.new}
                onChange={e => setPasswords({...passwords, new: e.target.value})}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
              <input 
                type="password" 
                placeholder="确认新密码" 
                required
                value={passwords.confirm}
                onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
              {msg.text && (
                <div style={{ fontSize: '13px', color: msg.type === 'success' ? '#52c41a' : '#ff4d4f' }}>
                  {msg.text}
                </div>
              )}
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary" 
                style={{ width: '100%', padding: '10px' }}
              >
                {loading ? '正在提交...' : '确认修改'}
              </button>
            </form>
          </div>
        </div>

        {/* 右侧：消费明细 */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>积分明细 (生图记录)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f5f5f5', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px' }}>时间</th>
                  <th style={{ padding: '12px 8px' }}>消耗</th>
                  <th style={{ padding: '12px 8px' }}>提示词</th>
                  <th style={{ padding: '12px 8px' }}>状态</th>
                </tr>
              </thead>
              <tbody>
                {history.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '12px 8px', color: '#888', whiteSpace: 'nowrap' }}>
                      {new Date(item.created_at).toLocaleString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '12px 8px', fontWeight: '600' }}>-{item.cost_points}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.prompt}>
                        {item.prompt}
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        background: item.status === 'success' ? '#f6ffed' : '#fff1f0',
                        color: item.status === 'success' ? '#52c41a' : '#ff4d4f',
                        border: `1px solid ${item.status === 'success' ? '#b7eb8f' : '#ffa39e'}`
                      }}>
                        {item.status === 'success' ? '成功' : '失败'}
                      </span>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>暂无记录</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showRecharge && (
        <RechargeModal 
          uid={userInfo?.uid} 
          onClose={() => setShowRecharge(false)} 
          onSuccess={() => {
            alert('报备提交成功，请等待审核');
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default ProfilePage;
