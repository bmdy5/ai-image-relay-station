import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import request, { logout } from '../api/request';
import RechargeModal from '../components/RechargeModal';
import { 
  ShieldCheck, ArrowRight, LogOut, Wallet, User, Lock, 
  RefreshCw, Copy, MessageSquare, CreditCard, ChevronRight
} from 'lucide-react';

const PCProfilePage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);
  const [activeTab, setActiveTab] = useState('account'); // 'account', 'security', 'support'
  const [feedback, setFeedback] = useState({ content: '', contact: '' });
  const [pwdForm, setPwdForm] = useState({ old: '', new: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const user = await request.get('/auth/me');
      setUserInfo(user);
    } catch (err) {}
  };

  const handleSupportSubmit = async () => {
    if (!feedback.content) return;
    setLoading(true);
    try {
      await request.post('/feedback/submit', feedback);
      alert('感谢反馈，我们将尽快处理！');
      setFeedback({ content: '', contact: '' });
    } catch (err) {
      alert('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!pwdForm.old || !pwdForm.new) return;
    setLoading(true);
    try {
      await request.post('/auth/change-password', { 
        old_password: pwdForm.old, 
        new_password: pwdForm.new 
      });
      alert('密码修改成功，请重新登录');
      logout();
    } catch (err) {
      alert(err.response?.data?.detail || '修改失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUID = () => {
    if (userInfo?.uid) {
      navigator.clipboard.writeText(userInfo.uid);
      alert('UID 已复制');
    }
  };

  const handleResetTasks = async () => {
    if (!window.confirm('清理挂起任务？')) return;
    setLoading(true);
    try {
      await request.post('/image/reset');
      alert('清理成功');
      fetchData();
    } catch (err) {
      alert('失败: ' + (err.response?.data?.detail || '网络错误'));
    } finally {
      setLoading(false);
    }
  };

  const SidebarItem = ({ id, icon, label }) => (
    <div 
      onClick={() => setActiveTab(id)}
      style={{ 
        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
        borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s',
        background: activeTab === id ? 'var(--primary-glow)' : 'transparent',
        color: activeTab === id ? 'var(--primary)' : 'var(--text-secondary)',
        fontWeight: activeTab === id ? '700' : '500'
      }}
    >
      {icon}
      <span>{label}</span>
    </div>
  );

  return (
    <div style={{ 
      display: 'grid', gridTemplateColumns: '280px 1fr', gap: '40px' 
    }}>
      {/* 侧边栏 */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ padding: '0 16px 20px 16px', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <User size={24} />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>{userInfo?.username || '加载中...'}</div>
              <div onClick={handleCopyUID} style={{ fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                UID: {userInfo?.uid?.slice(0, 8)}... <Copy size={12} />
              </div>
            </div>
          </div>
        </div>

        <SidebarItem id="account" icon={<Wallet size={20} />} label="账户概览" />
        <SidebarItem id="security" icon={<Lock size={20} />} label="安全设置" />
        <SidebarItem id="support" icon={<MessageSquare size={20} />} label="意见反馈" />
        
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <div 
            onClick={logout}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
              borderRadius: '12px', cursor: 'pointer', color: '#ff3b30', fontWeight: '600' 
            }}
          >
            <LogOut size={20} />
            <span>退出登录</span>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main>
        {activeTab === 'account' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 积分卡片 */}
            <div style={{ 
              background: 'linear-gradient(135deg, #FF6B00 0%, #FF3D00 100%)', 
              borderRadius: '24px', padding: '40px', color: 'white',
              boxShadow: '0 20px 40px rgba(255, 107, 0, 0.15)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '16px', opacity: 0.9 }}>可用积分余额</div>
                <div style={{ fontSize: '48px', fontWeight: '900', marginTop: '8px' }}>
                  {userInfo?.points} <span style={{ fontSize: '18px' }}>积分</span>
                </div>
              </div>
              <button 
                onClick={() => setShowRecharge(true)}
                style={{ 
                  padding: '16px 32px', borderRadius: '16px', background: 'white', 
                  color: '#FF3D00', border: 'none', fontWeight: '800', fontSize: '16px',
                  cursor: 'pointer', transition: 'transform 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                立即充值
              </button>
            </div>

            {/* 快速操作 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div 
                onClick={() => navigate('/points-history')}
                style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', cursor: 'pointer' }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: 'var(--primary)' }}>
                  <CreditCard size={20} />
                </div>
                <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>账单明细</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>查看您的积分收支记录</div>
              </div>

              <div 
                onClick={handleResetTasks}
                style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', cursor: 'pointer' }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#FF9500' }}>
                  <RefreshCw size={20} className={loading ? 'loading-spin' : ''} />
                </div>
                <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>清理任务锁</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>解决生图任务卡死或无法提交</div>
              </div>
            </div>

            {userInfo?.is_admin && (
              <div 
                onClick={() => navigate('/admin')}
                style={{ 
                  background: 'white', padding: '20px 24px', borderRadius: '20px', 
                  border: '1px solid var(--border)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShieldCheck size={20} color="var(--master)" />
                  <span style={{ fontWeight: '700' }}>进入管理后台</span>
                </div>
                <ChevronRight size={18} color="#ccc" />
              </div>
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>修改登录密码</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>当前密码</label>
                <input 
                  type="password" placeholder="请输入原密码" value={pwdForm.old} 
                  onChange={e => setPwdForm({...pwdForm, old: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f9f9fb' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>新密码</label>
                <input 
                  type="password" placeholder="请输入新密码" value={pwdForm.new} 
                  onChange={e => setPwdForm({...pwdForm, new: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f9f9fb' }} 
                />
              </div>
              <button 
                onClick={handlePasswordSubmit} disabled={loading}
                style={{ 
                  marginTop: '12px', padding: '14px', borderRadius: '12px', border: 'none', 
                  background: 'var(--text-main)', color: '#fff', fontWeight: '700', cursor: 'pointer' 
                }}
              >
                {loading ? '正在保存...' : '确认修改并重新登录'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>意见反馈</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>您的反馈对我们非常重要，我们将认真对待每一个建议。</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
              <textarea 
                placeholder="请详细描述您遇到的问题或建议..." value={feedback.content} 
                onChange={e => setFeedback({...feedback, content: e.target.value})}
                style={{ width: '100%', height: '180px', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)', background: '#f9f9fb', resize: 'none' }} 
              />
              <input 
                placeholder="联系方式 (可选)" value={feedback.contact} 
                onChange={e => setFeedback({...feedback, contact: e.target.value})}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f9f9fb' }} 
              />
              <button 
                onClick={handleSupportSubmit} disabled={loading || !feedback.content}
                style={{ 
                  padding: '14px', borderRadius: '12px', border: 'none', 
                  background: 'var(--primary)', color: '#fff', fontWeight: '700', cursor: 'pointer' 
                }}
              >
                {loading ? '提交中...' : '提交反馈'}
              </button>
            </div>
          </div>
        )}
      </main>

      {showRecharge && (
        <RechargeModal 
          uid={userInfo?.uid} onClose={() => setShowRecharge(false)} 
          onSuccess={() => { setShowRecharge(false); fetchData(); }}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .loading-spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
};

export default PCProfilePage;
