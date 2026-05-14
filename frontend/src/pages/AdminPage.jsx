import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import request from '../api/request';
import {
  CheckCircle2, XCircle, ShieldCheck, UserPlus, ListChecks,
  BookOpen, ArrowLeft, LayoutDashboard, BarChart3,
  Users, Image as ImageIcon, Zap, Trash2, Search,
  RefreshCw, DollarSign, TrendingUp, AlertCircle, Megaphone, Plus, X, Gift
} from 'lucide-react';

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [loading, setLoading] = useState(false);
  
  // Dashboard Stats
  const [stats, setStats] = useState({
    summary: { total_users: 0, total_images: 0, total_revenue: 0, total_points_spent: 0 },
    styles: [],
    recent_logs: []
  });

  // Financial Calculator
  const [manualCost, setManualCost] = useState(0);

  // Other Tabs State
  const [targetUsername, setTargetUsername] = useState('');
  const [amount, setAmount] = useState(100);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [pendingLogs, setPendingLogs] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [inviteLogs, setInviteLogs] = useState([]);

  // Announcement State
  const [announcement, setAnnouncement] = useState({ version: '', title: '', items: [] });
  const [announceMsg, setAnnounceMsg] = useState('');

  // Redemption State
  const [redemptionCodes, setRedemptionCodes] = useState([]);
  const [newCode, setNewCode] = useState({ code: '', points: 50, max_uses: 100 });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const data = await request.get('/admin/dashboard/stats');
        setStats(data);
      } else if (activeTab === 'audit') {
        const data = await request.get('/admin/recharge/pending');
        setPendingLogs(data);
      } else if (activeTab === 'feedback') {
        const data = await request.get('/feedback/list');
        setFeedbacks(data);
      } else if (activeTab === 'invitation') {
        const data = await request.get('/admin/invitation/logs');
        setInviteLogs(data);
      } else if (activeTab === 'announcement') {
        const data = await request.get('/announcement');
        const ann = data.data || data;
        if (ann && ann.version) setAnnouncement(ann);
      } else if (activeTab === 'redemption') {
        const data = await request.get('/admin/redemption-codes');
        setRedemptionCodes(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAudit = async (logId, approved) => {
    try {
      await request.post(`/admin/recharge/audit/${logId}`, {
        approved,
        admin_note: approved ? '核对无误' : '未收到对应款项'
      });
      fetchData();
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

  const handleProcessFeedback = async (id) => {
    try {
      await request.patch(`/feedback/${id}`, { status: 'processed', admin_note: '已阅' });
      fetchData();
    } catch (err) {
      alert('操作失败');
    }
  };

  const handleWipeImage = async (id) => {
    if (!window.confirm('确定要彻底抹除这条记录及其物理文件吗？此操作不可逆。')) return;
    try {
      await request.delete(`/admin/image/${id}/wipe`);
      fetchData();
    } catch (err) {
      alert('抹除失败');
    }
  };

  const handleCreateCode = async (e) => {
    e.preventDefault();
    try {
      await request.post('/admin/redemption-codes', newCode);
      setNewCode({ code: '', points: 50, max_uses: 100 });
      fetchData();
      alert('创建成功');
    } catch (err) {
      alert('创建失败: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleToggleCode = async (id, currentStatus) => {
    try {
      await request.patch(`/admin/redemption-codes/${id}?is_active=${!currentStatus}`);
      fetchData();
    } catch (err) {
      alert('操作失败');
    }
  };

  // UI Components
  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="card" style={{ 
      padding: '20px', display: 'flex', alignItems: 'center', gap: '15px',
      background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)'
    }}>
      <div style={{ 
        padding: '12px', borderRadius: '12px', background: `${color}15`, color: color
      }}>
        <Icon size={24} />
      </div>
      <div>
        <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>{title}</div>
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{value}</div>
      </div>
    </div>
  );

  return (
    <div style={{ paddingBottom: '50px' }}>
      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', gap: '10px', marginBottom: '30px', 
        background: '#f5f5f7', padding: '6px', borderRadius: '12px',
        width: 'fit-content'
      }}>
        {[
          { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
          { id: 'audit', label: '充值审核', icon: ListChecks, count: pendingLogs.length },
          { id: 'invitation', label: '邀请审计', icon: UserPlus },
          { id: 'redemption', label: '兑换码管理', icon: Gift },
          { id: 'recharge', label: '手动充值', icon: UserPlus },
          { id: 'feedback', label: '意见反馈', icon: BookOpen, count: feedbacks.length },
          { id: 'announcement', label: '公告管理', icon: Megaphone },
        ].map(tab => (
          <div 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              padding: '10px 16px', cursor: 'pointer', borderRadius: '8px',
              background: activeTab === tab.id ? '#fff' : 'transparent',
              color: activeTab === tab.id ? '#e66b33' : '#666',
              boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            <tab.icon size={16} /> {tab.label}
            {tab.count > 0 && (
              <span style={{ 
                background: '#ff4d4f', color: '#fff', fontSize: '10px', 
                padding: '1px 6px', borderRadius: '10px', marginLeft: '4px'
              }}>
                {tab.count}
              </span>
            )}
          </div>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {/* KPI Rows */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <StatCard title="总用户数" value={stats.summary.total_users} icon={Users} color="#e66b33" />
            <StatCard title="累计生图" value={stats.summary.total_images} icon={ImageIcon} color="#1890ff" />
            <StatCard title="累计营收" value={`¥${stats.summary.total_revenue}`} icon={TrendingUp} color="#52c41a" />
            <StatCard title="积分消耗" value={`${stats.summary.total_points_spent} P`} icon={Zap} color="#722ed1" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
            {/* Financial Tool */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={18} /> 财务利润对账 (估算)
                </h3>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '8px' }}>本月外部 API 总成本 (元):</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="number" 
                    value={manualCost}
                    onChange={(e) => setManualCost(Number(e.target.value))}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                    placeholder="输入账单金额..."
                  />
                </div>
              </div>
              <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px 0', color: '#666' }}>总流水 (用户充值)</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>¥{stats.summary.total_revenue}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px 0', color: '#666' }}>外部成本 (API 账单)</td>
                    <td style={{ textAlign: 'right', color: '#ff4d4f' }}>- ¥{manualCost}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '15px 0', fontWeight: 'bold' }}>预计净利润</td>
                    <td style={{ textAlign: 'right', fontSize: '18px', color: stats.summary.total_revenue - manualCost >= 0 ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
                      ¥{(stats.summary.total_revenue - manualCost).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div style={{ marginTop: '15px', padding: '10px', background: '#fffbe6', borderRadius: '8px', fontSize: '12px', color: '#856404', display: 'flex', gap: '8px' }}>
                <AlertCircle size={14} /> 提示：利润计算基于充值流水减去你输入的手动成本。
              </div>
            </div>

            {/* Style Rankings */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '20px' }}>风格流行度排行</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.styles.length > 0 ? stats.styles.map((item, index) => {
                  const maxCount = stats.styles[0].count;
                  const width = (item.count / maxCount) * 100;
                  return (
                    <div key={item.id} style={{ fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>{item.id}</span>
                        <span style={{ color: '#888' }}>{item.count} 次</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${width}%`, height: '100%', background: 'linear-gradient(90deg, #e66b33, #ff9c6e)', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  );
                }) : <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>暂无风格数据</div>}
              </div>
            </div>
          </div>

          {/* Live Feed Wall */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
              全站实时生图动态 (最新 20 条)
              <button onClick={fetchData} style={{ background: 'none', border: 'none', color: '#e66b33', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                <RefreshCw size={14} /> 刷新
              </button>
            </h3>
            <div style={{ 
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px'
            }}>
              {stats.recent_logs.map(log => (
                <div key={log.id} style={{ 
                  borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden',
                  background: '#fff', position: 'relative'
                }}>
                  {log.image_url ? (
                    <img src={log.image_url} alt="result" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '200px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '12px' }}>
                      {log.status === 'failed' ? '生成失败' : '正在生成...'}
                    </div>
                  )}
                  <div style={{ padding: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#888', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>UID: {log.user_id}</span>
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    <div style={{ 
                      fontSize: '12px', lineHeight: '1.4', color: '#333', 
                      height: '3.2em', overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                    }}>
                      {log.prompt}
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', background: '#f0f0f0', padding: '2px 8px', borderRadius: '4px' }}>{log.style}</span>
                      <button 
                        onClick={() => handleWipeImage(log.id)}
                        style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', padding: '4px' }}
                        title="彻底抹除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'recharge' && (
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
      )}

      {activeTab === 'audit' && (
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

      {activeTab === 'feedback' && (
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

      {activeTab === 'invitation' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>邀请奖励审计</h3>
            <div style={{ fontSize: '12px', color: '#888' }}>* 相同 IP 或指纹多次出现将标记为高风险</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f5f5f5', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px' }}>用户</th>
                  <th style={{ padding: '12px 8px' }}>奖励</th>
                  <th style={{ padding: '12px 8px' }}>流水号 / 说明</th>
                  <th style={{ padding: '12px 8px' }}>IP / 设备指纹</th>
                  <th style={{ padding: '12px 8px' }}>发生时间</th>
                </tr>
              </thead>
              <tbody>
                {inviteLogs.map((log, index) => {
                  const ipConflict = inviteLogs.filter(l => l.ip === log.ip && l.user_id !== log.user_id).length > 0;
                  const fpConflict = inviteLogs.filter(l => l.fingerprint === log.fingerprint && l.user_id !== log.user_id).length > 0;
                  const isRisk = ipConflict || fpConflict;

                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f5f5f5', background: isRisk ? '#fff1f0' : 'transparent' }}>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ fontWeight: 'bold' }}>{log.username}</div>
                        <div style={{ fontSize: '11px', color: '#999' }}>UID: {log.user_id}</div>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ color: log.amount > 0 ? '#52c41a' : '#666', fontWeight: 'bold' }}>
                          +{log.amount} 分
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ fontSize: '11px', color: '#666' }}>{log.trade_no}</div>
                        <div style={{ fontSize: '12px' }}>{log.admin_note}</div>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ color: ipConflict ? '#ff4d4f' : '#333', fontWeight: ipConflict ? 'bold' : 'normal' }}>
                          {log.ip} {ipConflict && '⚠️'}
                        </div>
                        <div style={{ fontSize: '10px', color: fpConflict ? '#ff4d4f' : '#999', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {log.fingerprint} {fpConflict && '⚠️'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', color: '#888' }}>
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
                {inviteLogs.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>暂无邀请记录</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'announcement' && (
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>📢 公告管理</h2>

          {/* 版本号 + 标题 */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input
              placeholder="版本号 (如 2026.05.09)"
              value={announcement.version}
              onChange={e => setAnnouncement({ ...announcement, version: e.target.value })}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
            />
            <input
              placeholder="公告标题"
              value={announcement.title}
              onChange={e => setAnnouncement({ ...announcement, title: e.target.value })}
              style={{ flex: 2, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
            />
          </div>

          {/* 更新条目 */}
          {(announcement.items || []).map((item, i) => (
            <div key={i} style={{
              background: '#f9f9fb', borderRadius: '10px', padding: '16px',
              marginBottom: '12px', border: '1px solid #eee'
            }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                <select
                  value={item.icon || 'other'}
                  onChange={e => {
                    const next = [...announcement.items];
                    next[i] = { ...next[i], icon: e.target.value };
                    setAnnouncement({ ...announcement, items: next });
                  }}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }}
                >
                  <option value="security">🔒 安全</option>
                  <option value="feature">⚡ 新功能</option>
                  <option value="bug">🐛 修复</option>
                  <option value="ui">🎨 UI</option>
                  <option value="payment">💳 支付</option>
                  <option value="performance">🚀 性能</option>
                  <option value="other">📌 其他</option>
                </select>
                <input
                  placeholder="条目标题"
                  value={item.title}
                  onChange={e => {
                    const next = [...announcement.items];
                    next[i] = { ...next[i], title: e.target.value };
                    setAnnouncement({ ...announcement, items: next });
                  }}
                  style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }}
                />
                <button
                  onClick={() => {
                    const next = announcement.items.filter((_, j) => j !== i);
                    setAnnouncement({ ...announcement, items: next });
                  }}
                  style={{
                    width: '32px', height: '32px', borderRadius: '6px',
                    border: 'none', background: '#ffebeb', color: '#ff4d4f',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <X size={14} />
                </button>
              </div>
              <textarea
                placeholder="条目内容"
                value={item.content}
                onChange={e => {
                  const next = [...announcement.items];
                  next[i] = { ...next[i], content: e.target.value };
                  setAnnouncement({ ...announcement, items: next });
                }}
                style={{
                  width: '100%', padding: '10px', borderRadius: '6px',
                  border: '1px solid #ddd', fontSize: '13px', minHeight: '60px',
                  resize: 'vertical', boxSizing: 'border-box'
                }}
              />
            </div>
          ))}

          <button
            onClick={() => {
              setAnnouncement({
                ...announcement,
                items: [...(announcement.items || []), { icon: 'feature', title: '', content: '' }]
              });
            }}
            style={{
              width: '100%', padding: '10px', borderRadius: '8px',
              border: '2px dashed #ddd', background: 'transparent',
              color: '#999', fontSize: '13px', cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            <Plus size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            添加条目
          </button>

          <button
            className="btn-primary"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              try {
                await request.post('/admin/announcement', announcement);
                setAnnounceMsg('公告已保存，60秒内全站生效');
              } catch (err) {
                setAnnounceMsg('保存失败: ' + (err.response?.data?.detail || err.message));
              }
              setLoading(false);
            }}
            style={{ width: '100%', padding: '14px', fontSize: '16px' }}
          >
            保存并发布公告
          </button>
          {announceMsg && (
            <p style={{
              textAlign: 'center', marginTop: '12px', fontSize: '13px',
              color: announceMsg.includes('失败') ? '#ff4d4f' : '#34c759'
            }}>
              {announceMsg}
            </p>
          )}
        </div>
      )}

      {activeTab === 'redemption' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3>创建新兑换码</h3>
            <form onSubmit={handleCreateCode} style={{ display: 'flex', gap: '12px', marginTop: '16px', alignItems: 'flex-end' }}>
              <div style={{ flex: 2 }}>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>代码 (建议大写)</label>
                <input
                  type="text"
                  placeholder="例如: WELCOME50"
                  value={newCode.code}
                  onChange={e => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>积分面额</label>
                <input
                  type="number"
                  value={newCode.points}
                  onChange={e => setNewCode({ ...newCode, points: parseInt(e.target.value) })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>发行总量</label>
                <input
                  type="number"
                  value={newCode.max_uses}
                  onChange={e => setNewCode({ ...newCode, max_uses: parseInt(e.target.value) })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '10px 24px', borderRadius: '8px', height: '40px' }}>
                创建代码
              </button>
            </form>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3>兑换码列表</h3>
            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f5f5f5', textAlign: 'left' }}>
                    <th style={{ padding: '12px 8px' }}>代码</th>
                    <th style={{ padding: '12px 8px' }}>积分</th>
                    <th style={{ padding: '12px 8px' }}>使用进度</th>
                    <th style={{ padding: '12px 8px' }}>状态</th>
                    <th style={{ padding: '12px 8px' }}>创建时间</th>
                    <th style={{ padding: '12px 8px' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptionCodes.map(code => (
                    <tr key={code.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{code.code}</td>
                      <td style={{ padding: '12px 8px' }}>{code.points} P</td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ fontSize: '12px', marginBottom: '4px' }}>{code.used_count} / {code.max_uses}</div>
                        <div style={{ width: '100px', height: '6px', background: '#f0f0f0', borderRadius: '3px' }}>
                          <div style={{ 
                            width: `${Math.min(100, (code.used_count / code.max_uses) * 100)}%`, 
                            height: '100%', background: '#e66b33', borderRadius: '3px' 
                          }} />
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ 
                          padding: '2px 8px', borderRadius: '10px', fontSize: '11px',
                          background: code.is_active ? '#e6f7ff' : '#f5f5f5',
                          color: code.is_active ? '#1890ff' : '#999'
                        }}>
                          {code.is_active ? '进行中' : '已关闭'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', color: '#888' }}>{new Date(code.created_at).toLocaleString()}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <button 
                          onClick={() => handleToggleCode(code.id, code.is_active)}
                          style={{ 
                            padding: '4px 12px', borderRadius: '4px', border: '1px solid #ddd', 
                            background: '#fff', fontSize: '12px', cursor: 'pointer' 
                          }}
                        >
                          {code.is_active ? '停用' : '启用'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {redemptionCodes.length === 0 && !loading && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>暂无兑换码</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
