import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import request, { logout } from '../api/request';
import RechargeModal from '../components/RechargeModal';
import { 
  ShieldCheck, 
  Images, 
  ArrowLeft, 
  LogOut, 
  Wallet, 
  User, 
  Lock, 
  ClipboardList,
  Copy,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

const ProfilePage = ({ isMobile }) => {
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
      const user = await request.get('/auth/me');
      setUserInfo(user);
    } catch (err) {}
  };

  const handleCopyUID = () => {
    if (userInfo?.uid) {
      navigator.clipboard.writeText(userInfo.uid);
      alert('UID 已复制到剪贴板');
    }
  };

  const handleResetTasks = async () => {
    if (!window.confirm('此操作将强制清理您当前正在排队的任务状态。仅建议在任务长时间卡死（超过1分钟）时使用。确认重置吗？')) return;
    setLoading(true);
    try {
      await request.post('/image/reset');
      alert('任务锁已成功清理，您可以重新尝试生图。');
      fetchData();
    } catch (err) {
      alert('重置失败: ' + (err.response?.data?.detail || '网络错误'));
    } finally {
      setLoading(false);
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
    <div style={{ maxWidth: '1000px', margin: isMobile ? '20px auto' : '40px auto', padding: '0 20px', paddingBottom: isMobile ? '100px' : '0' }}>
      {!isMobile && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px' }}>个人中心</h1>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {userInfo?.is_admin && (
              <button onClick={() => navigate('/admin')} style={{ background: '#fff7e6', border: '1px solid #ffd591', color: '#e66b33', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} strokeWidth={2} /> 管理后台
              </button>
            )}
            <button onClick={() => navigate('/history')} style={{ background: 'transparent', border: 'none', color: '#e66b33', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Images size={16} strokeWidth={2} /> 我的创作
            </button>
            <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={16} strokeWidth={2} /> 返回首页
            </button>
          </div>
        </div>
      )}

      {isMobile && <h1 style={{ fontSize: '24px', marginBottom: '20px', textAlign: 'center' }}>个人中心</h1>}

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: '30px' }}>
        {/* 左侧：用户信息与修改密码 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={20} strokeWidth={2} color="#e66b33" /> 账户概览
            </h3>
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
                <span style={{ color: '#666' }}>可用积分</span>
                <span style={{ fontWeight: '600', color: '#e66b33' }}>🪙 {userInfo?.points}</span>
              </div>
              {userInfo?.frozen_points > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999' }}>
                  <span style={{ fontSize: '13px' }}>生图中锁定</span>
                  <span style={{ fontSize: '13px' }}>🔒 {userInfo?.frozen_points}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>注册时间</span>
                <span>{userInfo?.created_at && new Date(userInfo.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <button 
              className="btn-primary"
              onClick={() => setShowRecharge(true)}
              style={{ width: '100%', marginTop: '20px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Wallet size={18} strokeWidth={2} /> 充值积分
            </button>
            <button 
              onClick={logout}
              style={{ 
                width: '100%', marginTop: '12px', padding: '10px', borderRadius: '8px', 
                border: '1px solid #ff4d4f', color: '#ff4d4f', background: 'transparent', 
                cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' 
              }}
            >
              <LogOut size={16} strokeWidth={2} /> 退出当前账号
            </button>

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
              <button 
                onClick={handleResetTasks}
                disabled={loading}
                style={{ 
                  width: '100%', padding: '10px', borderRadius: '8px', 
                  border: '1px solid #faad14', color: '#faad14', background: 'transparent', 
                  cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' 
                }}
              >
                <RefreshCw size={16} strokeWidth={2} className={loading ? 'loading-spin' : ''} /> 
                {loading ? '正在清理...' : '清理挂起任务'}
              </button>
              <p style={{ fontSize: '11px', color: '#999', marginTop: '8px', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                <AlertTriangle size={12} /> 仅用于任务卡死时手动解锁
              </p>
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Lock size={20} strokeWidth={2} color="#e66b33" /> 修改密码
            </h3>
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

        {/* 右侧：消费明细入口 (原表格移至独立页面) */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div 
            className="card" 
            onClick={() => navigate('/points-history')}
            style={{ 
              padding: '20px 24px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              cursor: 'pointer',
              background: '#fff',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#fcfcfc'}
            onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#fff2eb', padding: '10px', borderRadius: '12px', color: '#e66b33' }}>
                <ClipboardList size={22} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>积分消费记录</div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>查看所有生图扣费明细</div>
              </div>
            </div>
            <div style={{ color: '#ccc' }}>
              <ArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} />
            </div>
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
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .loading-spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
};

export default ProfilePage;
