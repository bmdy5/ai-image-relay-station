import React, { useState, useEffect, useRef } from 'react';
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
  Edit3,
  RotateCcw,
  Camera,
  Compass,
  Plane,
  Armchair,
  Smartphone,
  Radio,
  Film,
  Clock,
  Orbit,
  Share2,
  Library,
  CreditCard,
  Box,
  Flag,
  Wind,
  Plus
} from 'lucide-react';
import Showcase from '../components/Showcase';

const HomePage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [quality, setQuality] = useState('standard');
  const [activeJobs, setActiveJobs] = useState([]); 
  const [currentJobId, setCurrentJobId] = useState(null); 
  const [showConfirmModal, setShowConfirmModal] = useState(false); 
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
  const [selectedStyle, setSelectedStyle] = useState({ id: 'default', name: '默认风格', desc: '原生艺术呈现', icon: <Sparkles size={24} />, placeholder: '主题：【在此输入你想生成的画面】' });
  const [particles, setParticles] = useState([]);
  const [showNotes, setShowNotes] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [requiredPoints, setRequiredPoints] = useState(0);
  
  // 派生状态：是否有任务正在运行
  const loading = activeJobs.some(j => j.status === 'pending' || j.status === 'generating');
  
  // 维护一个全局轮询器引用，防止重复
  const pollTimers = useRef({});
  const [isRefining, setIsRefining] = useState(false);
  const [refineParentId, setRefineParentId] = useState(null);
  const [refineRootId, setRefineRootId] = useState(null); // 新增：记录演化根节点
  const [iterationInfo, setIterationInfo] = useState({ current: 0, max: 0 });
  const [historyPrompt, setHistoryPrompt] = useState('');
  
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
    'hd': 10,
    'master': 15
  });

  const styles = [
    // --- 第一梯队：全量基础 (All) ---
    { id: 'default', name: '默认风格', desc: '原生艺术呈现', icon: <Sparkles size={24} />, pts: 'All', placeholder: '主题：【在此输入你想生成的画面】' },
    { id: 'real', name: '极致写实', desc: '仿真现实模拟', icon: <Camera size={24} />, pts: 'All', placeholder: '主题：【在此输入人像或画面，支持多样化构图生成】' },
    { id: 'product', name: '商业大片', desc: '设计师级商业海报质感', icon: <ShoppingBag size={24} />, pts: 'All', placeholder: '产品名称：【在此输入产品名称】' },
    { id: 'tech_poster', name: '科技海报', desc: '高级感信息排版', icon: <Layers size={24} />, pts: 'All', placeholder: '海报主题：【在此输入科技主题】' },
    { id: 'travel_guide', name: '旅游攻略', desc: '手绘旅行手账', icon: <Compass size={24} />, pts: 'All', placeholder: '目的地 @ 天数：【如：大理 @ 3】', recommendedRatio: '9:16' },
    { id: 'travel', name: '旅游海报', desc: '高阶旅行杂志封面', icon: <Plane size={24} />, pts: 'All', placeholder: '灵感：【如：京都极简小巷、霓虹下的东京、海岛日落】 氛围：【如：复古排版、莫兰迪色调】', recommendedRatio: '9:16', img: '/showcase/master_travel_poster.png' },
    { id: 'vintage_5s', name: '复古纪实', desc: 'iPhone 5s 怀旧', icon: <Film size={24} />, pts: 'All', placeholder: '拍摄环境：【如：90年代香港中环、午后老街】', requiresImage: true, recommendedRatio: '9:16' },
    { id: 'restore_old', name: '老照片修复', desc: '质感修复与高清还原', icon: <Clock size={24} />, pts: 'All', placeholder: '描述照片背景或需要重点修复的细节（可选）', requiresImage: true },

    // --- 第二梯队：专业进阶 (HD+) ---
    { id: 'interior', name: '室内设计', desc: '空间重构方案', icon: <Armchair size={24} />, pts: 'HD+', placeholder: '装修风格：【在此输入风格】', requiresImage: true, recommendedRatio: '16:9' },
    { id: 'product_detail', name: '详情页设计', desc: '复古简约商业视觉', icon: <Layout size={24} />, pts: 'HD+', placeholder: '产品：【在此输入产品名称】', recommendedRatio: '9:16', img: '/showcase/master_product_razer.png' },
    { id: 'live_stream', name: '直播截图', desc: '还原带货现场', icon: <Radio size={24} />, pts: 'HD+', placeholder: '直播内容：【在此输入直播内容】', requiresImage: true, recommendedRatio: '16:9' },
    { id: 'ccd_snap', name: 'CCD 随手抓拍', desc: '闪光灯氛围', icon: <Zap size={24} />, pts: 'HD+', placeholder: '人物：【在此输入，支持多样化构图】 环境：【如：深夜旺角街头、雨夜霓虹】', requiresImage: true, recommendedRatio: '9:16' },

    // --- 第三梯队：巅峰旗舰 (Master) ---
    { id: 'eri_silhouette', name: '轮廓宇宙', desc: '史诗级叙事海报', icon: <Orbit size={24} />, pts: 'Master', placeholder: '叙事主题：【在此输入主题】' },
    { id: 'silk_road', name: '国风月夜', desc: '宋代山水意境', icon: <Wind size={24} />, pts: 'Master', placeholder: '主题：【在此输入主题名称】' },
    { id: 'relation_map', name: '人物关系图谱', desc: '作品逻辑梳理', icon: <Share2 size={24} />, pts: 'Master', placeholder: '作品：【在此输入名称】', recommendedRatio: '9:16', img: '/showcase/master_relation_map.png' },
    { id: 'encyclopedia', name: '博物馆图鉴', desc: '国家博物馆级文博信息图', icon: <Library size={24} />, pts: 'Master', placeholder: '百科对象：【在此输入】', recommendedRatio: '9:16', img: '/showcase/master_encyclopedia_chess.png' },
    { id: 'knowledge_card', name: '知识图卡', desc: '现代百科科普图鉴', icon: <CreditCard size={24} />, pts: 'Master', placeholder: '百科主题：【在此输入】', recommendedRatio: '9:16' },
    { id: 'ui_upgrade', name: 'UI 视觉进化', desc: '草图/截图一键转高保真大厂设计', icon: <Box size={24} />, pts: 'Master', placeholder: '💡 UI 进化模式：无需输入文字。请直接上传您的 UI 截图或草图，点击“开始创作”，系统将自动分析并重构。', requiresImage: true, recommendedRatio: '9:16' },
    { id: 'app_ui_design', name: 'APP UI 设计', desc: 'iOS 原生视觉全案', icon: <Smartphone size={24} />, pts: 'Master', placeholder: 'APP 主题：【在此输入】', recommendedRatio: '9:16' },
    { id: 'campaign_poster', name: '运营活动页', desc: '移动端运营海报', icon: <Flag size={24} />, pts: 'Master', placeholder: '活动主题：【在此输入】', recommendedRatio: '9:16', img: '/showcase/master_commercial_equestrian.png' }
  ];

  // AI 润色白名单 (Task: Strict Whitelist)
  const ALLOWED_ENHANCE_STYLES = ['default', 'real', 'product', 'tech_poster'];

  // 迭代精修逻辑
  const handleRefine = (job) => {
    const maxRefines = job.quality === 'master' ? 3 : (job.quality === 'hd' ? 2 : 0);
    if (maxRefines === 0) {
      showToast('⚠️ 标准版暂不支持迭代精修，请升级专业版或旗舰版', 'error');
      return;
    }
    
    // 一键装填
    setCurrentJobId(null); // 进入新任务模式
    setRefImageUrl(job.url);
    setPrompt(job.prompt);
    setQuality(job.quality);
    const style = styles.find(s => s.id === job.style);
    if (style) setSelectedStyle(style);
    if (job.aspect_ratio) setAspectRatio(job.aspect_ratio);
    
    setIsRefining(true);
    setRefineParentId(job.id);
    setRefineRootId(job.root_id || job.id); // 建立根指针
    setIterationInfo({ current: (job.iteration || 0) + 1, max: maxRefines });
    
    // 平滑滚动到顶
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('✨ 已进入精修模式，您可以修改提示词进行迭代', 'success');
  };

  const cancelRefine = () => {
    setIsRefining(false);
    setRefImageUrl('');
    setRefineParentId(null);
    setRefineRootId(null);
  };

  useEffect(() => {
    const hasToken = !!localStorage.getItem('token');
    let guestFlag = localStorage.getItem('isGuest') === 'true';
    if (guestFlag && hasToken) {
      localStorage.removeItem('isGuest'); // 已登录，清除残留游客标记
      guestFlag = false;
    }
    setIsGuest(guestFlag);

    if (!guestFlag) {
      fetchUserInfo();
    } else {
      setUserInfo({ username: '游客用户', points: 0, uid: 'GUEST' });
    }
    fetchConfig();
    checkPendingPrompt();
    loadActiveJobs(); // 加载持久化任务
  }, []);

  // 持久化：保存任务
  useEffect(() => {
    if (activeJobs.length > 0) {
      localStorage.setItem('visionary_active_jobs', JSON.stringify({
        timestamp: Date.now(),
        jobs: activeJobs
      }));
    } else {
      localStorage.removeItem('visionary_active_jobs');
    }
  }, [activeJobs]);

  const loadActiveJobs = () => {
    const saved = localStorage.getItem('visionary_active_jobs');
    if (saved) {
      const { timestamp, jobs } = JSON.parse(saved);
      // 延长至 2 小时 (7200000ms)
      if (Date.now() - timestamp < 7200000) {
        setActiveJobs(jobs);
        if (jobs.length > 0) setCurrentJobId(jobs[0].id);
        
        // 自动接力轮询
        jobs.forEach(job => {
          if ((job.status === 'pending' || job.status === 'generating') && job.taskId) {
            startPolling(job.id, job.taskId);
          }
        });
      } else {
        localStorage.removeItem('visionary_active_jobs');
      }
    }
  };

  const startPolling = (jobId, taskId) => {
    if (pollTimers.current[jobId]) clearInterval(pollTimers.current[jobId]);
    
    let pollCount = 0;
    let internalProgress = 0;
    
    const timer = setInterval(async () => {
      pollCount++;
      try {
        const statusRes = await request.get(`/image/status/${taskId}`);
        let targetProgress = internalProgress;
        
        if (statusRes.status === 'pending') targetProgress = Math.min(internalProgress + 2, 20);
        else if (statusRes.status === 'generating') targetProgress = Math.min(internalProgress + 10, 80);
        else if (statusRes.status === 'success') {
          clearInterval(timer);
          delete pollTimers.current[jobId];
          setActiveJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'success', progress: 100, result: statusRes.image_url, final_prompt: statusRes.final_prompt } : j));
          return;
        } else if (statusRes.status === 'failed') {
          clearInterval(timer);
          delete pollTimers.current[jobId];
          setActiveJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'failed', error: statusRes.error } : j));
          return;
        }
        
        internalProgress = targetProgress;
        setActiveJobs(prev => prev.map(j => j.id === jobId ? { ...j, progress: Math.floor(internalProgress), status: statusRes.status } : j));
      } catch (err) {}
      
      if (pollCount > 60) {
        clearInterval(timer);
        delete pollTimers.current[jobId];
        setActiveJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'failed', error: '请求超时' } : j));
      }
    }, 3000);
    
    pollTimers.current[jobId] = timer;
  };

  const fetchConfig = async () => {
    try {
      const data = await request.get('/image/config');
      if (data.pricing) setPricingMap(data.pricing);
    } catch (err) {}
  };

  const checkPendingPrompt = () => {
    const pending = sessionStorage.getItem('pending_prompt');
    const reuseData = sessionStorage.getItem('pending_reuse');
    
    if (reuseData) {
      const data = JSON.parse(reuseData);
      setPrompt(data.prompt || '');
      if (data.style) {
        const styleObj = styles.find(s => s.id === data.style);
        if (styleObj) setSelectedStyle(styleObj);
      }
      if (data.quality) setQuality(data.quality);
      if (data.ref_image_url) setRefImageUrl(data.ref_image_url);
      
      // 捕获精修状态
      if (data.is_refining) {
        setIsRefining(true);
        setRefineParentId(data.parent_id);
        setRefineRootId(data.root_id); // 捕获 root_id
        const maxRefines = data.quality === 'master' ? 3 : (data.quality === 'hd' ? 2 : 0);
        setIterationInfo({ current: data.iteration || 1, max: maxRefines });
        showToast('✨ 已进入迭代精修模式，您可以修改提示词', 'success');
      }
      
      sessionStorage.removeItem('pending_reuse');
      focusInput();
    } else if (pending) {
      setPrompt(pending);
      sessionStorage.removeItem('pending_prompt');
      focusInput();
    }
  };

  const focusInput = () => {
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }
    }, 100);
  };

  const handleEnhance = async () => {
    if (!prompt.trim() || enhancing) return;
    
    // 备份当前内容用于撤销
    setHistoryPrompt(prompt);
    setEnhancing(true);
    
    try {
      const res = await request.post('/image/enhance-prompt', { 
        prompt: prompt.trim(),
        style_id: selectedStyle.id
      });
      
      if (res.enhanced) {
        setPrompt(res.enhanced);
        showToast('✨ 提示词已智能润色', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.detail || 'AI 优化失败，请稍后重试', 'error');
    } finally {
      setEnhancing(false);
    }
  };

  const handleUndo = () => {
    if (historyPrompt) {
      setPrompt(historyPrompt);
      setHistoryPrompt('');
      showToast('已恢复原始输入', 'info');
    }
  };


  const fetchUserInfo = async () => {
    try {
      const data = await request.get('/auth/me');
      setUserInfo(data);
    } catch (err) {}
  };

  const handleGenerate = async (forceNew = false) => {
    if (isGuest) {
      setShowGuestModal(true);
      return;
    }

    // 任务冲突与并行上限检查
    const runningJobs = activeJobs.filter(j => j.status === 'pending' || j.status === 'generating');
    if (runningJobs.length >= 3) {
      showToast('⚠️ 当前并行任务已达上限（3路），请稍等片刻', 'error');
      return;
    }

    if (runningJobs.length > 0 && !forceNew) {
      setShowConfirmModal(true);
      return;
    }
    setShowConfirmModal(false);

    // 积分预检
    const cost = pricingMap[quality] || 5;
    if (userInfo && userInfo.points < cost) {
      setRequiredPoints(cost);
      setShowPointsModal(true);
      return;
    }

    if (!prompt && selectedStyle.id !== 'ui_upgrade') return;
    
    const newJobId = Date.now().toString();
    const newJob = {
      id: newJobId,
      prompt,
      quality,
      style: selectedStyle.id,
      status: 'pending',
      progress: 0,
      timestamp: Date.now()
    };

    setActiveJobs(prev => [newJob, ...prev]);
    setCurrentJobId(newJobId);
    setPrompt('');
    setShowNotes(false);
    
    // 大师模式粒子流...
    
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
        setActiveJobs(prev => prev.map(j => j.id === newJobId ? { ...j, status: 'failed', error: '请上传参考图' } : j));
        return;
      }

      const res = await request.post('/image/generate', { 
        prompt, 
        quality, 
        style: selectedStyle.id,
        aspect_ratio: aspectRatio,
        ref_image_url: refImageUrl,
        parent_id: refineParentId,
        root_id: refineRootId,
        iteration: iterationInfo.current
      });
      
      if (isRefining) {
        setIsRefining(false);
        setRefineParentId(null);
        setRefineRootId(null);
      }
      const taskId = res.id;
      setUserInfo(prev => ({ ...prev, points: res.remaining_points }));
      window.dispatchEvent(new CustomEvent('points-updated'));
      
      // 更新任务对象，保存 taskId 用于接力轮询
      setActiveJobs(prev => prev.map(j => j.id === newJobId ? { ...j, taskId } : j));

      const toastMsg = quality === 'master' 
        ? '✦ 大师引擎已启动！您可以继续输入新灵感，后台支持多路并行。' 
        : '🚀 任务提交成功！您可以离开此页面，完成后请在“我的创作”中查看。';
      showToast(toastMsg, 'success');

      startPolling(newJobId, taskId);

    } catch (err) {
      if (particleInterval) clearInterval(particleInterval);
      setActiveJobs(prev => prev.map(j => j.id === newJobId ? { ...j, status: 'failed', error: err.response?.data?.detail || '提交失败' } : j));
      setParticles([]);
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
        <div className="sidebar-container" style={{ 
          display: 'flex', flexDirection: 'column', gap: '16px', padding: '0',
          position: 'relative'
        }}>
          {/* 查看模式锁定蒙层 */}
          {currentJobId && (
            <div style={{
              position: 'absolute', inset: '-10px', background: 'rgba(255,255,255,0.4)',
              backdropFilter: 'blur(4px)', zIndex: 10, borderRadius: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'not-allowed', animation: 'fadeIn 0.3s'
            }}>
              <div style={{
                padding: '10px 20px', background: 'white', borderRadius: '30px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)', display: 'flex', 
                alignItems: 'center', gap: '8px', border: '1px solid var(--primary-glow)'
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.5s infinite' }}></div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#1d1d1f' }}>查看模式 · 点击右侧 + 号开启新创作</span>
              </div>
            </div>
          )}
          
          {/* 1. 创作模式切换 */}
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px' }}>创作模式</div>
            <div style={{ display: 'flex', background: '#ededf0', padding: '4px', borderRadius: '14px' }}>
              {[
                { id: 'standard', name: '标准版' },
                { id: 'hd', name: '专业版' },
                { id: 'master', name: '旗舰版' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setQuality(t.id);
                    // 降级检查：如果手动切换到更低等级，且当前风格不支持该等级，则重置回默认
                    if (t.id === 'standard' && selectedStyle.pts !== 'All') {
                      setSelectedStyle(styles[0]);
                    } else if (t.id === 'hd' && selectedStyle.pts === 'Master') {
                      setSelectedStyle(styles[0]);
                    }
                  }}
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
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              灵感输入
              {isRefining ? (
                <div style={{ 
                  fontSize: '11px', background: 'linear-gradient(135deg, #e66b33, #ff9800)', color: 'white', 
                  padding: '2px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px',
                  boxShadow: '0 4px 10px rgba(230,107,51,0.2)', animation: 'pulse 2s infinite'
                }}>
                  <Wand2 size={10} />
                  精修中 ({iterationInfo.current}/{iterationInfo.max}) · 💡 建议保留关键词
                  <X size={10} style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={cancelRefine} />
                </div>
              ) : (
                quality !== 'standard' && (
                  <div style={{ 
                    fontSize: '11px', color: '#e66b33', fontWeight: 'bold', 
                    display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.8
                  }}>
                    <Wand2 size={12} />
                    {quality === 'master' ? '3' : '2'}次迭代机会
                  </div>
                )
              )}
            </div>
            
            <div className={enhancing ? 'ai-enhancing-border' : (isRefining ? 'refining-border' : '')}>
              <textarea
                className={`prompt-box ${enhancing ? 'ai-enhancing-inner' : ''}`}
                placeholder="描述你脑海中的画面..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onPaste={handlePaste}
                disabled={loading || enhancing || !!currentJobId}
                style={{
                  width: '100%', height: '120px', border: enhancing ? 'none' : '1px solid var(--border)', borderRadius: '12px', padding: '12px',
                  fontSize: '13px', lineHeight: '1.6', resize: 'none', background: !!currentJobId ? '#f5f5f7' : '#fafafa', transition: 'all 0.3s',
                  outline: 'none', marginBottom: '0'
                }}
                onFocus={(e) => { if(!enhancing) { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 4px var(--primary-glow)'; } }}
                onBlur={(e) => { if(!enhancing) { e.target.style.borderColor = 'var(--border)'; e.target.style.background = '#fafafa'; e.target.style.boxShadow = 'none'; } }}
              />
            </div>
            
            {/* AI 润色工具条 (Task 2.2) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', marginBottom: '16px' }}>
              {ALLOWED_ENHANCE_STYLES.includes(selectedStyle.id) ? (
                <button
                  onClick={handleEnhance}
                  disabled={enhancing || loading || !prompt.trim()}
                  style={{
                    padding: '6px 12px', borderRadius: '18px', border: '1px solid #e66b33',
                    background: enhancing ? '#fff8f5' : 'transparent',
                    color: '#e66b33', cursor: (enhancing || !prompt.trim()) ? 'not-allowed' : 'pointer',
                    fontSize: '12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px',
                    opacity: !prompt.trim() ? 0.5 : 1, transition: 'all 0.3s'
                  }}
                >
                  <Sparkles size={14} className={enhancing ? 'spin' : ''} />
                  {enhancing ? '正在构思细节...' : '✨ 智能润色提示词'}
                </button>
              ) : (
                <div style={{ fontSize: '11px', color: '#999' }}>✨ 此风格模版已预设最佳参数，直接输入即可</div>
              )}

              {historyPrompt && !enhancing && (
                <button 
                  onClick={handleUndo}
                  style={{ background: 'none', border: 'none', color: '#999', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  恢复原句
                </button>
              )}
            </div>
            
            {/* 灵感推荐标签 (New) */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
               <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700', whiteSpace: 'nowrap', marginRight: '4px' }}>推荐灵感</span>
               {[ '梦幻的城堡', '星空下的湖泊', '赛博朋克城市'].map(tag => (
                 <button 
                   key={tag}
                   onClick={() => setPrompt(tag)}
                   style={{
                     padding: '4px 10px', borderRadius: '8px', background: '#f5f5f7', border: 'none',
                     fontSize: '11px', color: '#666', cursor: 'pointer', whiteSpace: 'nowrap',
                     transition: 'all 0.2s'
                   }}
                   onMouseOver={e => { e.target.style.background = 'var(--primary-glow)'; e.target.style.color = 'var(--primary)'; }}
                   onMouseOut={e => { e.target.style.background = '#f5f5f7'; e.target.style.color = '#666'; }}
                 >
                   {tag}
                 </button>
               ))}
               <button style={{ background: 'transparent', border: 'none', color: '#999', cursor: 'pointer', marginLeft: '4px' }}>
                 <RotateCcw size={12} />
               </button>
            </div>

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

          {/* 4. 高级工具 (图生图全员可用) */}
          <div style={{ transition: 'all 0.5s' }}>
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
            disabled={loading || !prompt.trim() || (selectedStyle.requiresImage && !refImageUrl) || !!currentJobId}
            style={{ 
              width: '100%', marginTop: 'auto', height: '44px', 
              borderRadius: '10px', fontSize: '14px',
              background: (loading || !!currentJobId) ? '#f3a481' : 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            {loading ? (
              '🚀 正在创作中...'
            ) : currentJobId ? (
              '锁定模式'
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
          <div style={{ width: '100%', height: '100%', display: 'flex', gap: '24px', position: 'relative' }}>
            {/* 主展示区 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '600px', position: 'relative' }}>
              
              {(() => {
                const currentJob = activeJobs.find(j => j.id === currentJobId);
                
                if (!currentJobId || activeJobs.length === 0 || !currentJob) {
                  /* 空白创作引导区 */
                  return (
                    <div style={{ textAlign: 'center', maxWidth: '450px', animation: 'fadeIn 0.8s ease-out', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ position: 'relative', width: '240px', height: '200px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg style={{ position: 'absolute', width: '220px', height: '220px' }} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                          <path fill="#fdf6f2" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.1,-46.3C90.4,-33.5,96,-18.1,96.5,-2.5C97,13.2,92.5,29.1,83.1,41.9C73.7,54.6,59.3,64.2,44.4,72.6C29.5,81,14.7,88.2,-1.3,90.5C-17.3,92.8,-34.7,90.2,-48.9,81.4C-63.1,72.6,-74.2,57.7,-81.4,41.4C-88.6,25.1,-91.9,7.4,-88.9,-9.2C-85.9,-25.8,-76.5,-41.2,-64.2,-53.4C-51.9,-65.6,-36.6,-74.6,-21.8,-79.8C-7,-84.9,7.4,-86.2,21.8,-82.9C36.2,-79.6,50.6,-71.8,44.7,-76.4Z" transform="translate(100 100)" />
                        </svg>
                        <svg style={{ position: 'relative', zIndex: 2, width: '120px', height: '120px' }} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M 48 15 C 23 15 13 35 13 55 C 13 75 33 85 53 85 C 63 85 68 80 68 75 C 68 70 63 65 58 65 C 53 65 53 55 58 55 C 68 55 83 50 83 35 C 83 20 68 15 48 15 Z" fill="#fff" stroke="#D1ABA0" strokeWidth="3" strokeLinejoin="round"/>
                          <circle cx="33" cy="35" r="3.5" fill="#C59C8F" />
                          <circle cx="28" cy="52" r="3.5" fill="#D1ABA0" />
                          <circle cx="42" cy="68" r="3.5" fill="#E8D1C7" />
                          <circle cx="52" cy="30" r="3.5" fill="#D1ABA0" />
                          <circle cx="68" cy="42" r="3.5" fill="#C59C8F" />
                        </svg>
                      </div>
                      <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#2c2c2e', marginBottom: '16px' }}>您的创意画布</h2>
                      <p style={{ fontSize: '15px', color: '#8e8e93' }}>请在左侧输入您的灵感，开启 AI 艺术之旅</p>
                    </div>
                  );
                }

                if (currentJob.status === 'processing' || currentJob.status === 'pending' || currentJob.status === 'generating') {
                  /* 生成中状态 */
                  return (
                    <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                      {quality === 'master' ? (
                        <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                          <div className="thinking-orb"></div>
                          {particles.map(p => (
                            <div key={p.id} className="neural-particle" style={{ '--tx': `${p.tx}px`, '--ty': `${p.ty}px`, left: '50%', top: '50%' }}>
                              {p.text}
                            </div>
                          ))}
                          <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{ color: 'var(--master)', fontWeight: '800', letterSpacing: '4px', fontSize: '12px' }}>
                              REASONING...
                            </div>
                            <div style={{ width: '120px', height: '3px', background: 'rgba(138,43,226,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ 
                                width: `${currentJob.progress || 0}%`, 
                                height: '100%', 
                                background: 'var(--master)', 
                                transition: 'width 0.5s ease' 
                              }}></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                           <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '4px solid rgba(0,0,0,0.05)', borderTop: '4px solid var(--primary)', animation: 'spin 1s linear infinite' }} />
                           <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.8)', padding: '40px', borderRadius: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', backdropFilter: 'blur(20px)' }}>
                              <div style={{ fontSize: '24px', fontWeight: '900', color: '#1d1d1f', marginBottom: '16px', letterSpacing: '-0.5px' }}>AI 正在为您构思画面...</div>
                              <div style={{ width: '320px', height: '12px', background: 'rgba(0,0,0,0.05)', borderRadius: '6px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)', margin: '0 auto' }}>
                                <div style={{ 
                                  width: `${currentJob.progress || 0}%`, 
                                  height: '100%', 
                                  background: 'linear-gradient(90deg, #e66b33, #ff9800, #ffc107)', 
                                  backgroundSize: '200% 100%',
                                  animation: 'shimmer 2s linear infinite',
                                  transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' 
                                }}></div>
                              </div>
                              <div style={{ fontSize: '18px', color: 'var(--primary)', fontWeight: '900', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '28px' }}>{currentJob.progress || 0}</span>
                                <span style={{ opacity: 0.5, fontSize: '20px' }}>%</span>
                              </div>
                           </div>
                        </div>
                      )}
                    </div>
                  );
                }

                if (currentJob.status === 'success') {
                  /* 生成成功 */
                  return (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeIn 0.5s' }}>
                      <img 
                        src={currentJob.result} 
                        alt="Result" 
                        style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', borderRadius: '24px', boxShadow: '0 40px 100px rgba(0,0,0,0.1)' }} 
                      />
                      <div style={{ display: 'flex', gap: '16px', marginTop: '32px', width: '100%', maxWidth: '450px' }}>
                        <button 
                          onClick={() => handleRefine(currentJob)} 
                          className="btn-primary" 
                          style={{ flex: 1.5, background: 'linear-gradient(135deg, #e66b33, #ff9800)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                          <Wand2 size={18} /> 迭代精修
                        </button>
                        <a href={currentJob.result} download className="btn-primary" style={{ flex: 1, textDecoration: 'none', background: '#f5f5f7', color: '#1d1d1f', border: 'none' }}>
                          <Download size={18} /> 高清保存
                        </a>
                      </div>
                    </div>
                  );
                }

                if (currentJob.status === 'failed') {
                  /* 生成失败 */
                  return (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <div style={{ color: '#ff4d4f', marginBottom: '16px' }}><X size={48} /></div>
                      <div style={{ fontSize: '18px', fontWeight: '700' }}>生成失败</div>
                      <p style={{ color: '#999', marginTop: '8px' }}>{currentJob.error || '未知错误'}</p>
                      <button onClick={() => setActiveJobs(prev => prev.filter(j => j.id !== currentJobId))} className="btn-secondary" style={{ marginTop: '20px' }}>清除此任务</button>
                    </div>
                  );
                }

                return null;
              })()}
            </div>

            {/* 右侧任务栈 (始终保留) */}
            {activeJobs.length > 0 && (
              <div style={{ 
                width: '70px', display: 'flex', flexDirection: 'column', gap: '16px', 
                borderLeft: '1px solid rgba(0,0,0,0.05)', paddingLeft: '20px', 
                maxHeight: '600px', overflowY: 'auto', paddingTop: '10px'
              }}>
                {/* 新增任务按钮 */}
                <div 
                  onClick={() => { 
                    setCurrentJobId(null); 
                    setPrompt(''); 
                    setRefImageUrl('');
                    setQuality('standard'); // 归零至标准版
                    setSelectedStyle(styles[0]); // 归零至默认风格
                    setAspectRatio('1:1');
                    setIsRefining(false);
                  }}
                  style={{ 
                    width: '50px', height: '50px', borderRadius: '12px', border: '2px dashed #ddd',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999',
                    cursor: 'pointer', flexShrink: 0, transition: '0.3s',
                    background: currentJobId === null ? 'var(--primary-glow)' : 'transparent',
                    borderColor: currentJobId === null ? 'var(--primary)' : '#ddd'
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = '#ddd'}
                >
                  <Plus size={24} />
                </div>

                {activeJobs.map(job => (
                  <div 
                    key={job.id}
                    onClick={() => {
                      setCurrentJobId(job.id);
                      // 同步所有快照参数
                      setQuality(job.quality);
                      setPrompt(job.prompt);
                      const styleObj = styles.find(s => s.id === job.style);
                      if (styleObj) setSelectedStyle(styleObj);
                      if (job.aspect_ratio) setAspectRatio(job.aspect_ratio);
                      if (job.ref_image_url) setRefImageUrl(job.ref_image_url);
                      setIsRefining(false); // 退出当前的精修编辑态
                    }}
                    style={{ 
                      width: '50px', height: '50px', borderRadius: '12px', overflow: 'hidden', 
                      position: 'relative', cursor: 'pointer', border: currentJobId === job.id ? '2px solid var(--primary)' : '2px solid transparent',
                      transition: 'all 0.3s', flexShrink: 0,
                      boxShadow: currentJobId === job.id ? '0 4px 12px rgba(230,107,51,0.2)' : 'none'
                    }}
                  >
                    {job.status === 'success' ? (
                      <img src={job.result} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : job.status === 'failed' ? (
                      <div style={{ width: '100%', height: '100%', background: '#fff1f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff4d4f' }}>
                        <X size={20} />
                      </div>
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #ddd', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }}></div>
                        <div style={{ position: 'absolute', fontSize: '9px', fontWeight: 'bold', color: 'var(--primary)' }}>{job.progress}%</div>
                      </div>
                    )}
                  </div>
                ))}
                <button 
                  onClick={() => { setActiveJobs([]); setCurrentJobId(null); }}
                  style={{ border: 'none', background: 'transparent', color: '#999', fontSize: '11px', cursor: 'pointer', marginTop: 'auto' }}
                >
                  清除全部
                </button>
              </div>
            )}
          </div>



          {/* 底部特性背书 (New) - 仅在完全没有作品时显示，避免干扰创作区 */}
          {activeJobs.length === 0 && (
            <div style={{ position: 'absolute', bottom: '40px', display: 'flex', gap: '32px', zIndex: 2 }}>
              {[
                { icon: <Sparkles size={18} />, title: 'AI 智能生成', desc: '强大模型，精细呈现' },
                { icon: <Wand2 size={18} />, title: '迭代精修', desc: '针对作品深度进化' },
                { icon: <Layers size={18} />, title: '多风格支持', desc: '多种艺术风格可选' },
                { icon: <Diamond size={18} />, title: '高质量输出', desc: '高清画质，细节丰富' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(230,107,51,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1d1d1f' }}>{item.title}</div>
                    <div style={{ fontSize: '11px', color: '#86868b' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
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
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{quality === 'standard' ? '标准版仅支持部分风格，升级专业版解锁全部' : '请选择一个艺术模板开始创作'}</p>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, 1fr)', 
                  gap: '16px'
                }}>
                  {styles.map(s => {
                    // 严格等级压制逻辑
                    return (
                      <div 
                        key={s.id} 
                        onClick={() => {
                          // 自动切换等级锚点
                          if (s.pts === 'Master') setQuality('master');
                          else if (s.pts === 'HD+') setQuality('hd');
                          else setQuality('standard');

                          const isCustomPrompt = prompt.trim() && !prompt.includes('【');
                          
                          const applyStyle = (shouldUpdatePrompt = false) => {
                            setSelectedStyle(s);
                            if (s.recommendedRatio) setAspectRatio(s.recommendedRatio);
                            
                            if (shouldUpdatePrompt || !prompt.trim() || prompt.includes('【')) {
                              setPrompt(s.placeholder || '');
                            }
                            
                            setShowLab(false);
                            if (s.requiresImage) {
                              showToast('✨ 此风格需要上传图片作为参考', 'success');
                            } else if (refImageUrl) {
                              showToast('📸 当前带有参考图，生图将参考此图', 'info');
                            }
                          };

                          if (!isCustomPrompt) {
                            applyStyle(true);
                          } else {
                            if (window.confirm('是否应用新风格的提示词模版？这会覆盖您当前的内容。')) {
                              applyStyle(true);
                            } else {
                              // 仅切换风格，保留提示词，但更新比例
                              setSelectedStyle(s);
                              if (s.recommendedRatio) setAspectRatio(s.recommendedRatio);
                              setShowLab(false);
                            }
                          }
                        }}
                        style={{ 
                          padding: '24px 16px', borderRadius: '20px', border: selectedStyle.id === s.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                          background: selectedStyle.id === s.id ? 'white' : 'white',
                          cursor: 'pointer', transition: 'var(--transition)',
                          textAlign: 'center', position: 'relative', opacity: 1,
                          boxShadow: selectedStyle.id === s.id ? '0 10px 25px rgba(230,107,51,0.15)' : 'none'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>{s.icon}</div>
                        <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{s.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{s.desc}</div>
                        {s.pts !== 'All' && <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '10px', background: s.pts === 'Master' ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{s.pts === 'Master' ? '旗舰' : '专业'}</div>}
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: '40px', textAlign: 'center', background: '#f5f5f7', padding: '20px', borderRadius: '20px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    💡 想要更多？专业版与旗舰版正在研发更多专属风格模型。
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* 游客模式拦截弹窗 */}
          {showGuestModal && createPortal(
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(15px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11000,
              animation: 'fadeIn 0.3s'
            }}>
              <div className="card" style={{ 
                width: '90%', maxWidth: '400px', padding: '40px', textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.9)', borderRadius: '30px', border: '1px solid #fff'
              }}>
                <div style={{ fontSize: '50px', marginBottom: '20px' }}>🎨</div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1d1d1f', marginBottom: '12px' }}>
                  开启您的灵感之旅
                </h2>
                <p style={{ color: '#86868b', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>
                  注册账号立享 <strong style={{ color: 'var(--primary)' }}>10 创作积分</strong>，<br/>解锁高清下载、风格实验室等全部功能。
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('isGuest');
                      navigate('/register');
                    }}
                    className="btn-primary" 
                    style={{ width: '100%', padding: '14px', fontSize: '16px' }}
                  >
                    立即注册 (送 10 积分)
                  </button>
                  <button 
                    onClick={() => setShowGuestModal(false)}
                    style={{ 
                      background: 'none', border: 'none', color: '#999', 
                      fontSize: '14px', cursor: 'pointer', padding: '8px' 
                    }}
                  >
                    先随便逛逛
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
        {/* 并发任务确认弹窗 */}
        {showConfirmModal && (
          <div className="modal-overlay" style={{ zIndex: 11000 }}>
            <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px' }}>
              <div style={{ width: '80px', height: '80px', background: 'var(--primary-glow)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
                <Zap size={40} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '12px' }}>任务正在进行中</h3>
              <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '32px' }}>
                您已有一个创作任务正在运行。您可以选择继续等待，或者<b>同时开启新任务</b>。
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button onClick={() => handleGenerate(true)} className="btn-primary" style={{ width: '100%' }}>开启新任务</button>
                <button onClick={() => setShowConfirmModal(false)} className="btn-secondary" style={{ width: '100%' }}>继续等待</button>
              </div>
            </div>
          </div>
        )}
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
              maxHeight: '80vh', maxWidth: '90vw', borderRadius: '16px', 
              boxShadow: '0 30px 100px rgba(0,0,0,0.5)', objectFit: 'contain',
              animation: 'modalZoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }} 
            alt="Preview" 
          />
          
          <div 
            style={{ position: 'absolute', bottom: '40px', display: 'flex', gap: '16px', zIndex: 10001 }}
            onClick={e => e.stopPropagation()}
          >
            <a 
              href={previewImage} 
              download 
              className="btn-primary" 
              style={{ padding: '12px 30px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 30px rgba(230,107,51,0.3)' }}
            >
              <Download size={20} /> 下载原图
            </a>
          </div>

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

      {/* 积分不足弹窗 */}
      {showPointsModal && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px' }}>
            <div style={{ width: '80px', height: '80px', background: '#fff7e6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#faad14' }}>
              <Coins size={40} />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '12px' }}>积分余额不足</h3>
            <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '32px' }}>
              当前生成需要 <b style={{ color: 'var(--primary)' }}>{requiredPoints}</b> 积分<br/>
              您的余额仅剩 <b style={{ color: '#faad14' }}>{userInfo?.points || 0}</b> 积分
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowPointsModal(false)} className="btn-secondary" style={{ flex: 1 }}>稍后再说</button>
              <button onClick={() => navigate('/pricing')} className="btn-primary" style={{ flex: 1.2 }}>立即充值</button>
            </div>
          </div>
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
