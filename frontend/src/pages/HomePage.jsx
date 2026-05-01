import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [refImageUrl, setRefImageUrl] = useState('');
  const [numImages, setNumImages] = useState(1);
  const [previewImage, setPreviewImage] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showLab, setShowLab] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackContact, setFeedbackContact] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [selectedStyle, setSelectedStyle] = useState({ id: 'default', name: '默认风格', desc: '原生艺术呈现', icon: '✨', placeholder: '主题：【在此输入你想生成的画面】' });
  const [particles, setParticles] = useState([]);
  const [showNotes, setShowNotes] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState('');
  
  // 处理剪贴板粘贴图片 (Task: Paste to Ref Image)
  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            setRefImageUrl(ev.target.result);
            showToast('📸 图片已自动设置为参考图', 'success');
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };
  
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
    { id: 'default', name: '默认风格', desc: '原生艺术呈现', icon: '✨', pts: 'All', placeholder: '主题：【在此输入你想生成的画面】' },
    { id: 'real', name: '极致写实', desc: '4K 相机级质感', icon: '📷', pts: 'All', placeholder: '主题：【在此输入你想生成的真实画面】' },
    { id: 'product', name: '电商白底', desc: '纯净产品主图', icon: '🛍️', pts: 'All', placeholder: '产品名称：【在此输入产品名称】' },
    { id: 'tech_poster', name: '科技海报', desc: '未来感排版', icon: '🚀', pts: 'All', placeholder: '海报主题：【在此输入科技主题】' },
    { id: 'travel', name: '旅游海报', desc: '城市名片定制', icon: '🗺️', pts: 'HD+', placeholder: '城市名称：【在此输入城市】' },
    { id: 'interior', name: '室内设计', desc: '空间重构方案', icon: '🏠', pts: 'HD+', placeholder: '装修风格：【在此输入风格】', requiresImage: true },
    { id: 'live_stream', name: '直播截图', desc: '还原带货现场', icon: '📱', pts: 'HD+', placeholder: '直播内容：【在此输入直播内容】' },
    { id: 'eri_silhouette', name: '侧脸叙事', desc: '史诗剪影宇宙', icon: '👤', pts: 'Master', placeholder: '叙事主题：【在此输入主题】' },
    { id: 'silk_road', name: '丝绸山河', desc: 'S型流动构图', icon: '🏮', pts: 'Master', placeholder: '宣传城市/主题：【在此输入名称】' },
    { id: 'vintage_5s', name: '复古纪实', desc: 'iPhone 5s 怀旧', icon: '📟', pts: 'Master', placeholder: '拍摄地点：【在此输入具体地点】', requiresImage: true },
    { id: 'relation_map', name: '关系图谱', desc: '作品逻辑梳理', icon: '🔗', pts: 'Master', placeholder: '作品/事件名称：【在此输入】' },
    { id: 'encyclopedia', name: '科普百科', desc: '图鉴模块化卡片', icon: '📖', pts: 'Master', placeholder: '科普对象：【在此输入】' }
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
      // 验证图片约束 (Task 3.3)
      if (selectedStyle.requiresImage && !refImageUrl) {
        showToast('✨ 此风格必须上传参考图以获得最佳效果', 'error');
        setLoading(false);
        return;
      }

      const res = await request.post('/image/generate', { 
        prompt, 
        quality, 
        style: selectedStyle.id,
        aspect_ratio: aspectRatio,
        ref_image_url: refImageUrl
      });
      const taskId = res.id;
      setUserInfo(prev => ({ ...prev, points: res.remaining_points }));
      
      const toastMsg = quality === 'master' 
        ? '✦ 大师引擎已启动！您可以继续输入新灵感，后台支持 3 路并行，任务完成后自动存入历史。' 
        : '🚀 任务提交成功！支持 3 个任务并行，您可以离开此页面，完成后请在“我的创作”中查看。';
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
            setFinalPrompt(statusRes.final_prompt || '');
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
              onPaste={handlePaste}
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

          {/* 4. 高级工具 (Task 3.4) */}
          <div style={{ opacity: quality === 'standard' ? 0.4 : 1, pointerEvents: quality === 'standard' ? 'none' : 'auto', transition: 'all 0.5s' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              高级工具 <span style={{ fontSize: '10px', background: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '4px', marginLeft: '5px' }}>PRO</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 图生图上传器 */}
              <div 
                className="glass-card"
                style={{ 
                  padding: '12px', border: selectedStyle.requiresImage && !refImageUrl ? '1px dashed var(--primary)' : '1px solid var(--border)',
                  borderRadius: '16px', background: 'white', display: 'flex', alignItems: 'center', gap: '12px'
                }}
              >
                <div 
                  onClick={() => document.getElementById('ref-upload').click()}
                  style={{ 
                    width: '48px', height: '48px', borderRadius: '12px', background: '#f2f2f7', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    overflow: 'hidden', border: '1px solid var(--border)'
                  }}
                >
                  {refImageUrl ? (
                    <img src={refImageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Images size={20} color="var(--text-secondary)" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '700' }}>参考图片</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {selectedStyle.requiresImage ? (
                      <span style={{ color: refImageUrl ? 'var(--text-secondary)' : 'var(--primary)' }}>
                        {refImageUrl ? '已上传参考图' : '⚠️ 此风格必须上传图片'}
                      </span>
                    ) : '可选，支持参考生图'}
                  </div>
                </div>
                {refImageUrl && (
                  <button onClick={() => setRefImageUrl('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ff4d4f' }}>
                    <X size={14} />
                  </button>
                )}
                <input 
                  id="ref-upload" type="file" accept="image/*" hidden 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => setRefImageUrl(ev.target.result);
                      reader.readAsDataURL(file);
                    }
                  }} 
                />
              </div>

              {/* 比例选择器 */}
              <div style={{ display: 'flex', background: '#f2f2f7', padding: '4px', borderRadius: '14px' }}>
                {['1:1', '9:16', '16:9'].map(r => (
                  <button
                    key={r}
                    onClick={() => setAspectRatio(r)}
                    style={{
                      flex: 1, padding: '6px', border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                      transition: 'all 0.3s',
                      background: aspectRatio === r ? 'white' : 'transparent',
                      color: aspectRatio === r ? 'var(--primary)' : '#666',
                      boxShadow: aspectRatio === r ? '0 4px 10px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            className={`btn-primary ${loading ? 'loading-pulse' : ''}`} 
            onClick={handleGenerate} 
            disabled={loading || !prompt.trim() || (selectedStyle.requiresImage && !refImageUrl)}
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
                    // 严格等级压制逻辑 (Fix: Tier Unlocking Bug)
                    let isLocked = false;
                    if (quality === 'standard') {
                      // 标准版只能用基础风格
                      isLocked = !['default', 'real', 'product', 'tech_poster'].includes(s.id);
                    } else if (quality === 'hd') {
                      // 高清版不能用大师版风格
                      isLocked = s.pts === 'Master';
                    }
                    // 大师版解锁所有
                    
                    return (
                      <div 
                        key={s.id} 
                        onClick={() => {
                          if (!isLocked) {
                            // 智能填词与覆盖逻辑 (Task 3.2)
                            const currentPlaceholder = selectedStyle.placeholder;
                            const isInputEmpty = !prompt.trim() || prompt === currentPlaceholder;
                            
                            const applyStyle = () => {
                              setSelectedStyle(s);
                              setPrompt(s.placeholder || '');
                              setShowLab(false);
                              if (s.requiresImage) {
                                showToast('✨ 此风格需要上传图片作为参考', 'success');
                              }
                            };

                            if (isInputEmpty) {
                              applyStyle();
                            } else {
                              if (window.confirm('是否应用新风格的提示词模版？这会覆盖您当前的内容。')) {
                                applyStyle();
                              } else {
                                // 仅切换风格，不覆盖文字
                                setSelectedStyle(s);
                                setShowLab(false);
                              }
                            }
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

      {/* 图片预览 Modal - 使用 Portal 解决 fixed 定位失效问题 */}
      {previewImage && createPortal(
        <div 
          style={{ 
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(15px)',
            zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out'
          }}
          onClick={() => setPreviewImage(null)}
        >
          <button style={{ position: 'absolute', top: '30px', right: '30px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={32} />
          </button>
          <img 
            src={previewImage} 
            style={{ 
              maxHeight: '90vh', maxWidth: '95vw', borderRadius: '16px', 
              boxShadow: '0 30px 100px rgba(0,0,0,0.5)', objectFit: 'contain',
              animation: 'modalZoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }} 
            alt="Preview" 
          />
          <style>{`
            @keyframes modalZoom {
              from { transform: scale(0.9); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>,
        document.body
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

      {/* 消息提示渲染 */}
      {toast.visible && (
        <div style={{
          position: 'fixed', top: '40px', left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'error' ? 'rgba(255, 77, 79, 0.9)' : 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)', color: 'white', padding: '12px 24px', borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '12px',
          zIndex: 10002, animation: 'toastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}>
          {toast.type === 'error' ? <X size={18} /> : <CheckCircle size={18} color="#52c41a" />}
          <span style={{ fontSize: '14px', fontWeight: '600' }}>{toast.message}</span>
        </div>
      )}

      <style>{`
        @keyframes toastIn {
          from { transform: translate(-50%, -20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default HomePage;
