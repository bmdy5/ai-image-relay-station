import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import request, { logout } from '../api/request';
import RechargeModal from '../components/RechargeModal';
import { 
  ShieldCheck, ArrowRight, LogOut, Wallet, User, Lock, 
  RefreshCw, Copy, ExternalLink, MessageSquare
} from 'lucide-react';

const MobileDrawer = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', animation: 'fadeInOverlay 0.3s ease' }} />
      <div style={{ 
        position: 'relative', width: '100%', background: '#fff', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', 
        padding: '24px 20px 40px', animation: 'slideUpDrawer 0.3s cubic-bezier(0.32, 0.72, 0, 1)', maxHeight: '85vh', overflowY: 'auto' 
      }}>
        <div style={{ width: '40px', height: '4px', background: '#E5E5EA', borderRadius: '2px', margin: '0 auto 20px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800' }}>{title}</h2>
          <div onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '16px', background: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>×</div>
        </div>
        {children}
      </div>
    </div>
  );
};

const ProfilePage = ({ isMobile }) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState(null); // 'password', 'support'
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
      setActiveDrawer(null);
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

  const SettingItem = ({ icon, label, sublabel, onClick, color = '#1D1D1F' }) => (
    <div 
      onClick={onClick}
      style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '16px 20px', background: '#fff', cursor: 'pointer' 
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ color }}>{icon}</div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#1D1D1F' }}>{label}</div>
          {sublabel && <div style={{ fontSize: '11px', color: '#8E8E93', marginTop: '2px' }}>{sublabel}</div>}
        </div>
      </div>
      <ArrowRight size={16} color="#C4C4C6" />
    </div>
  );

  return (
    <div style={{ 
      minHeight: '100%', background: 'var(--bg-main)', 
      padding: isMobile ? '0 0 100px 0' : '40px 20px' 
    }}>
      {/* 资产看板 */}
      <div style={{ padding: '24px 20px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #FF6B00 0%, #FF3D00 100%)', 
          borderRadius: '32px', padding: '30px', color: 'white',
          boxShadow: '0 20px 40px rgba(255, 107, 0, 0.2)',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '28px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={30} />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '800' }}>{userInfo?.username}</div>
              <div onClick={handleCopyUID} style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                UID: {userInfo?.uid} <Copy size={12} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>当前余额</div>
              <div style={{ fontSize: '32px', fontWeight: '900', marginTop: '4px' }}>{userInfo?.points} <span style={{ fontSize: '14px', fontWeight: '700' }}>积分</span></div>
            </div>
            <button 
              onClick={() => setShowRecharge(true)}
              style={{ padding: '12px 24px', borderRadius: '16px', background: 'white', color: '#FF3D00', border: 'none', fontWeight: '800', fontSize: '14px' }}
            >
              充值
            </button>
          </div>
        </div>
      </div>

      {/* 设置列表 - 账户 */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#8E8E93', marginBottom: '8px', paddingLeft: '10px' }}>账户设置</div>
        <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <SettingItem icon={<Wallet size={20} />} label="账单明细" sublabel="查看积分消费记录" onClick={() => navigate('/points-history')} />
          <div style={{ height: '1px', background: '#F2F2F7', marginLeft: '54px' }} />
          <SettingItem icon={<Lock size={20} />} label="修改密码" sublabel="保障账户安全" onClick={() => setActiveDrawer('password')} />
        </div>
      </div>

      {/* 设置列表 - 高级功能 */}
      <div style={{ padding: '24px 20px 0 20px' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#8E8E93', marginBottom: '8px', paddingLeft: '10px' }}>高级功能</div>
        <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <SettingItem 
            icon={<RefreshCw size={20} className={loading ? 'loading-spin' : ''} />} 
            label="清理任务锁" 
            sublabel="解决生图卡死问题" 
            onClick={handleResetTasks} 
            color="#FF9500"
          />
          {userInfo?.is_admin && (
            <>
              <div style={{ height: '1px', background: '#F2F2F7', marginLeft: '54px' }} />
              <SettingItem icon={<ShieldCheck size={20} />} label="管理后台" sublabel="系统管理入口" onClick={() => navigate('/admin')} color="var(--master)" />
            </>
          )}
        </div>
      </div>

      {/* 支持 */}
      <div style={{ padding: '24px 20px' }}>
        <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <SettingItem icon={<MessageSquare size={20} />} label="联系支持" onClick={() => setActiveDrawer('support')} />
        </div>
      </div>

      {/* 登出 */}
      <div style={{ padding: '0 20px' }}>
        <button 
          onClick={logout}
          style={{ 
            width: '100%', padding: '16px', borderRadius: '20px', background: 'white', 
            color: '#FF3B30', border: 'none', fontWeight: '700', fontSize: '15px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <LogOut size={18} /> 退出当前账户
        </button>
      </div>

      {/* 抽屉：修改密码 */}
      <MobileDrawer isOpen={activeDrawer === 'password'} onClose={() => setActiveDrawer(null)} title="修改密码">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input 
            type="password" placeholder="原密码" value={pwdForm.old} 
            onChange={e => setPwdForm({...pwdForm, old: e.target.value})}
            style={{ width: '100%', padding: '16px', borderRadius: '16px', border: 'none', background: '#F2F2F7', fontSize: '15px' }} 
          />
          <input 
            type="password" placeholder="新密码" value={pwdForm.new} 
            onChange={e => setPwdForm({...pwdForm, new: e.target.value})}
            style={{ width: '100%', padding: '16px', borderRadius: '16px', border: 'none', background: '#F2F2F7', fontSize: '15px' }} 
          />
          <button 
            onClick={handlePasswordSubmit} disabled={loading}
            style={{ width: '100%', padding: '16px', borderRadius: '16px', border: 'none', background: '#1D1D1F', color: '#fff', fontWeight: '700', marginTop: '10px' }}
          >
            {loading ? '提交中...' : '确认修改'}
          </button>
        </div>
      </MobileDrawer>

      {/* 抽屉：联系支持 */}
      <MobileDrawer isOpen={activeDrawer === 'support'} onClose={() => setActiveDrawer(null)} title="意见反馈">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <textarea 
            placeholder="请详细描述您遇到的问题或建议..." value={feedback.content} 
            onChange={e => setFeedback({...feedback, content: e.target.value})}
            style={{ width: '100%', height: '150px', padding: '16px', borderRadius: '16px', border: 'none', background: '#F2F2F7', fontSize: '15px', resize: 'none' }} 
          />
          <input 
            placeholder="联系方式 (可选)" value={feedback.contact} 
            onChange={e => setFeedback({...feedback, contact: e.target.value})}
            style={{ width: '100%', padding: '16px', borderRadius: '16px', border: 'none', background: '#F2F2F7', fontSize: '15px' }} 
          />
          <button 
            onClick={handleSupportSubmit} disabled={loading || !feedback.content}
            style={{ width: '100%', padding: '16px', borderRadius: '16px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: '700', marginTop: '10px' }}
          >
            {loading ? '提交中...' : '提交反馈'}
          </button>
        </div>
      </MobileDrawer>

      {showRecharge && (
        <RechargeModal 
          uid={userInfo?.uid} onClose={() => setShowRecharge(false)} 
          onSuccess={() => { setShowRecharge(false); fetchData(); }}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .loading-spin { animation: spin 1s linear infinite; }
        @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpDrawer { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}} />
    </div>
  );
};

export default ProfilePage;
