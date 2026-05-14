import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import request, { logout } from '../api/request';
import RechargeModal from '../components/RechargeModal';
import {
  ShieldCheck, ArrowRight, LogOut, Wallet, User, Lock,
  RefreshCw, Copy, MessageSquare, CreditCard, ChevronRight, Users, Share2, Download, Gift
} from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

const PCProfilePage = () => {
  const navigate = useNavigate();
  const { isInstallable, isStandalone, promptInstall } = usePWA();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);
  const [activeTab, setActiveTab] = useState('account'); // 'account', 'security', 'support'
  const [feedback, setFeedback] = useState({ content: '', contact: '' });
  const [pwdForm, setPwdForm] = useState({ password: '', code: '' });
  const [bindForm, setBindForm] = useState({ email: '', code: '' });
  const [phoneBind, setPhoneBind] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [activeSecuritySection, setActiveSecuritySection] = useState(null); // 'email', 'password', 'phone'
  const [inviteStats, setInviteStats] = useState(null);
  const [redeemCode, setRedeemCode] = useState('');

  const handleRedeem = async () => {
    if (!redeemCode) return;
    setLoading(true);
    try {
      const res = await request.post('/user/redeem', { code: redeemCode });
      alert(res.message);
      setRedeemCode('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || '兑换失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const fetchData = async () => {
    try {
      const [user, stats] = await Promise.all([
        request.get('/auth/me'),
        request.get('/auth/invitation-stats')
      ]);
      setUserInfo(user);
      setInviteStats(stats);
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

  const handleSendBindCode = async () => {
    if (!bindForm.email || !bindForm.email.includes('@')) {
      alert('请输入有效的邮箱地址');
      return;
    }
    setLoading(true);
    try {
      await request.post('/auth/send-code', { email: bindForm.email });
      setCountdown(60);
      alert('验证码已发送至您的邮箱');
    } catch (err) {
      alert(err.response?.data?.detail || '发送失败');
    } finally {
      setLoading(false);
    }
  };

  const handleBindEmail = async () => {
    if (!bindForm.code) return;
    setLoading(true);
    try {
      await request.post('/auth/bind-email', { email: bindForm.email, code: bindForm.code });
      alert('邮箱绑定成功！');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || '绑定失败');
    } finally {
      setLoading(false);
    }
  };

  const handleBindPhone = async () => {
    if (phoneBind.length !== 11) {
      alert('请输入正确的 11 位手机号');
      return;
    }
    setLoading(true);
    try {
      await request.post('/auth/bind-phone', { phone: phoneBind });
      alert('手机号绑定成功！');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || '绑定失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!pwdForm.password || !pwdForm.code) return;
    setLoading(true);
    try {
      await request.post('/auth/change-password', { 
        email: userInfo.email,
        password: pwdForm.password, 
        code: pwdForm.code 
      });
      alert('密码修改成功，请重新登录');
      logout();
    } catch (err) {
      alert(err.response?.data?.detail || '修改失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordCode = async () => {
    if (!userInfo?.email) {
      alert('请先绑定邮箱');
      return;
    }
    setLoading(true);
    try {
      await request.post('/auth/send-code', { email: userInfo.email });
      setCountdown(60);
      alert('验证码已发送至您的绑定邮箱');
    } catch (err) {
      alert(err.response?.data?.detail || '发送失败');
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
    if (!window.confirm('清理挂起任务并同步刷新前台缓存？')) return;
    setLoading(true);
    try {
      await request.post('/image/reset');
      
      // 清理前台任务缓存
      localStorage.removeItem('visionary_active_jobs');
      localStorage.removeItem('visionary_active_jobs_mobile');
      sessionStorage.removeItem('pending_prompt');
      sessionStorage.removeItem('pending_reuse');
      
      alert('清理成功，即将刷新前台状态');
      window.location.href = '/'; // 强制跳转回首页刷新状态
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
        <SidebarItem id="redeem" icon={<Gift size={20} />} label="兑换中心" />
        <SidebarItem id="invite" icon={<Users size={20} />} label="邀请奖励" />
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <button
                  onClick={() => alert('内测阶段暂不支持充值\n\n可通过每日签到和邀请好友获取积分')}
                  style={{
                    padding: '16px 32px', borderRadius: '16px', background: 'white',
                    color: '#FF3D00', border: 'none', fontWeight: '800', fontSize: '16px',
                    cursor: 'pointer', transition: 'transform 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  充值
                </button>
                <button
                  onClick={async () => {
                    try {
                      const res = await request.post('/auth/daily-reward');
                      alert(res.message || '签到成功！');
                      fetchData();
                    } catch (err) {
                      alert(err.response?.data?.detail || '签到失败');
                    }
                  }}
                  style={{
                    padding: '10px 24px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.3)', color: 'white',
                    border: '1px solid rgba(255,255,255,0.4)',
                    fontWeight: '700', fontSize: '13px', cursor: 'pointer'
                  }}
                >
                  签到 +5 积分
                </button>
              </div>
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

              {localStorage.getItem('isGuest') !== 'true' && !isStandalone && (
                <div
                  onClick={() => {
                    if (isInstallable) { promptInstall(); }
                    else { alert('点击浏览器地址栏右侧的安装图标 ⬇\n或 菜单 → "安装 Visionary"\n即可添加到桌面，首次安装送 10 积分'); }
                  }}
                  style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', cursor: 'pointer' }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fff5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#C56A50' }}>
                    <Download size={20} />
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px', color: '#C56A50' }}>添加桌面版</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>像原生 App 一样快速启动</div>
                </div>
              )}
              <div
                onClick={handleResetTasks}
                style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', cursor: 'pointer' }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#FF9500' }}>
                  <RefreshCw size={20} className={loading ? 'loading-spin' : ''} />
                </div>
                <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>清理任务锁 & 刷新</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>解决生图卡死及前台同步问题</div>
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

        {activeTab === 'redeem' && (
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>兑换中心</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>输入您的兑换码即可领取积分奖励</p>
            <div style={{ display: 'flex', gap: '12px', maxWidth: '500px' }}>
              <input 
                type="text" 
                placeholder="请输入兑换码 (例如: WELCOME50)" 
                value={redeemCode} 
                onChange={e => setRedeemCode(e.target.value)}
                style={{ flex: 1, padding: '14px 20px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f9f9fb', outline: 'none' }} 
              />
              <button 
                onClick={handleRedeem} 
                disabled={loading || !redeemCode}
                style={{ 
                  padding: '0 32px', borderRadius: '12px', border: 'none', 
                  background: 'var(--primary)', color: '#fff', fontWeight: '700', cursor: 'pointer',
                  opacity: loading || !redeemCode ? 0.6 : 1
                }}
              >
                {loading ? '兑换中...' : '立即兑换'}
              </button>
            </div>
            <div style={{ marginTop: '24px', padding: '16px', background: 'var(--primary-glow)', borderRadius: '12px', border: '1px solid var(--primary-border)' }}>
               <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}>温馨提示：</div>
               <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.6' }}>
                 • 每个兑换码对于每个用户仅限领取一次。<br/>
                 • 兑换码区分大小写，请确保输入正确。<br/>
                 • 如有任何疑问，请通过“意见反馈”联系我们。
               </div>
            </div>
          </div>
        )}

        {activeTab === 'invite' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800' }}>邀请好友赚积分</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '32px' }}>
              {/* 邀请卡片 */}
              <div style={{ 
                background: '#FFF5F0', borderRadius: '32px', padding: '40px', 
                border: '1px solid #FFDEC9', textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center'
              }}>
                <div style={{ width: '64px', height: '64px', background: '#FF6B00', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '24px' }}>
                  <Share2 size={32} />
                </div>
                <div style={{ color: '#A87B6D', fontSize: '14px', marginBottom: '8px' }}>您的专属邀请码</div>
                <div style={{ fontSize: '40px', fontWeight: '900', color: '#FF6B00', letterSpacing: '4px', marginBottom: '32px' }}>{userInfo?.uid}</div>
                
                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(userInfo?.uid);
                      alert('邀请码已复制');
                    }}
                    style={{ flex: 1, padding: '14px', borderRadius: '16px', border: 'none', background: '#FF6B00', color: 'white', fontWeight: '800', cursor: 'pointer' }}
                  >
                    复制邀请码
                  </button>
                  <button 
                    onClick={() => {
                      const url = `${window.location.origin}/register?invite=${userInfo?.uid}`;
                      navigator.clipboard.writeText(url);
                      alert('专属链接已复制');
                    }}
                    style={{ padding: '14px', borderRadius: '16px', border: '2px solid #FF6B00', background: 'transparent', color: '#FF6B00', fontWeight: '800', cursor: 'pointer' }}
                  >
                    复制链接
                  </button>
                </div>
              </div>

              {/* 规则与进度 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div style={{ background: '#f8f9fa', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>累计邀请成功</div>
                    <div style={{ fontSize: '28px', fontWeight: '900' }}>{inviteStats?.invited_count || 0} <span style={{ fontSize: '14px', fontWeight: '500' }}>人</span></div>
                  </div>
                  <div style={{ background: '#f8f9fa', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>今日获得奖励</div>
                    <div style={{ fontSize: '28px', fontWeight: '900' }}>{inviteStats?.today_reward_count || 0} / {inviteStats?.daily_limit || 5} <span style={{ fontSize: '14px', fontWeight: '500' }}>次</span></div>
                  </div>
                </div>

                <div style={{ background: 'white', padding: '28px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: '800', marginBottom: '20px' }}>奖励规则</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                      { t: '好友注册', d: '好友使用您的邀请码注册，立即获得 5 积分启航礼包。' },
                      { t: '首画成功', d: '好友完成首次 AI 图像生成后，您将获得 10 积分推广奖励。' },
                      { t: '每日上限', d: '每人每日最多可通过邀请获得 5 次奖励（共 50 积分）。' }
                    ].map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '800' }}>{idx + 1}</div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>{item.t}</div>
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{item.d}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>安全设置</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>管理您的账户安全与验证方式</p>

            <div style={{ background: 'white', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden' }}>
              {/* 邮箱绑定条目 */}
              <div 
                onClick={() => setActiveSecuritySection(activeSecuritySection === 'email' ? null : 'email')}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '24px', cursor: 'pointer', transition: 'all 0.3s',
                  background: activeSecuritySection === 'email' ? '#fafafa' : 'white'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(52, 199, 89, 0.1)', color: '#34C759', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '16px' }}>邮箱绑定</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{userInfo?.email ? `已绑定：${userInfo.email}` : '未绑定 (用于找回密码)'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <span style={{ fontSize: '14px' }}>{userInfo?.email ? '已绑定' : '去绑定'}</span>
                  <ChevronRight size={18} style={{ transform: activeSecuritySection === 'email' ? 'rotate(90deg)' : 'none', transition: '0.3s' }} />
                </div>
              </div>

              {activeSecuritySection === 'email' && !userInfo?.email && (
                <div style={{ padding: '0 24px 24px 80px', animation: 'fadeIn 0.3s' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '350px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="email" placeholder="输入邮箱地址" value={bindForm.email} 
                        onChange={e => setBindForm({...bindForm, email: e.target.value})}
                        style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f9f9fb', outline: 'none' }} 
                      />
                      <button 
                        onClick={handleSendBindCode} disabled={countdown > 0 || loading}
                        style={{ padding: '0 12px', border: '1px solid var(--primary)', color: 'var(--primary)', background: 'transparent', borderRadius: '12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        {countdown > 0 ? `${countdown}s` : '获取验证码'}
                      </button>
                    </div>
                    <input 
                      type="text" placeholder="验证码" value={bindForm.code} 
                      onChange={e => setBindForm({...bindForm, code: e.target.value})}
                      style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f9f9fb', outline: 'none' }} 
                    />
                    <button 
                      onClick={handleBindEmail} disabled={loading || !bindForm.code}
                      className="btn-primary" style={{ padding: '12px' }}
                    >
                      {loading ? '处理中...' : '确认绑定'}
                    </button>
                  </div>
                </div>
              )}

              <div style={{ height: '1px', background: '#f0f0f0', margin: '0 24px' }} />

              {/* 手机绑定条目 */}
              <div 
                onClick={() => setActiveSecuritySection(activeSecuritySection === 'phone' ? null : 'phone')}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '24px', cursor: 'pointer', transition: 'all 0.3s',
                  background: activeSecuritySection === 'phone' ? '#fafafa' : 'white'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255, 149, 0, 0.1)', color: '#FF9500', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Wallet size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '16px' }}>手机号绑定</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{userInfo?.phone ? `已绑定：${userInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}` : '未绑定 (用于多端登录)'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <span style={{ fontSize: '14px' }}>{userInfo?.phone ? '已绑定' : '去绑定'}</span>
                  <ChevronRight size={18} style={{ transform: activeSecuritySection === 'phone' ? 'rotate(90deg)' : 'none', transition: '0.3s' }} />
                </div>
              </div>

              {activeSecuritySection === 'phone' && !userInfo?.phone && (
                <div style={{ padding: '0 24px 24px 80px', animation: 'fadeIn 0.3s' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '350px' }}>
                    <input 
                      type="text" placeholder="输入 11 位手机号" value={phoneBind} 
                      onChange={e => setPhoneBind(e.target.value)}
                      style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f9f9fb', outline: 'none' }} 
                    />
                    <button 
                      onClick={handleBindPhone} disabled={loading || phoneBind.length !== 11}
                      className="btn-primary" style={{ padding: '12px', background: '#FF9500' }}
                    >
                      {loading ? '处理中...' : '确认绑定'}
                    </button>
                  </div>
                </div>
              )}

              <div style={{ height: '1px', background: '#f0f0f0', margin: '0 24px' }} />

              {/* 修改密码条目 */}
              <div 
                onClick={() => setActiveSecuritySection(activeSecuritySection === 'password' ? null : 'password')}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '24px', cursor: 'pointer', transition: 'all 0.3s',
                  background: activeSecuritySection === 'password' ? '#fafafa' : 'white'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0, 122, 255, 0.1)', color: '#007AFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lock size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '16px' }}>登录密码</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>已设置 (定期更换更安全)</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <span style={{ fontSize: '14px' }}>修改密码</span>
                  <ChevronRight size={18} style={{ transform: activeSecuritySection === 'password' ? 'rotate(90deg)' : 'none', transition: '0.3s' }} />
                </div>
              </div>

              {activeSecuritySection === 'password' && (
                <div style={{ padding: '0 24px 24px 80px', animation: 'fadeIn 0.3s' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '350px' }}>
                    {!userInfo?.email ? (
                      <div style={{ padding: '12px', background: '#fff1f0', color: '#f5222d', borderRadius: '8px', fontSize: '13px' }}>
                        ⚠️ 请先绑定邮箱，修改密码需要通过邮箱验证。
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input 
                            type="text" value={userInfo.email} disabled
                            style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#eee', color: '#666', cursor: 'not-allowed' }} 
                          />
                          <button 
                            onClick={handleSendPasswordCode} disabled={countdown > 0 || loading}
                            style={{ padding: '0 12px', border: '1px solid var(--primary)', color: 'var(--primary)', background: 'transparent', borderRadius: '12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            {countdown > 0 ? `${countdown}s` : '获取验证码'}
                          </button>
                        </div>
                        <input 
                          type="text" placeholder="验证码" value={pwdForm.code} 
                          onChange={e => setPwdForm({...pwdForm, code: e.target.value})}
                          style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f9f9fb', outline: 'none' }} 
                        />
                        <input 
                          type="password" placeholder="设置新密码" value={pwdForm.password} 
                          onChange={e => setPwdForm({...pwdForm, password: e.target.value})}
                          style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f9f9fb', outline: 'none' }} 
                        />
                        <button 
                          onClick={handlePasswordSubmit} disabled={loading || !pwdForm.code}
                          className="btn-primary" style={{ padding: '12px', background: 'var(--text-main)' }}
                        >
                          {loading ? '保存中...' : '确认修改并重新登录'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
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
