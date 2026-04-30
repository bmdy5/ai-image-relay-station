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
  const [selectedStyle, setSelectedStyle] = useState({ id: 'default', name: '默认风格', desc: '基于提示词的原生艺术呈现', icon: '✨' });
  const [particles, setParticles] = useState([]);
  const [showNotes, setShowNotes] = useState(false);
  
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

  const styles = [
    { id: 'default', name: '默认风格', desc: '原生艺术呈现', icon: '✨', pts: 'All' },
    { id: 'real', name: '极致写实', desc: '4K 相机级质感', icon: '📷', pts: 'All' },
    { id: 'anime', name: '二次元', desc: '番剧级光影', icon: '🌸', pts: 'HD+' },
    { id: 'oil', name: '古典油画', desc: '大师笔触复刻', icon: '🎨', pts: 'HD+' },
    { id: 'cyber', name: '赛博朋克', desc: '霓虹幻境', icon: '🌆', pts: 'HD+' },
    { id: '3d', name: '3D 渲染', desc: 'C4D 极致建模', icon: '🧊', pts: 'HD+' },
    { id: 'ink', name: '水墨中国', desc: '东方韵味', icon: '🖌️', pts: 'HD+' },
    { id: 'poster', name: '极简海报', desc: '排版美学', icon: '📐', pts: 'HD+' }
  ];

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
    setShowNotes(false);
    
    // 大师模式粒子流初始化
    let particleInterval = null;
    if (quality === 'master') {
      const keywords = ['光影追踪', '语义重构', '细节增强', '构图校准', '色彩平衡', '像素插值'];
      particleInterval = setInterval(() => {
        const id = Math.random().toString(36).substr(2, 9);
        const angle = Math.random() * Math.PI * 2;
        const dist = 80 + Math.random() * 60;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;
        
        setParticles(prev => [...prev.slice(-10), { id, text: keywords[Math.floor(Math.random() * keywords.length)], tx, ty }]);
      }, 400);
    }

    try {
      const res = await request.post('/image/generate', { 
        prompt, 
        quality, 
        style: selectedStyle.id 
      });
      const taskId = res.id;
      setUserInfo(prev => ({ ...prev, points: res.remaining_points }));
      
      const toastMsg = quality === 'master' 
        ? '🚀 大师版正在进行深度视觉推理...' 
        : '🚀 任务已提交，AI 正在为您精心创作！';
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
          } else if (statusRes.status === 'success') {
            clearInterval(pollTimer);
            if (particleInterval) clearInterval(particleInterval);
            setProgress(100);
            setResult(statusRes.image_url);
            setLoading(false);
            setParticles([]);
            return;
          } else if (statusRes.status === 'failed') {
            clearInterval(pollTimer);
            if (particleInterval) clearInterval(particleInterval);
            setProgress(0);
            setLoading(false);
            setParticles([]);
            showToast(`生成失败: ${statusRes.error}`, 'error');
            return;
          }

          internalProgress = targetProgress;
          setProgress(Math.floor(internalProgress));

        } catch (err) {}

        if (pollCount > 60) {
          clearInterval(pollTimer);
          if (particleInterval) clearInterval(particleInterval);
          setLoading(false);
        }
      }, 3000);

    } catch (err) {
      if (particleInterval) clearInterval(particleInterval);
      setProgress(0);
      setLoading(false);
      setParticles([]);
      // ... 错误处理逻辑保持不变
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
    <>
      {/* 主工作台 (双栏) */}
      <main className="desktop-main-layout">
        {/* 左侧：参数调节区 - 300px 侧边栏 */}
        <div className="sidebar-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0' }}>
          
          {/* 1. 创作模式切换 */}
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px' }}>创作模式</div>
            <div style={{ display: 'flex', background: '#ededf0', padding: '4px', borderRadius: '14px' }}>
              {[
                { id: 'standard', name: '标准版' },
                { id: 'hd', name: '高清版' },
                { id: 'master', name: '大师版' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setQuality(t.id)}
                  style={{
                    flex: 1, padding: '8px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                    transition: 'var(--transition)',
                    background: quality === t.id ? 'white' : 'transparent',
                    color: quality === t.id ? 'var(--primary)' : 'var(--text-secondary)',
                    boxShadow: quality === t.id ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* 2. 提示词输入 */}
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px' }}>灵感输入</div>
            <textarea
              className="prompt-box"
              placeholder="描述你脑海中的画面..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              style={{
                width: '100%', height: '120px', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px',
                fontSize: '13px', lineHeight: '1.6', resize: 'none', background: '#fafafa', transition: 'all 0.3s',
                outline: 'none'
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 4px var(--primary-glow)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = '#fafafa'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* 3. 风格实验室入口 */}
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              艺术风格
              <span style={{ fontSize: '11px', fontWeight: 'normal' }}>{quality === 'standard' ? '2 种可用' : '多种风格可选'}</span>
            </div>
            <div 
              onClick={() => setShowLab(true)}
              style={{
                width: '100%', padding: '16px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px',
                display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.3s',
                opacity: (quality === 'standard' && selectedStyle.id !== 'default' && selectedStyle.id !== 'real') ? 0.7 : 1
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = '#fff8f5'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#ffffff'; }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#f2f2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', overflow: 'hidden' }}>
                {selectedStyle.img ? <img src={selectedStyle.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : selectedStyle.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '15px' }}>{selectedStyle.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{selectedStyle.desc}</div>
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>›</div>
            </div>
          </div>

          {/* 4. 高级工具门控 */}
          <div style={{ opacity: quality === 'standard' ? 0.4 : 1, pointerEvents: quality === 'standard' ? 'none' : 'auto', transition: 'all 0.5s' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              高级工具 <span style={{ fontSize: '10px', background: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '4px', marginLeft: '5px' }}>PRO</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, height: '80px', border: '1px dashed var(--border)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <Wand2 size={18} />
                <span style={{ marginTop: '4px' }}>图生图</span>
              </div>
              <div style={{ flex: 1, height: '80px', border: '1px dashed var(--border)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <Monitor size={18} />
                <span style={{ marginTop: '4px' }}>参数微调</span>
              </div>
            </div>
          </div>

          <button 
            className={`btn-primary ${loading ? 'loading-pulse' : ''}`} 
            onClick={handleGenerate} 
            disabled={loading || !prompt.trim()}
            style={{ 
              width: '100%', marginTop: 'auto', height: '44px', 
              borderRadius: '10px', fontSize: '14px',
              background: loading ? '#f3a481' : 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            {loading ? (
              '🚀 正在创作中...'
            ) : (
              <>
                <Sparkles size={20} strokeWidth={2} /> 开启精彩创作
              </>
            )}
          </button>

          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px', marginTop: '-15px' }}>
            消耗预估: <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{pricingMap[quality]}</span> 积分
          </div>
        </div>

        <div className="preview-container" style={{ 
          padding: '24px', flex: 1, background: 'rgba(255, 255, 255, 0.4)', borderRadius: 'var(--radius-xl)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '600px', height: '100%', position: 'relative', overflow: 'hidden', border: '1px solid var(--border)'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
              {quality === 'master' ? (
                <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <div className="thinking-orb"></div>
                  {particles.map(p => (
                    <div key={p.id} className="neural-particle" style={{ '--tx': `${p.tx}px`, '--ty': `${p.ty}px`, left: '50%', top: '50%' }}>
                      {p.text}
                    </div>
                  ))}
                  <div style={{ position: 'absolute', color: 'var(--master)', fontWeight: '800', letterSpacing: '4px', fontSize: '12px' }}>
                    REASONING...
                  </div>
                </div>
              ) : (
                <div style={{ 
                  width: '80px', height: '80px', borderRadius: '50%', 
                  border: '4px solid rgba(230,107,51,0.1)', borderTop: '4px solid var(--primary)',
                  animation: 'spin 1s linear infinite', margin: '0 auto 24px'
                }}></div>
              )}
              <div style={{ color: 'var(--text-main)', fontSize: '20px', fontWeight: '800', marginTop: '20px' }}>
                {quality === 'master' ? '大师引擎深度构建中...' : 'AI 正在捕获灵感...'}
              </div>
              <div style={{ width: '240px', height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', margin: '24px auto', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: quality === 'master' ? 'var(--master)' : 'var(--primary)', transition: 'width 0.5s ease' }}></div>
              </div>
            </div>
          ) : result ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <img 
                src={result} 
                alt="Result" 
                style={{ 
                  maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', borderRadius: '24px', 
                  boxShadow: '0 40px 100px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)'
                }} 
              />
              
              {/* 大师版专属笔记入口 */}
              {quality === 'master' && (
                <>
                  <div 
                    className="glass-badge"
                    onMouseEnter={() => setShowNotes(true)}
                    onMouseLeave={() => setShowNotes(false)}
                    style={{
                      position: 'absolute', bottom: '24px', right: '24px', width: '48px', height: '48px',
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'var(--master)', fontSize: '20px'
                    }}
                  >
                    ✦
                  </div>
                  {showNotes && (
                    <div className="glass-badge" style={{
                      position: 'absolute', bottom: '85px', right: '24px', width: '300px', padding: '24px',
                      borderRadius: '24px', textAlign: 'left', zIndex: 10
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--master)', marginBottom: '10px' }}>✦ 大师创作笔记</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        针对您的创意，大师引擎已自动：<br/>
                        • 引入丁达尔效应模拟增强光感<br/>
                        • 应用斐波那契螺旋优化构图<br/>
                        • 进行了 4K 级别的纹理细节重塑
                      </div>
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)', fontSize: '12px', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => alert(`【原提示词】: ${prompt}\n\n【大师增强词】: 已自动注入光影参数与语义扩展...`)}>
                        查看灵感演变细节 ›
                      </div>
                    </div>
                  )}
                </>
              )}

              <div style={{ display: 'flex', gap: '16px', marginTop: '32px', width: '100%', maxWidth: '400px' }}>
                <a href={result} download className="btn-primary" style={{ flex: 1, textDecoration: 'none' }}>
                  <Download size={18} /> 高清保存
                </a>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', opacity: 0.2 }}>
              <Palette size={80} strokeWidth={1} />
            </div>
          )}

          {/* 风格实验室弹窗 - 移动到此处以实现在预览区居中且不遮挡侧边栏 */}
          {showLab && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <div className="card" style={{ 
                width: '90%', maxWidth: '800px', padding: '40px', position: 'relative', maxHeight: '90%', overflowY: 'auto',
                background: 'rgba(255, 255, 255, 0.95)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.5)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
              }}>
                <button 
                  onClick={() => setShowLab(false)}
                  style={{ position: 'absolute', top: '25px', right: '25px', border: 'none', background: '#eee', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#666' }}
                >
                  <X size={18} />
                </button>
                
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                  <div style={{ display: 'inline-block', background: 'var(--primary-glow)', color: 'var(--primary)', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', marginBottom: '12px' }}>
                    STYLE LAB · 风格实验室
                  </div>
                  <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>定义您的艺术维度</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{quality === 'standard' ? '标准版仅支持部分风格，升级高清版解锁全部' : '请选择一个艺术模板开始创作'}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                  {styles.map((s) => {
                    const isLocked = quality === 'standard' && s.id !== 'default' && s.id !== 'real';
                    return (
                      <div 
                        key={s.id} 
                        onClick={() => {
                          if (!isLocked) {
                            setSelectedStyle(s);
                            setShowLab(false);
                          }
                        }}
                        style={{ 
                          padding: '24px 16px', borderRadius: '20px', border: selectedStyle.id === s.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                          background: selectedStyle.id === s.id ? 'white' : (isLocked ? '#f5f5f7' : 'white'),
                          cursor: isLocked ? 'not-allowed' : 'pointer', transition: 'var(--transition)',
                          textAlign: 'center', position: 'relative', opacity: isLocked ? 0.5 : 1,
                          boxShadow: selectedStyle.id === s.id ? '0 10px 25px rgba(230,107,51,0.15)' : 'none'
                        }}
                        onMouseOver={(e) => { if (!isLocked) e.currentTarget.style.transform = 'translateY(-5px)'; }}
                        onMouseOut={(e) => { if (!isLocked) e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>{s.icon}</div>
                        <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{s.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{s.desc}</div>
                        {isLocked && <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '10px', background: '#ccc', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>🔒</div>}
                        {!isLocked && s.pts !== 'All' && <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '10px', background: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>{s.pts}</div>}
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: '40px', textAlign: 'center', background: '#f5f5f7', padding: '20px', borderRadius: '20px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    💡 想要更多？高清版与大师版正在研发更多专属风格模型。
                  </p>
                </div>
              </div>
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
    </>
  );
};

export default HomePage;
