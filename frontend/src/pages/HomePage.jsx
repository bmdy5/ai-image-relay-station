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
  Maximize2
} from 'lucide-react';

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

  // 积分计算矩阵 (V1.3 激进定价)
  const PRICING_MAP = {
    'standard': 5,
    'hd': 10,
    'master': 15
  };

  useEffect(() => {
    fetchUserInfo();
    checkPendingPrompt();
  }, []);

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
      
      alert('🚀 任务已提交，AI 正在为您精心创作！\n\n您可以留在本页等待结果，也可以前往“我的创作”查看进度。');

      // 开始轮询 (Task 3.0: 真实状态驱动进度)
      let pollCount = 0;
      let internalProgress = 0;
      
      const pollTimer = setInterval(async () => {
        pollCount++;
        try {
          const statusRes = await request.get(`/image/status/${taskId}`);
          
          // 根据后端真实状态分段映射进度
          let targetProgress = internalProgress;
          if (statusRes.status === 'pending') {
            targetProgress = Math.min(internalProgress + 2, 20);
          } else if (statusRes.status === 'generating') {
            targetProgress = Math.min(internalProgress + 1, 80);
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
            alert(`生成失败: ${statusRes.error || '未知错误'}`);
            return;
          }

          internalProgress = targetProgress;
          setProgress(Math.floor(internalProgress));

        } catch (err) {}

        // 3分钟超时
        if (pollCount > 60) {
          clearInterval(pollTimer);
          setLoading(false);
          alert('任务已转入后台处理，请稍后在“我的创作”中查看');
        }
      }, 3000);

    } catch (err) {
      setProgress(0);
      setLoading(false);
      const detail = err.response?.data?.detail || '提交失败，请重试';
      if (err.response?.status === 403) {
        if (window.confirm(`${detail}\n\n是否前往充值页面？`)) {
          navigate('/pricing');
        }
      } else {
        alert(detail);
      }
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
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

          {/* 用户头像 - 动态效果 */}
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
            <button style={{ flex: 1, border: 'none', background: 'transparent', padding: '8px', color: '#666' }}>编辑图片</button>
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
                { id: 'hd', name: '高清版', pts: 10, icon: <Diamond size={20} />, color: '#3b82f6' },
                { id: 'master', name: '大师版', pts: 15, icon: <Crown size={20} />, color: '#8b5cf6' }
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => setQuality(item.id)}
                  style={{ 
                    padding: '16px 8px', borderRadius: '12px', 
                    border: quality === item.id ? `2px solid ${item.color}` : '1px solid #eee', 
                    background: quality === item.id ? `${item.color}08` : '#fff', 
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
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
              <span style={{ fontSize: '24px', fontWeight: '800', color: '#e66b33' }}>{PRICING_MAP[quality]}</span>
              <span style={{ color: '#e66b33', fontWeight: '600', fontSize: '16px', marginLeft: '2px' }}>积分</span>
            </div>
          </div>
            {quality === 'master' && (
              <div style={{ fontSize: '11px', color: '#f3a481', marginTop: '6px' }}>
                ✨ 包含 Vivid 色彩增强与高密度细节处理
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
          minHeight: '600px', 
          maxHeight: 'calc(100vh - 140px)',
          background: '#fbfbfb', 
          position: 'relative', 
          overflowY: 'auto'
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
                  maxHeight: 'calc(100vh - 280px)',
                  objectFit: 'contain',
                  borderRadius: '12px', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)' 
                }} 
              />
              <div style={{ display: 'flex', gap: '15px', marginTop: '20px', width: '100%' }}>
                <button className="btn-primary" style={{ flex: 1, background: '#333', whiteSpace: 'nowrap' }}>🚀 继续编辑</button>
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
                    textDecoration: 'none'
                  }}
                >
                  📥 高清下载
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
      <section style={{ marginTop: '100px', paddingBottom: '100px' }}>
        
        {/* PART 1: 核心优势 (解决痛点) */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-block', background: '#e66b3310', color: '#e66b33', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', marginBottom: '15px' }}>
            GPT Image V2 · 重新定义 AI 创作
          </div>
          <h1 style={{ fontSize: '36px', marginBottom: '15px', fontWeight: '800' }}>为什么选择 Visionary？</h1>
          <p style={{ color: '#666', maxWidth: '700px', margin: '0 auto', fontSize: '16px' }}>
            我们打破了官方繁琐的限制，为您提供最丝滑、最纯粹的云端创作体验。
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '0 auto', marginBottom: '120px' }}>
          {[
            { title: "自由计费 (Pay-as-you-go)", desc: "拒绝强制包月费。0 月费门槛，按需充值，每一分钱都用在刀刃上。", icon: <Coins size={24} />, color: "#e66b33" },
            { title: "告别翻墙 (VPN Free)", desc: "无需昂贵的加速器。国内丝滑直连，随时随地开启您的创意灵感。", icon: <Globe size={24} />, color: "#3b82f6" },
            { title: "无限制创作 (No Limits)", desc: "这里没有低配限制。只要有积分，灵感永不断电，支持超长绘图任务。", icon: <Infinity size={24} />, color: "#8b5cf6" },
            { title: "零风控门槛 (Zero Risk)", desc: "告别繁琐的国外地址和封号风险。一键登录，立刻享受顶尖画质。", icon: <ShieldCheck size={24} />, color: "#10b981" }
          ].map((item, idx) => (
            <div key={idx} className="card" style={{ padding: '30px', transition: 'all 0.3s', border: '1px solid #f0f0f0', background: '#fff' }}>
              <div style={{ width: '48px', height: '48px', background: `${item.color}10`, color: item.color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>{item.title}</h3>
              <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.6' }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* PART 2: 能力故事画廊 (见证奇迹) */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div style={{ display: 'inline-block', background: '#e66b3310', color: '#e66b33', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', marginBottom: '15px' }}>
            作品画廊 · 灵感触手可及
          </div>
          <h1 style={{ fontSize: '42px', marginBottom: '15px', fontWeight: '800', background: 'linear-gradient(90deg, #333, #666)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>见证 GPT Image V2 的无限可能</h1>
          <p style={{ color: '#888', maxWidth: '600px', margin: '0 auto', fontSize: '18px' }}>
            从复杂攻略到严谨科普，每一张画作都是 AI 深度理解与艺术表达的完美结晶。
          </p>
        </div>

        {/* 故事书 Section 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '60px', alignItems: 'center', marginBottom: '120px' }}>
          <div style={{ paddingRight: '40px' }}>
            <div style={{ color: '#e66b33', fontWeight: 'bold', marginBottom: '10px', fontSize: '14px', letterSpacing: '2px' }}>CASE 01</div>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>复杂长图排版能力</h2>
            <p style={{ color: '#666', lineHeight: '1.8', fontSize: '16px', marginBottom: '25px' }}>
              支持超长纵向画布输出，精准处理数千字的逻辑排版。无论是旅游攻略、购物清单还是工作流设计，都能做到字体清晰、布局优雅。
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['高清输出', '文字精准', '逻辑理解'].map(tag => (
                <span key={tag} style={{ background: '#f5f5f5', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', color: '#666' }}># {tag}</span>
              ))}
            </div>
          </div>
          <div 
            style={{ cursor: 'zoom-in', position: 'relative' }} 
            onClick={() => setPreviewImage('/showcase/2.png')}
          >
            <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '50%', zIndex: 1 }}>
              <Maximize2 size={20} color="#e66b33" />
            </div>
            <img src="/showcase/2.png" style={{ width: '100%', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} alt="苏州旅游攻略" />
          </div>
        </div>

        {/* 故事书 Section 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px', alignItems: 'center', marginBottom: '120px' }}>
          <div 
            style={{ cursor: 'zoom-in', position: 'relative' }} 
            onClick={() => setPreviewImage('/showcase/3.png')}
          >
            <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '50%', zIndex: 1 }}>
              <Maximize2 size={20} color="#e66b33" />
            </div>
            <img src="/showcase/3.png" style={{ width: '100%', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} alt="大语言模型科普" />
          </div>
          <div style={{ paddingLeft: '40px' }}>
            <div style={{ color: '#3b82f6', fontWeight: 'bold', marginBottom: '10px', fontSize: '14px', letterSpacing: '2px' }}>CASE 02</div>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>知识图谱海报生成</h2>
            <p style={{ color: '#666', lineHeight: '1.8', fontSize: '16px', marginBottom: '25px' }}>
              GPT Image V2 能够深度理解深奥的科学概念，并将其转化为极具亲和力的视觉语言。科普教育不再枯燥，每一处插画都精准契合知识点。
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['科普海报', '色彩柔和', '信息可视化'].map(tag => (
                <span key={tag} style={{ background: '#f5f5f5', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', color: '#666' }}># {tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* 故事书 Section 3: 凡人修仙传 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '60px', alignItems: 'center', marginBottom: '120px' }}>
          <div>
            <div style={{ color: '#8b5cf6', fontWeight: 'bold', marginBottom: '10px', fontSize: '14px', letterSpacing: '2px' }}>CASE 03: 电影级排版</div>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>中文字体与海报设计</h2>
            <p style={{ color: '#666', lineHeight: '1.8', fontSize: '16px', marginBottom: '25px' }}>
              攻克了 AI 绘图领域最难的中文字体精准排版。无论是武侠仙侠、科幻电影还是品牌商业海报，都能实现极具震撼力的标题呈现与意境融合。
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <span style={{ background: '#f5f5f5', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', color: '#666' }}># 仙侠风格</span>
              <span style={{ background: '#f5f5f5', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', color: '#666' }}># 精准中文字体</span>
            </div>
          </div>
          <div style={{ cursor: 'zoom-in', position: 'relative' }} onClick={() => setPreviewImage('/showcase/image.png')}>
            <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '50%', zIndex: 1 }}>
              <Maximize2 size={20} color="#e66b33" />
            </div>
            <img src="/showcase/image.png" style={{ width: '100%', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} alt="凡人修仙传海报" />
          </div>
        </div>

        {/* 故事书 Section 4: 极致细节 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px', alignItems: 'center', marginBottom: '120px' }}>
          <div style={{ cursor: 'zoom-in', position: 'relative' }} onClick={() => setPreviewImage('/showcase/1.png')}>
            <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '50%', zIndex: 1 }}>
              <Maximize2 size={20} color="#e66b33" />
            </div>
            <img src="/showcase/1.png" style={{ width: '100%', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} alt="细节展示" />
          </div>
          <div style={{ paddingLeft: '40px' }}>
            <div style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '10px', fontSize: '14px', letterSpacing: '2px' }}>CASE 04: 像素级精细</div>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>极致的光影细节</h2>
            <p style={{ color: '#666', lineHeight: '1.8', fontSize: '16px', marginBottom: '25px' }}>
              模型能在像素级维度进行细腻打磨。每一根线条、每一处反光都经得起无限放大，让您的创意灵感以最高品质完美呈现。
            </p>
            <button className="btn-primary" style={{ width: '200px', height: '50px' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              立即开启创作
            </button>
          </div>
        </div>
      </section>

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
    </div>
  );
};

export default HomePage;
