import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import request, { logout } from '../api/request';
import { 
  Images, Coins, User, Sparkles, Zap, Diamond, Crown, CheckCircle, X, Download, Home, Send, Wand2, ArrowUpCircle
} from 'lucide-react';

const MobileHomePage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [quality, setQuality] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [activeTab, setActiveTab] = useState('home');

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const [pricingMap, setPricingMap] = useState({
    'standard': 5,
    'hd': 10,
    'master': 15
  });

  useEffect(() => {
    fetchUserInfo();
    fetchConfig();
    checkPendingPrompt();
  }, []);

  const fetchConfig = async () => {
    try {
      const data = await request.get('/image/config');
      if (data.pricing) setPricingMap(data.pricing);
    } catch (err) {}
  };

  const checkPendingPrompt = () => {
    const pending = sessionStorage.getItem('pending_prompt');
    if (pending) {
      setPrompt(pending);
      sessionStorage.removeItem('pending_prompt');
    }
  };

  const fetchUserInfo = async () => {
    try {
      const data = await request.get('/auth/me');
      setUserInfo(data);
    } catch (err) {}
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setProgress(0);
    setResult(null);
    
    try {
      const res = await request.post('/image/generate', { prompt, quality });
      const taskId = res.id;
      setUserInfo(prev => ({ ...prev, points: res.remaining_points }));
      
      const toastMsg = quality === 'master' 
        ? '大师版渲染较长，请耐心等待...' 
        : '任务已提交，AI 正在创作！';
      showToast(toastMsg, 'success');

      let pollCount = 0;
      let internalProgress = 0;
      
      const pollTimer = setInterval(async () => {
        pollCount++;
        try {
          const statusRes = await request.get(`/image/status/${taskId}`);
          
          let targetProgress = internalProgress;
          if (statusRes.status === 'pending') {
            targetProgress = Math.min(internalProgress + 2, 20);
          } else if (statusRes.status === 'generating') {
            targetProgress = Math.min(internalProgress + 10, 80);
            if (internalProgress < 20) targetProgress = 20;
          } else if (statusRes.status === 'storing') {
            targetProgress = Math.min(internalProgress + 5, 99);
            if (internalProgress < 80) targetProgress = 80;
          } else if (statusRes.status === 'success') {
            clearInterval(pollTimer);
            setProgress(100);
            setResult(statusRes.image_url);
            setLoading(false);
            return;
          } else if (statusRes.status === 'failed') {
            clearInterval(pollTimer);
            setProgress(0);
            setLoading(false);
            showToast(`生成失败: ${statusRes.error || '未知错误'}`, 'error');
            return;
          }

          internalProgress = targetProgress;
          setProgress(Math.floor(internalProgress));

        } catch (err) {}

        if (pollCount > 60) {
          clearInterval(pollTimer);
          setLoading(false);
          showToast('任务已转入后台，请稍后查看', 'info');
        }
      }, 3000);

    } catch (err) {
      setProgress(0);
      setLoading(false);
      const detail = err.response?.data?.detail || '提交失败，请重试';
      const status = err.response?.status;
      
      if (status === 403) {
        if (window.confirm(`${detail}\n\n是否前往充值页面？`)) {
          navigate('/pricing');
        }
      } else if (status === 429) {
        showToast(detail, 'info');
      } else {
        showToast(detail, 'error');
      }
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'history') navigate('/history');
    if (tab === 'pricing') navigate('/pricing');
    if (tab === 'profile') navigate('/profile');
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      width: '100%',
      background: '#f8f9fa',
      overflow: 'hidden'
    }}>
      {/* Toast 提示 */}
      {toast.visible && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'error' ? '#fff1f0' : (toast.type === 'info' ? '#e6f7ff' : '#f6ffed'),
          border: `1px solid ${toast.type === 'error' ? '#ffa39e' : (toast.type === 'info' ? '#91d5ff' : '#b7eb8f')}`,
          padding: '10px 20px', borderRadius: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: '8px', zIndex: 9999,
          animation: 'slideDown 0.3s ease-out', whiteSpace: 'nowrap', maxWidth: '90%'
        }}>
          {toast.type === 'error' ? <X size={16} color="#f5222d" /> : <CheckCircle size={16} color="#52c41a" />}
          <span style={{ fontSize: '13px', color: '#333' }}>{toast.message}</span>
        </div>
      )}

      {/* 顶部栏 */}
      <header style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '16px 20px', background: '#f8f9fa',
        zIndex: 10
      }}>
        <div style={{ fontSize: '20px', fontWeight: '800', color: '#e66b33' }}>Visionary</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            background: '#fff', padding: '4px 12px', borderRadius: '20px', 
            fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
            color: '#e66b33', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <Coins size={14} />
            {userInfo?.points || 0}
          </div>
          <div 
            onClick={() => navigate('/profile')}
            style={{ 
              width: '32px', height: '32px', borderRadius: '50%', background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <User size={18} />
          </div>
        </div>
      </header>

      {/* 主要内容区 (可滚动) */}
      <main style={{ 
        flex: 1, overflowY: 'auto', padding: '20px', 
        paddingBottom: '140px', // 给底部的聊天输入框留出足够的空间
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        
        {/* 如果正在生成或者已经有结果了，展示图片区并隐藏规格选择 */}
        {(loading || result) ? (
          <div style={{ 
            width: '100%', background: '#fff', borderRadius: '24px', padding: '20px', 
            boxShadow: '0 8px 30px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', minHeight: '60vh', justifyContent: 'center',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                  width: '60px', height: '60px', borderRadius: '50%', 
                  border: '3px solid #f3f3f3', borderTop: '3px solid #e66b33',
                  animation: 'spin 1s linear infinite', marginBottom: '24px'
                }}></div>
                <div style={{ color: '#333', fontWeight: 'bold', fontSize: '18px' }}>正在为您绘制... {progress}%</div>
                <div style={{ width: '200px', height: '6px', background: '#f0f0f0', borderRadius: '3px', marginTop: '20px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #e66b33, #f3a481)', transition: 'width 0.3s ease-out' }}></div>
                </div>
              </div>
            ) : result ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.1)' }}>
                  <img src={result} alt="Result" style={{ width: '100%', display: 'block' }} />
                </div>
                <div style={{ display: 'flex', gap: '15px', width: '100%', marginTop: '24px' }}>
                  <a 
                    href={result} 
                    download 
                    style={{ 
                      flex: 1, padding: '14px', borderRadius: '14px',
                      background: '#f5f6f8', color: '#333', textAlign: 'center',
                      textDecoration: 'none', fontWeight: 'bold', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    <Download size={18} /> 保存大图
                  </a>
                  <button 
                    onClick={() => { setResult(null); setPrompt(''); }}
                    style={{ 
                      flex: 1, padding: '14px', borderRadius: '14px',
                      background: '#fff2eb', color: '#e66b33', border: 'none',
                      fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    <Sparkles size={18} /> 创作一张新图
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          /* 初始状态：展示规格选择和欢迎语 */
          <div style={{ width: '100%', marginTop: '10vh', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
                Hi, 欢迎回来
              </div>
              <div style={{ color: '#888', fontSize: '15px' }}>
                随时随地，将您的奇思妙想化为视觉杰作
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
              <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '20px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wand2 size={18} color="#e66b33" /> 选择模型画质
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {[
                  { id: 'standard', name: '标准版', pts: pricingMap['standard'] || 5, icon: <Zap size={22} />, color: '#e66b33', desc: '快速出图·灵感捕捉' },
                  { id: 'hd', name: '高清版', pts: pricingMap['hd'] || 10, icon: <Diamond size={22} />, color: '#3b82f6', desc: '纵向超清·质感升级' },
                  { id: 'master', name: '大师版', pts: pricingMap['master'] || 15, icon: <Crown size={22} />, color: '#8b5cf6', desc: '视觉推理·电影级细节' }
                ].map(item => (
                  <div 
                    key={item.id}
                    onClick={() => setQuality(item.id)}
                    style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '18px 20px', borderRadius: '18px',
                      border: quality === item.id ? `2px solid ${item.color}` : '2px solid transparent',
                      background: quality === item.id ? `${item.color}0a` : '#f8f9fa',
                      transition: 'all 0.2s ease', cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ color: quality === item.id ? item.color : '#999', background: '#fff', padding: '10px', borderRadius: '50%', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>{item.icon}</div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: quality === item.id ? '#333' : '#666' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{item.desc}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: '800', color: quality === item.id ? item.color : '#999', fontSize: '15px' }}>
                      {item.pts} 积分
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 底部悬浮输入区 (元宝风格) */}
      <div style={{
        position: 'fixed', bottom: '70px', left: 0, right: 0,
        background: '#fff', padding: '12px 16px',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.05)',
        zIndex: 50, borderTopLeftRadius: '24px', borderTopRightRadius: '24px'
      }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '12px', 
          background: '#f4f5f7', borderRadius: '24px', padding: '8px 12px 8px 20px',
          border: '1px solid #eee'
        }}>
          <textarea
            placeholder="和 AI 描述你的画面创意..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            style={{ 
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              resize: 'none', maxHeight: '100px', minHeight: '40px', fontSize: '15px', color: '#333',
              lineHeight: '1.5', paddingTop: '10px', paddingBottom: '10px'
            }}
            rows={Math.min(prompt.split('\n').length, 4)}
          />
          <button 
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            style={{
              background: (loading || !prompt.trim()) ? '#e0e0e0' : 'linear-gradient(135deg, #e66b33 0%, #f3a481 100%)',
              color: '#fff', border: 'none', borderRadius: '50%',
              width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.2s', boxShadow: (!loading && prompt.trim()) ? '0 4px 12px rgba(230,107,51,0.3)' : 'none'
            }}
          >
            <ArrowUpCircle size={26} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
};

export default MobileHomePage;
