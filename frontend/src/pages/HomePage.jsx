import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import request, { logout } from '../api/request';
import { 
  Images, 
  Coins, 
  ShieldCheck, 
  BookOpen, 
  LogOut, 
  User, 
  Sparkles, 
  Zap, 
  Palette,
  Layout,
  Diamond,
  Crown,
  Globe,
  Infinity,
  CheckCircle,
  X,
  Maximize2,
  FlaskConical,
  Video,
  ShoppingBag,
  Wand2,
  Layers,
  Monitor,
  Download,
  Edit3
} from 'lucide-react';
import Showcase from '../components/Showcase';

const HomePage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [quality, setQuality] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [numImages, setNumImages] = useState(1);
  const [previewImage, setPreviewImage] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showLab, setShowLab] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackContact, setFeedbackContact] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  
  // 用于实时日志记录的状态追踪
  const lastStatus = React.useRef(null);

  // 消息提示逻辑
  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 5000);
  };

  // 积分计算矩阵 (V1.3 激进定价)
  const [pricingMap, setPricingMap] = useState({
    'standard': 5,
    'hd': 15,
    'master': 30
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
      // 延迟一会确保 DOM 已更新后聚焦
      setTimeout(() => {
        const textarea = document.querySelector('textarea');
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        }
      }, 100);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const data = await request.get('/auth/me');
      setUserInfo(data);
    } catch (err) {}
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setProgress(0);
    setResult(null);
    
    try {
      const res = await request.post('/image/generate', { prompt, quality });
      const taskId = res.id;
      setUserInfo(prev => ({ ...prev, points: res.remaining_points }));
      
      const toastMsg = quality === 'master' 
        ? '🚀 大师版正在进行深度视觉推理，耗时较长（约 1-2 分钟），请耐心等待...' 
        : '🚀 任务已提交，AI 正在为您精心创作！';
      showToast(toastMsg, 'success');

      // 开始轮询 (Task 3.0: 真实状态驱动进度)
      let pollCount = 0;
      let internalProgress = 0;
      
      const pollTimer = setInterval(async () => {
        pollCount++;
        try {
          const statusRes = await request.get(`/image/status/${taskId}`);
          
          // 实时状态日志打印
          if (statusRes.status !== lastStatus.current) {
            console.log(`%c[任务状态] ${lastStatus.current || 'pending'} -> ${statusRes.status}`, 'color: #3b82f6; font-weight: bold;');
            lastStatus.current = statusRes.status;
          }

          // 根据后端真实状态分段映射进度
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
            
            // 重置状态追踪
            lastStatus.current = null;

            // Task: Performance Logging
            if (statusRes.timings) {
              const { queue, api, generation, storage, total } = statusRes.timings;
              console.log('%c🚀 AI 生图性能报告', 'color: #7c3aed; font-weight: bold; font-size: 14px;');
              console.log(`- 消耗积分: ${statusRes.cost_points || '--'} Points`);
              console.log(`- 内部排队: ${(queue / 1000).toFixed(2)}s`);
              console.log(`- 中转站网络: ${(api / 1000).toFixed(2)}s (API 往返)`);
              console.log(`- 系统处理: ${((generation - api) / 1000).toFixed(2)}s (本地逻辑)`);
              console.log(`- 转存 COS: ${(storage / 1000).toFixed(2)}s`);
              console.log(`- 任务总计: ${(total / 1000).toFixed(2)}s`);
              console.log('%c-------------------------', 'color: #7c3aed;');
            }
            return;
          } else if (statusRes.status === 'failed') {
            clearInterval(pollTimer);
            setProgress(0);
            setLoading(false);
            showToast(`生成失败: ${statusRes.error || '未知错误'}`, 'error');

            if (statusRes.timings) {
              console.error('❌ 生图失败性能快照:', statusRes.timings);
            }
            return;
          }

          internalProgress = targetProgress;
          setProgress(Math.floor(internalProgress));

        } catch (err) {}

        // 3分钟超时
        if (pollCount > 60) {
          clearInterval(pollTimer);
          setLoading(false);
          showToast('任务已转入后台处理，请稍后在“我的创作”中查看', 'info');
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
        showToast(detail, 'info'); // 并发限制使用提示色而非错误色
      } else {
        showToast(detail, 'error');
      }
    }
  };

  const submitFeedback = async () => {
    if (!feedbackContent) return;
    try {
      await request.post('/feedback/submit', { content: feedbackContent, contact: feedbackContact });
      showToast('感谢您的宝贵建议！我们已收到您的反馈。', 'success');
      setShowFeedback(false);
      setFeedbackContent('');
      setFeedbackContact('');
    } catch (err) {
      showToast('反馈提交失败，请稍后重试', 'error');
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
      {/* 消息提示组件 (Toast) */}
      {toast.visible && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: toast.type === 'error' ? '#fff1f0' : (toast.type === 'info' ? '#e6f7ff' : '#f6ffed'),
          border: `1px solid ${toast.type === 'error' ? '#ffa39e' : (toast.type === 'info' ? '#91d5ff' : '#b7eb8f')}`,
          padding: '12px 24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 9999,
          animation: 'slideDown 0.3s ease-out'
        }}>
          {toast.type === 'error' ? <X size={18} color="#f5222d" /> : <CheckCircle size={18} color="#52c41a" />}
          <span style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>{toast.message}</span>
          <X 
            size={14} 
            color="#999" 
            style={{ cursor: 'pointer', marginLeft: '10px' }} 
            onClick={() => setToast({ ...toast, visible: false })} 
          />
        </div>
      )}

      {/* 顶部导航栏 */}
      <header style={{ height: '70px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e66b33' }}>Visionary</div>
          <nav style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#666' }}>
            <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/history')}>
              <Images size={18} strokeWidth={1.75} /> 我的创作
            </span>
            <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/pricing')}>
              <Coins size={18} strokeWidth={1.75} /> 价格
            </span>
            {userInfo?.is_admin && (
              <span style={{ cursor: 'pointer', color: '#e66b33', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/admin')}>
                <ShieldCheck size={18} strokeWidth={1.75} /> 管理后台
              </span>
            )}
            <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/guide')}>
              <BookOpen size={18} strokeWidth={1.75} /> 使用指南
            </span>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* 积分药丸 - 高级感重塑 */}
          <div style={{ 
            background: 'rgba(230, 107, 51, 0.05)', 
            border: '1px solid rgba(230, 107, 51, 0.2)',
            padding: '6px 14px', 
            borderRadius: '20px', 
            fontSize: '14px', 
            display: 'flex', 
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600',
            color: '#e66b33'
          }}>
            <Coins size={16} strokeWidth={2.5} style={{ filter: 'drop-shadow(0 2px 4px rgba(230,107,51,0.3))' }} />
            <span>{userInfo?.points || 0}</span>
            {userInfo?.frozen_points > 0 && (
              <span style={{ color: '#999', borderLeft: '1px solid rgba(0,0,0,0.1)', paddingLeft: '8px', fontSize: '12px' }} title="生图中冻结的积分">
                🔒 {userInfo.frozen_points}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>{userInfo?.username}</span>
            <button 
              onClick={() => navigate('/profile')} 
              title="个人中心"
              style={{ 
                background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)', 
                border: 'none', 
                borderRadius: '50%', 
                width: '36px', 
                height: '36px', 
                cursor: 'pointer',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#444',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <User size={20} strokeWidth={2} />
            </button>
          </div>

          {/* 退出按钮 - 极简现代 */}
          <button 
            onClick={logout} 
            style={{ 
              background: 'transparent', 
              border: '1px solid #eee', 
              borderRadius: '8px', 
              padding: '6px 14px', 
              fontSize: '13px', 
              cursor: 'pointer',
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              color: '#666',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.borderColor = '#ddd'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#eee'; }}
          >
            <LogOut size={14} strokeWidth={2} /> 退出
          </button>
        </div>
      </header>

      {/* 主工作台 (双栏) */}
      <main style={{ display: 'grid', gridTemplateColumns: '450px 1fr', gap: '30px', marginTop: '30px' }}>
        {/* 左侧：参数调节区 */}
        <div className="card" style={{ padding: '24px', height: 'fit-content' }}>
          <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '8px', padding: '4px', marginBottom: '20px' }}>
            <button style={{ flex: 1, border: 'none', background: '#fff', padding: '8px', borderRadius: '6px', fontWeight: '600' }}>生成图片</button>
            <button style={{ flex: 1, border: 'none', background: 'transparent', padding: '8px', color: '#ccc', cursor: 'not-allowed' }}>编辑图片</button>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600' }}>
            <Sparkles size={18} strokeWidth={1.75} color="#e66b33" /> 描述您的创意
          </label>
          <textarea
            placeholder="一只可爱的橘猫坐在樱花树下..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            style={{ 
              width: '100%', height: '150px', border: '1px solid #ddd', borderRadius: '12px', 
              padding: '15px', resize: 'none', fontSize: '14px',
              opacity: loading ? 0.6 : 1, transition: 'all 0.3s'
            }}
          />

          <div style={{ marginTop: '24px', opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>创作规格 (计费档位)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                { id: 'standard', name: '标准版', pts: 5, icon: <Zap size={20} />, color: '#e66b33' },
                { id: 'hd', name: '高清版', pts: 10, icon: <Diamond size={20} />, color: '#3b82f6', desc: '1.5倍纵向视野' },
                { id: 'master', name: '大师版', pts: 15, icon: <Crown size={20} />, color: '#8b5cf6', desc: 'HD 构思 + 电影比例' }
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => setQuality(item.id)}
                  title={item.desc}
                  style={{ 
                    padding: '16px 8px', borderRadius: '12px', 
                    border: quality === item.id ? `2px solid ${item.color}` : '1px solid #eee', 
                    background: quality === item.id ? `${item.color}08` : '#fff', 
                    cursor: 'pointer', 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: quality === item.id ? `0 4px 12px ${item.color}20` : 'none',
                    transform: quality === item.id ? 'translateY(-2px)' : 'none'
                  }}
                >
                  <div style={{ 
                    color: quality === item.id ? item.color : '#999',
                    transition: 'all 0.2s'
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: quality === item.id ? '#333' : '#666' }}>{item.name}</span>
                    <span style={{ fontSize: '11px', color: '#999' }}>{item.pts} 积分/张</span>
                  </div>
                  {/* 新增：档次功能简述 */}
                  <div style={{ 
                    marginTop: '4px', 
                    fontSize: '10px', 
                    color: quality === item.id ? item.color : '#bbb',
                    textAlign: 'center',
                    lineHeight: '1.2'
                  }}>
                    {item.id === 'standard' && '快速出图 · 灵感捕捉'}
                    {item.id === 'hd' && '纵向超清 · 手机适配'}
                    {item.id === 'master' && '视觉推理 · 电影级细节'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '16px 24px', background: 'linear-gradient(to right, #fdfbfb 0%, #ebedee 100%)', borderRadius: '16px', border: '1px dashed #e66b33', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(230,107,51,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', color: '#666' }}>本次消耗预估：</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Coins size={20} color="#e66b33" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 2px 4px rgba(230,107,51,0.3))' }} />
              <span style={{ fontSize: '24px', fontWeight: '800', color: '#e66b33' }}>{pricingMap[quality]}</span>
              <span style={{ color: '#e66b33', fontWeight: '600', fontSize: '16px', marginLeft: '2px' }}>积分</span>
            </div>
          </div>
            {quality === 'standard' && (
              <div style={{ fontSize: '11px', color: '#666', marginTop: '6px' }}>
                ⚡️ 极速通道：预估 50 秒内出图
              </div>
            )}
            {quality === 'hd' && (
              <div style={{ fontSize: '11px', color: '#3b82f6', marginTop: '6px', fontWeight: '500' }}>
                🧪 测试期：高清渲染耗时较长，视任务复杂度而定
              </div>
            )}
            {quality === 'master' && (
              <div style={{ fontSize: '11px', color: '#8b5cf6', marginTop: '6px', fontWeight: '500' }}>
                🧪 测试期：大师级深度构思，渲染时间较长，请耐心等待
              </div>
            )}

          <button 
            className={`btn-primary ${loading ? 'loading-pulse' : ''}`} 
            onClick={handleGenerate} 
            disabled={loading || !prompt.trim()}
            style={{ 
              width: '100%', marginTop: '30px', height: '50px', 
              background: loading ? '#f3a481' : '#e66b33',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            {loading ? (
              '🚀 正在创作中...'
            ) : (
              <>
                <Zap size={18} strokeWidth={1.75} fill="currentColor" /> 生成图片
              </>
            )}
          </button>
        </div>

        {/* 右侧：结果展示区 */}
        <div className="card" style={{ 
          padding: '24px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '400px', 
          maxHeight: '750px',
          background: '#fbfbfb', 
          position: 'relative', 
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '100px', height: '100px', borderRadius: '50%', 
                border: '4px solid #f3f3f3', borderTop: '4px solid #e66b33',
                animation: 'spin 1s linear infinite', margin: '0 auto 20px'
              }}></div>
              <div style={{ color: '#333', fontSize: '18px', fontWeight: 'bold' }}>正在捕获灵感... {progress}%</div>
              <div style={{ color: '#999', fontSize: '14px', marginTop: '8px' }}>AI 正在为您精心渲染每一处细节</div>
              
              {/* 进度条底槽 */}
              <div style={{ width: '200px', height: '6px', background: '#eee', borderRadius: '3px', margin: '20px auto', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #e66b33, #f3a481)', transition: 'width 0.5s ease' }}></div>
              </div>
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .loading-pulse { animation: pulse 1.5s infinite; }
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
              `}} />
            </div>
          ) : result ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img 
                src={result} 
                alt="Result" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '550px',
                  objectFit: 'contain',
                  borderRadius: '16px', 
                  boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                  border: '1px solid rgba(0,0,0,0.05)'
                }} 
              />
              <div style={{ display: 'flex', gap: '15px', marginTop: '24px', width: '100%', maxWidth: '500px' }}>
                <button 
                  className="btn-primary" 
                  style={{ 
                    flex: 1, 
                    background: '#fafafa', 
                    color: '#ccc', 
                    border: '1px solid #eee',
                    boxShadow: 'none',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'not-allowed'
                  }}
                >
                  <Edit3 size={18} strokeWidth={2} /> 继续编辑
                </button>
                <a 
                  href={result} 
                  download 
                  className="btn-primary" 
                  style={{ 
                    flex: 1, 
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    background: 'linear-gradient(135deg, #e66b33 0%, #f3a481 100%)',
                    boxShadow: '0 4px 12px rgba(230,107,51,0.25)'
                  }}
                >
                  <Download size={18} strokeWidth={2} /> 高清下载
                </a>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#ccc' }}>
              <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                <Palette size={64} strokeWidth={1.5} color="#eee" />
              </div>
              <p>在左侧输入创意，开始您的艺术之旅</p>
            </div>
          )}
        </div>
      </main>

      {/* 落地页模块：核心优势 + 深度画廊 */}
      <Showcase setPreviewImage={setPreviewImage} />

      {/* 图片预览 Modal */}
      {previewImage && (
        <div 
          style={{ 
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out'
          }}
          onClick={() => setPreviewImage(null)}
        >
          <button style={{ position: 'absolute', top: '30px', right: '30px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={32} />
          </button>
          <img 
            src={previewImage} 
            style={{ maxHeight: '90vh', maxWidth: '95vw', borderRadius: '12px', boxShadow: '0 0 50px rgba(0,0,0,0.5)', objectFit: 'contain' }} 
            alt="Preview" 
          />
        </div>
      )}
      {/* 意见反馈悬浮按钮 */}
      <button
        onClick={() => setShowLab(true)}
        title="Visionary 实验室"
        style={{
          position: 'fixed',
          right: '30px',
          bottom: '30px',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          background: 'linear-gradient(135deg, #e66b33 0%, #f3a481 100%)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(230,107,51,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          transition: 'all 0.3s'
        }}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(230,107,51,0.5)'; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1) rotate(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(230,107,51,0.4)'; }}
      >
        <FlaskConical size={24} />
      </button>

      {/* Visionary 实验室弹窗 */}
      {showLab && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div className="card" style={{ 
            width: '600px', 
            padding: '40px', 
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: '#fff',
            borderRadius: '24px'
          }}>
            <button 
              onClick={() => setShowLab(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#999' }}
            >
              <X size={24} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ display: 'inline-block', background: '#e66b3315', color: '#e66b33', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>
                Future Sight · 实验室
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '10px' }}>Visionary 进化路线图</h2>
              <p style={{ color: '#888', fontSize: '14px' }}>这些令人兴奋的功能正在实验室中秘密研发中...</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
              {[
                { title: '文生视频', desc: '让静止的灵感律动起来', icon: <Video size={20} />, color: '#8b5cf6', tag: '即将上线' },
                { title: '电商产品图', desc: '一键生成商业场景大片', icon: <ShoppingBag size={20} />, color: '#f59e0b', tag: '灰度测试' },
                { title: '图生图', desc: '以图绘图，无限风格延展', icon: <Wand2 size={20} />, color: '#3b82f6', tag: '研发中' },
                { title: '8K 超清', desc: '无损放大，突破画质极限', icon: <Monitor size={20} />, color: '#10b981', tag: '即将上线' },
                { title: '提示词实验室', desc: '大师级灵感词库集成', icon: <Sparkles size={20} />, color: '#ec4899', tag: '研发中' },
                { title: '智能工作流', desc: '自动去底与后期处理', icon: <Layers size={20} />, color: '#6366f1', tag: '规划中' }
              ].map((item, idx) => (
                <div key={idx} style={{ 
                  padding: '20px', 
                  borderRadius: '16px', 
                  border: '1px solid #f0f0f0', 
                  background: '#fcfcfc',
                  transition: 'all 0.2s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ width: '36px', height: '36px', background: `${item.color}15`, color: item.color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.icon}
                    </div>
                    <span style={{ fontSize: '10px', background: `${item.color}10`, color: item.color, padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>{item.tag}</span>
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>{item.title}</h4>
                  <p style={{ fontSize: '12px', color: '#999' }}>{item.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px dashed #eee', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>您的每一个建议都在决定 Visionary 的进化方向</p>
              <button 
                onClick={() => { setShowLab(false); setShowFeedback(true); }}
                style={{ 
                  background: 'transparent', border: '1px solid #e66b33', color: '#e66b33', 
                  padding: '8px 24px', borderRadius: '10px', fontSize: '14px', cursor: 'pointer',
                  fontWeight: '600', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#e66b3305'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                提交功能建议
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 意见反馈弹窗 */}
      {showFeedback && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div className="card" style={{ width: '400px', padding: '30px', position: 'relative' }}>
            <button 
              onClick={() => setShowFeedback(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#999' }}
            >
              <X size={20} />
            </button>
            
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>意见反馈</h2>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>您的每一个建议都是我们进步的动力</p>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>反馈内容 <span style={{ color: '#ff4d4f' }}>*</span></label>
              <textarea 
                placeholder="请详细描述您遇到的问题或建议..."
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                style={{ width: '100%', height: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', resize: 'none' }}
              />
            </div>
            
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>联系方式 (可选)</label>
              <input 
                type="text" 
                placeholder="微信 / 邮箱 / 手机号"
                value={feedbackContact}
                onChange={(e) => setFeedbackContact(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
              />
            </div>
            
            <button 
              onClick={submitFeedback}
              disabled={!feedbackContent}
              style={{
                width: '100%',
                padding: '12px',
                background: feedbackContent ? '#e66b33' : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: feedbackContent ? 'pointer' : 'not-allowed',
                boxShadow: feedbackContent ? '0 4px 15px rgba(230,107,51,0.2)' : 'none'
              }}
            >
              提交反馈
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
