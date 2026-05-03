import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import request from '../api/request';
import { 
  Sparkles, Zap, Diamond, Crown, X, Download, ArrowUpCircle, Palette, Settings2, Award, Images, Plus, ArrowUp, Maximize2, Wand2,
  Camera, ShoppingBag, Layers, Compass, Plane, Armchair, Layout, Radio, Film, Clock, Orbit, Wind, Share2, Library, CreditCard, Box, Smartphone, Flag, Coins
} from 'lucide-react';

import MobileDrawer from '../components/MobileDrawer';
import NeuralPlexus from '../components/NeuralPlexus';

// 风格映射字典
const STYLE_NAME_MAP = { 
  'real': '极致写实', 'anime': '二次元', 'oil': '油画', 
  'cyber': '赛博', '3d': '3D渲染', 'ink': '水墨', 'poster': '海报',
  'default': '默认', 'product': '电商白底', 'tech_poster': '科技海报',
  'travel': '旅游海报', 'interior': '室内设计', 'live_stream': '直播截图',
  'eri_silhouette': '侧脸叙事', 'silk_road': '丝绸山河', 'vintage_5s': '复古纪实',
  'ccd_snap': 'CCD 随手抓拍', 'restore_old': '老照片修复',
  'relation_map': '关系图谱', 'encyclopedia': '科普百科', 'ui_upgrade': 'UI 视觉进化', 'default': '默认'
};

const QUALITY_NAME_MAP = { 'standard': '标准版', 'hd': '专业版', 'master': '旗舰版' };

// 结果卡片组件
const ResultCard = ({ job, onOpenNotes, onPreview, onRefine }) => {
  const isMaster = job.quality === 'master';
  const qName = QUALITY_NAME_MAP[job.quality] || job.quality;
  const sName = STYLE_NAME_MAP[job.style] || job.style;

  return (
    <div style={{
      width: '100%',
      background: '#fff',
      borderRadius: 'var(--radius-mobile)',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
      border: isMaster ? '1px solid rgba(138,43,226,0.1)' : '1px solid rgba(0,0,0,0.02)',
      position: 'relative',
      flexShrink: 0,
      marginBottom: '8px',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      {/* 提示词与版本标注区 */}
      <div style={{ 
        padding: '12px 16px', 
        background: '#FAFAFB',
        borderBottom: '1px solid rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', flex: 1, lineHeight: '1.4' }}>{job.prompt}</div>
          <div style={{ 
            fontSize: '9px', 
            color: isMaster ? 'var(--master)' : '#8E8E93',
            background: isMaster ? 'rgba(124, 77, 255, 0.1)' : 'rgba(0,0,0,0.05)',
            padding: '2px 8px',
            borderRadius: '6px',
            fontWeight: '800',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            {isMaster && '✦ '}{qName} - {sName}
          </div>
        </div>

        {/* 参考图微缩预览 (New) */}
        {job.ref_image_url && (
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.03)', padding: '6px 10px', borderRadius: '10px', marginTop: '4px' }}>
              <img src={job.ref_image_url} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} alt="Ref" />
              <div style={{ fontSize: '11px', color: '#888', fontWeight: '700' }}>参考原图</div>
           </div>
        )}
      </div>

      {/* 图像显示/生成区 */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {job.status === 'success' ? (
          <div style={{ width: '100%', position: 'relative' }}>
            <img src={job.result} onClick={() => onPreview(job.result)} alt="AI Result" style={{ width: '100%', display: 'block' }} />
            {isMaster && (
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(138, 43, 226, 0.9)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                 <Sparkles size={10} /> 大师版 ✦
              </div>
            )}
            
            {/* 迭代精修按钮 */}
            {(job.quality === 'hd' || job.quality === 'master') && (
              <div 
                onClick={() => onRefine && onRefine(job)}
                style={{ 
                  position: 'absolute', bottom: '12px', right: '12px', width: '40px', height: '40px', 
                  background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <Wand2 size={20} />
              </div>
            )}

            <div onClick={() => onPreview(job.result)} style={{ position: 'absolute', bottom: '12px', left: '12px', width: '40px', height: '40px', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              <Maximize2 size={20} />
            </div>
          </div>
        ) : job.status === 'failed' ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#ff4d4f' }}>
            <X size={40} style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>生成失败</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>{job.error}</div>
          </div>
        ) : (
          /* 生成中状态 */
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #eee', borderTop: '3px solid var(--primary)', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
            <div style={{ fontSize: '13px', fontWeight: 'bold' }}>AI 正在创作中... {job.progress}%</div>
          </div>
        )}
      </div>
    </div>
  );
};


const MobileHomePage = () => {
  const stackRef = useRef(null);
  const [prompt, setPrompt] = useState('');
  const [quality, setQuality] = useState('standard');
  const [isRefining, setIsRefining] = useState(false);
  const [refineParentId, setRefineParentId] = useState(null);
  const [refineRootId, setRefineRootId] = useState(null);
  const [iterationInfo, setIterationInfo] = useState({ current: 0, max: 0 });
  const [jobs, setJobs] = useState([]); 
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState({ id: 'default', name: '默认风格', desc: '原生艺术呈现', icon: '✨', pts: 'All', placeholder: '主题：【在此输入你想生成的画面】' });
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [refImageUrl, setRefImageUrl] = useState('');
  const [pricingMap, setPricingMap] = useState({ 'standard': 5, 'hd': 10, 'master': 15 });
  const [selectedJob, setSelectedJob] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [enhancing, setEnhancing] = useState(false);
  const [historyPrompt, setHistoryPrompt] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [requiredPoints, setRequiredPoints] = useState(0);
  const [isGuest, setIsGuest] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const pollTimers = useRef({});

  
  // 处理粘贴图片 (Task: Mobile Paste to Ref)
  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            setRefImageUrl(ev.target.result);
            // 简单的移动端提示
            const tip = document.createElement('div');
            tip.innerHTML = '📸 图片已自动设置为参考图';
            tip.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);color:white;padding:8px 16px;border-radius:20px;font-size:12px;z-index:10001;white-space:nowrap;pointer-events:none;animation:fadeUpDown 3s forwards;';
            document.body.appendChild(tip);
            setTimeout(() => tip.remove(), 3000);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  useEffect(() => {
    const guestFlag = localStorage.getItem('isGuest') === 'true';
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
    if (jobs.length > 0) {
      localStorage.setItem('visionary_active_jobs_mobile', JSON.stringify({
        timestamp: Date.now(),
        jobs: jobs
      }));
    } else {
      localStorage.removeItem('visionary_active_jobs_mobile');
    }
  }, [jobs]);

  const loadActiveJobs = () => {
    const saved = localStorage.getItem('visionary_active_jobs_mobile');
    if (saved) {
      const { timestamp, jobs: savedJobs } = JSON.parse(saved);
      if (Date.now() - timestamp < 300000) {
        setJobs(savedJobs);
        // 自动接力轮询
        savedJobs.forEach(job => {
          if ((job.status === 'pending' || job.status === 'generating') && job.taskId) {
            startPolling(job.id, job.taskId);
          }
        });
      } else {
        localStorage.removeItem('visionary_active_jobs_mobile');
      }
    }
  };

  const startPolling = (jobId, taskId) => {
    if (pollTimers.current[jobId]) clearInterval(pollTimers.current[jobId]);
    
    const timer = setInterval(async () => {
      try {
        const statusRes = await request.get(`/image/status/${taskId}`);
        if (statusRes.status === 'success') {
          clearInterval(timer);
          delete pollTimers.current[jobId];
          setJobs(prev => prev.map(j => j.id === jobId ? { 
            ...j, status: 'success', progress: 100, result: statusRes.image_url, 
            ref_image_url: statusRes.ref_image_url, quality: statusRes.quality, style: statusRes.style 
          } : j));
        } else if (statusRes.status === 'failed') {
          clearInterval(timer);
          delete pollTimers.current[jobId];
          setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'failed', error: statusRes.error } : j));
        } else {
          setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: statusRes.status, progress: j.progress + 5 > 95 ? 95 : j.progress + 5 } : j));
        }
      } catch (err) {}
    }, 3000);
    
    pollTimers.current[jobId] = timer;
  };

  const fetchUserInfo = async () => {
    try {
      const data = await request.get('/auth/me');
      setUserInfo(data);
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
        setRefineRootId(data.root_id);
        const maxRefines = data.quality === 'master' ? 3 : (data.quality === 'hd' ? 2 : 0);
        setIterationInfo({ current: data.iteration || 1, max: maxRefines });
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
      const input = document.querySelector('input[type="text"]');
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }, 300);
  };

  const handleEnhance = async () => {
    if (!prompt.trim() || enhancing) return;
    setHistoryPrompt(prompt);
    setEnhancing(true);
    try {
      const res = await request.post('/image/enhance-prompt', { 
        prompt: prompt.trim(),
        style_id: selectedStyle.id
      });
      if (res.enhanced) {
        setPrompt(res.enhanced);
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'AI 优化失败');
    } finally {
      setEnhancing(false);
    }
  };

  const handleUndo = () => {
    if (historyPrompt) {
      setPrompt(historyPrompt);
      setHistoryPrompt('');
    }
  };

  // 迭代精修逻辑
  const handleRefine = (job) => {
    const maxRefines = job.quality === 'master' ? 3 : (job.quality === 'hd' ? 2 : 0);
    if (maxRefines === 0) {
      alert('⚠️ 标准版暂不支持迭代精修，请升级专业版或旗舰版');
      return;
    }
    
    setRefImageUrl(job.result);
    setPrompt(job.prompt);
    setQuality(job.quality);
    const style = styles.find(s => s.id === job.style);
    if (style) setSelectedStyle(style);
    
    setIsRefining(true);
    setRefineParentId(job.id);
    setRefineRootId(job.root_id || job.id);
    setIterationInfo({ current: (job.iteration || 0) + 1, max: maxRefines });
    
    // 平滑滚动
    if (stackRef.current) {
        stackRef.current.scrollTo({ top: stackRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  const cancelRefine = () => {
    setIsRefining(false);
    setRefImageUrl('');
    setRefineParentId(null);
    setRefineRootId(null);
  };


  useEffect(() => {
    if (stackRef.current) {
      stackRef.current.scrollTop = stackRef.current.scrollHeight;
    }
  }, [jobs]);

  const fetchConfig = async () => {
    try {
      const data = await request.get('/image/config');
      if (data.pricing) setPricingMap(data.pricing);
    } catch (err) {}
  };

  const styles = [
    // --- 第一梯队：全量基础 (All) ---
    { id: 'default', name: '默认风格', desc: '原生艺术呈现', icon: <Sparkles size={24} />, pts: 'All', placeholder: '主题：【在此输入你想生成的画面】' },
    { id: 'real', name: '极致写实', desc: '仿真现实模拟', icon: <Camera size={24} />, pts: 'All', placeholder: '主题：【在此输入人像或画面，支持多样化构图生成】' },
    { id: 'product', name: '商业大片', desc: '设计师级商业海报质感', icon: <ShoppingBag size={24} />, pts: 'All', placeholder: '产品名称：【在此输入产品名称】' },
    { id: 'tech_poster', name: '科技海报', desc: '高级感信息排版', icon: <Layers size={24} />, pts: 'All', placeholder: '海报主题：【在此输入科技主题】' },
    { id: 'travel_guide', name: '旅游攻略', desc: '手绘旅行手账', icon: <Compass size={24} />, pts: 'All', placeholder: '目的地 @ 天数：【如：大理 @ 3】', recommendedRatio: '9:16' },
    { id: 'travel', name: '旅游海报', desc: '高阶旅行杂志封面', icon: <Plane size={24} />, pts: 'All', placeholder: '灵感：【如：京都极简小巷、霓虹下的东京、海岛日落】 氛围：【如：复古排版、莫兰迪色调】', recommendedRatio: '9:16' },
    { id: 'vintage_5s', name: '复古纪实', desc: 'iPhone 5s 怀旧', icon: <Film size={24} />, pts: 'All', placeholder: '拍摄环境：【如：90年代香港中环、午后老街】', requiresImage: true, recommendedRatio: '9:16' },
    { id: 'restore_old', name: '老照片修复', desc: '质感修复与高清还原', icon: <Clock size={24} />, pts: 'All', placeholder: '描述照片背景或需要重点修复的细节（可选）', requiresImage: true },

    // --- 第二梯队：专业进阶 (HD+) ---
    { id: 'interior', name: '室内设计', desc: '空间重构方案', icon: <Armchair size={24} />, pts: 'HD+', placeholder: '装修风格：【在此输入风格】', requiresImage: true, recommendedRatio: '16:9' },
    { id: 'product_detail', name: '详情页设计', desc: '复古简约商业视觉', icon: <Layout size={24} />, pts: 'HD+', placeholder: '产品：【在此输入产品名称】', recommendedRatio: '9:16' },
    { id: 'live_stream', name: '直播截图', desc: '还原带货现场', icon: <Radio size={24} />, pts: 'HD+', placeholder: '直播内容：【在此输入直播内容】', requiresImage: true, recommendedRatio: '16:9' },
    { id: 'ccd_snap', name: 'CCD 随手抓拍', desc: '闪光灯氛围', icon: <Zap size={24} />, pts: 'HD+', placeholder: '人物：【在此输入，支持多样化构图】 环境：【如：深夜旺角街头、雨夜霓虹】', requiresImage: true, recommendedRatio: '9:16' },

    // --- 第三梯队：巅峰旗舰 (Master) ---
    { id: 'eri_silhouette', name: '轮廓宇宙', desc: '史诗级叙事海报', icon: <Orbit size={24} />, pts: 'Master', placeholder: '叙事主题：【在此输入主题】' },
    { id: 'silk_road', name: '国风月夜', desc: '宋代山水意境', icon: <Wind size={24} />, pts: 'Master', placeholder: '主题：【在此输入主题名称】' },
    { id: 'relation_map', name: '人物关系图谱', desc: '作品逻辑梳理', icon: <Share2 size={24} />, pts: 'Master', placeholder: '作品：【在此输入名称】', recommendedRatio: '9:16' },
    { id: 'encyclopedia', name: '博物馆图鉴', desc: '国家博物馆级文博信息图', icon: <Library size={24} />, pts: 'Master', placeholder: '百科对象：【在此输入】', recommendedRatio: '9:16' },
    { id: 'knowledge_card', name: '知识图卡', desc: '现代百科科普图鉴', icon: <CreditCard size={24} />, pts: 'Master', placeholder: '百科主题：【在此输入】', recommendedRatio: '9:16' },
    { id: 'ui_upgrade', name: 'UI 视觉进化', desc: '草图/截图一键转高保真大厂设计', icon: <Box size={24} />, pts: 'Master', placeholder: '💡 UI 进化模式：无需输入文字。请直接上传您的 UI 截图或草图，点击“开始创作”，系统将自动分析并重构。', requiresImage: true, recommendedRatio: '9:16' },
    { id: 'app_ui_design', name: 'APP UI 设计', desc: 'iOS 原生视觉全案', icon: <Smartphone size={24} />, pts: 'Master', placeholder: 'APP 主题：【在此输入】', recommendedRatio: '9:16' },
    { id: 'campaign_poster', name: '运营活动页', desc: '移动端运营海报', icon: <Flag size={24} />, pts: 'Master', placeholder: '活动主题：【在此输入】', recommendedRatio: '9:16' }
  ];

  // AI 润色白名单 (Task: Strict Whitelist)
  const ALLOWED_ENHANCE_STYLES = ['default', 'real', 'product', 'tech_poster'];

  const handleGenerate = async (forceNew = false) => {
    if (isGuest) {
      setShowGuestModal(true);
      return;
    }

    // 任务冲突与并行上限检查
    const runningJobs = jobs.filter(j => j.status === 'pending' || j.status === 'generating');
    if (runningJobs.length >= 3) {
      alert('⚠️ 当前并行任务已达上限（3路），请稍等片刻');
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

    if (!prompt.trim() && selectedStyle.id !== 'ui_upgrade') return;

    if (selectedStyle.requiresImage && !refImageUrl) {
      alert('✨ 此风格必须上传参考图以获得最佳效果，请点击左侧 + 号上传。');
      return;
    }

    const newJob = { id: Date.now().toString(), prompt, quality, style: selectedStyle.id, status: 'pending', progress: 0, ref_image_url: refImageUrl };
    setJobs(prev => [newJob, ...prev]); // 新任务置顶
    setPrompt('');
    try {
      const res = await request.post('/image/generate', { 
        prompt: prompt, 
        quality: quality, 
        style: selectedStyle.id,
        aspect_ratio: aspectRatio,
        ref_image_url: refImageUrl,
        parent_id: refineParentId,
        root_id: refineRootId,
        iteration: iterationInfo.current
      });
      
      // 成功后才重置
      if (isRefining) {
        setIsRefining(false);
        setRefineParentId(null);
        setRefineRootId(null);
      }
      const taskId = res.id;
      
      const tip = document.createElement('div');
      tip.innerHTML = '✨ 任务已进入后台，您可以继续创作（支持 3 路并行）';
      tip.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);color:white;padding:8px 16px;border-radius:20px;font-size:12px;z-index:10001;white-space:nowrap;pointer-events:none;animation:fadeUpDown 3s forwards;border:1px solid rgba(255,255,255,0.1);';
      document.body.appendChild(tip);
      setTimeout(() => tip.remove(), 3000);

      // 更新任务对象，保存 taskId 用于接力轮询
      setJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, taskId } : j));
      
      startPolling(newJob.id, taskId);

    } catch (err) {
      setJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, status: 'failed', error: '提交失败' } : j));
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      background: 'radial-gradient(circle at 10% 20%, rgba(255, 218, 185, 0.2) 0%, rgba(250, 249, 249, 1) 70%)', 
      position: 'relative' 
    }}>
      <NeuralPlexus transparent={true} />
      <main ref={stackRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {jobs.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ccc', marginTop: '15vh' }}>
            <div style={{ 
              position: 'relative', 
              width: '100px', 
              height: '100px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: '20px' 
            }}>
              <Sparkles 
                size={64} 
                style={{ 
                  color: '#C59C8F',
                  filter: 'drop-shadow(0 0 15px rgba(197, 156, 143, 0.4)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.8))',
                  opacity: 0.8
                }} 
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle, rgba(255,218,185,0.2) 0%, transparent 70%)',
                zIndex: -1
              }} />
            </div>
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#C59C8F', letterSpacing: '1px' }}>开启您的创作之旅</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#e66b33', marginTop: '12px', fontWeight: 'bold' }}>
              <Wand2 size={14} /> 支持针对作品深度迭代精修
            </div>
          </div>
        ) : (
          jobs.map(job => (
            <ResultCard 
              key={job.id} 
              job={job} 
              onOpenNotes={(j) => { setSelectedJob(j); setActiveDrawer('notes'); }} 
              onPreview={(img) => setPreviewImage(img)}
              onRefine={handleRefine}
            />
          ))
        )}

      </main>
      <div style={{ padding: '16px 16px 24px', background: 'linear-gradient(to top, rgba(255,255,255,0.9) 60%, transparent)', position: 'relative' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch' }}>
          <div onClick={() => setActiveDrawer('tier')} style={{ 
            flexShrink: 0, padding: '10px 14px', 
            background: quality === 'master' ? 'var(--master)' : 'var(--copper)', 
            color: 'white', borderRadius: '14px', fontSize: '12px', fontWeight: '800', 
            display: 'flex', alignItems: 'center', gap: '6px',
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 12px rgba(197,156,143,0.2)'
          }}>
            {quality === 'master' ? <Sparkles size={14} /> : <Zap size={14} />}
            {quality === 'master' ? '旗舰版 ✦' : quality === 'hd' ? '专业版' : '标准版'}
          </div>
          <div onClick={() => setActiveDrawer('style')} style={{ 
            flexShrink: 0, padding: '10px 14px', 
            background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)',
            borderRadius: '14px', fontSize: '12px', fontWeight: '700', 
            display: 'flex', alignItems: 'center', gap: '6px', 
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
          }}>
            <Palette size={14} /> {selectedStyle.name}
          </div>
          
          {/* 比例切换器 */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)',
              padding: '4px', borderRadius: '20px', display: 'flex', gap: '4px',
              border: '1px solid rgba(255,255,255,0.5)'
            }}>
              {['1:1', '9:16', '16:9'].map(ratio => (
                <div 
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  style={{ 
                    padding: '6px 12px', borderRadius: '16px', fontSize: '11px', fontWeight: '800', cursor: 'pointer',
                    background: aspectRatio === ratio ? 'white' : 'transparent',
                    color: aspectRatio === ratio ? 'var(--copper)' : '#8E8E93',
                    boxShadow: aspectRatio === ratio ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {ratio}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 预览已上传的图片 */}
        {refImageUrl && (
          <div style={{ position: 'absolute', top: '-50px', left: '16px', display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '4px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '1px solid #f0f0f0' }}>
            <img src={refImageUrl} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
            <button onClick={() => setRefImageUrl('')} style={{ border: 'none', background: '#eee', color: '#ff4d4f', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={10} />
            </button>
          </div>
        )}

        {/* 撤销浮层 (Task 2.2) */}
        {historyPrompt && !enhancing && (
          <div 
            onClick={handleUndo}
            style={{ 
              position: 'absolute', top: '-24px', right: '16px', 
              background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 10px', 
              borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', zIndex: 10
            }}
          >
            撤销润色
          </div>
        )}

        {/* 精修横幅 */}
        {isRefining && (
          <div style={{ 
            margin: '0 16px 8px', padding: '6px 12px', 
            background: 'linear-gradient(135deg, #e66b33, #ff9800)', 
            color: 'white', borderRadius: '12px', fontSize: '11px',
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 12px rgba(230,107,51,0.2)',
            animation: 'fadeInUp 0.4s ease-out'
          }}>
            <Wand2 size={12} />
            精修中 ({iterationInfo.current}/{iterationInfo.max}) · 💡 建议保留关键词
            <div onClick={cancelRefine} style={{ marginLeft: 'auto', padding: '4px' }}>
              <X size={14} />
            </div>
          </div>
        )}

        <div 
          className={enhancing ? 'ai-enhancing-border' : ''}
          style={{ 
            background: enhancing ? 'transparent' : 'rgba(255, 255, 255, 0.8)', 
            backdropFilter: 'blur(20px)',
            height: '56px', margin: '0 16px', borderRadius: '28px', display: 'flex', alignItems: 'center', padding: enhancing ? '0' : '0 8px 0 12px', 
            boxShadow: '0 15px 35px rgba(0,0,0,0.08)', border: enhancing ? 'none' : '1px solid rgba(255,255,255,0.9)',
            transition: 'all 0.5s'
          }}
        >
          <div 
            className={enhancing ? 'ai-enhancing-inner' : ''}
            style={{ 
              width: '100%', height: '100%', borderRadius: '28px', display: 'flex', alignItems: 'center', 
              padding: enhancing ? '0 8px 0 12px' : '0', background: enhancing ? 'white' : 'transparent'
            }}
          >
            {/* 左侧加号上传 */}
            <button 
              onClick={() => document.getElementById('mobile-upload').click()}
              style={{ border: 'none', background: '#F2F2F7', color: '#666', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px' }}
            >
              <Plus size={20} />
            </button>
            
            <input 
              type="text" 
              placeholder={enhancing ? 'AI 正在构思中...' : (selectedStyle.requiresImage ? '⚠️ 请上传图片并输入灵感...' : '描述你的灵感画面...')} 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)} 
              onPaste={handlePaste}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()} 
              disabled={enhancing}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px', background: 'transparent' }} 
            />
            
            {/* 智能润色按钮 (Task 2.2) */}
            {prompt.trim() && ALLOWED_ENHANCE_STYLES.includes(selectedStyle.id) && (
              <button 
                onClick={handleEnhance}
                disabled={enhancing}
                style={{ 
                  border: 'none', background: 'transparent', color: '#e66b33', 
                  width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <Sparkles size={20} className={enhancing ? 'spin' : ''} />
              </button>
            )}

            <button 
                onClick={handleGenerate} 
                disabled={enhancing || !prompt.trim() || (selectedStyle.requiresImage && !refImageUrl)} 
                style={{ 
                  width: '40px', height: '40px', 
                  background: quality === 'master' ? 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)' : 'linear-gradient(135deg, #C59C8F 0%, #A87B6D 100%)', 
                  borderRadius: '50%', border: 'none', color: 'white', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.4), 0 4px 10px rgba(0,0,0,0.1)',
                  opacity: (enhancing || !prompt.trim() || (selectedStyle.requiresImage && !refImageUrl)) ? 0.5 : 1
                }}
              >
              <ArrowUp size={22} />
            </button>
          </div>
          
          <input id="mobile-upload" type="file" accept="image/*" hidden onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (ev) => setRefImageUrl(ev.target.result);
              reader.readAsDataURL(file);
            }
          }} />
        </div>
      </div>

      <MobileDrawer isOpen={activeDrawer === 'tier'} onClose={() => setActiveDrawer(null)} title="选择创作模式">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { id: 'standard', name: '标准版', desc: '快速捕捉灵感', pts: pricingMap.standard, color: 'var(--primary)', icon: <Zap size={18} /> },
            { id: 'hd', name: '专业版', desc: '生产力全开', pts: pricingMap.hd, color: '#3b82f6', icon: <Diamond size={18} /> },
            { id: 'master', name: '旗舰版 ✦', desc: '顶级光影构建', pts: pricingMap.master, color: 'var(--master)', icon: <Sparkles size={18} /> }
          ].map(t => (
            <div 
              key={t.id} 
              onClick={() => { 
                setQuality(t.id); 
                setActiveDrawer(null);
                // 降级检查：如果手动切换到更低等级，且当前风格不支持该等级，则重置回默认
                if (t.id === 'standard' && selectedStyle.pts !== 'All') {
                  setSelectedStyle(styles[0]);
                } else if (t.id === 'hd' && selectedStyle.pts === 'Master') {
                  setSelectedStyle(styles[0]);
                }
              }}
              style={{ 
                padding: '16px', borderRadius: '18px', border: quality === t.id ? `2px solid ${t.color}` : '2px solid #F2F2F7', 
                background: quality === t.id ? `${t.color}08` : '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', background: '#F2F2F7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.color }}>{t.icon}</div>
                <div>
                  <b style={{ fontSize: '15px' }}>{t.name}</b>
                  <div style={{ fontSize: '11px', color: '#999' }}>{t.desc}</div>
                  {(t.id === 'hd' || t.id === 'master') && (
                    <div style={{ fontSize: '9px', color: '#e66b33', marginTop: '2px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Wand2 size={10} /> 包含 {t.id === 'master' ? '3' : '2'} 次迭代精修
                    </div>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: t.color, fontWeight: '800', fontSize: '16px' }}>{t.pts}</div>
                <div style={{ fontSize: '10px', color: '#999' }}>积分 / 张</div>
              </div>
            </div>
          ))}
        </div>
      </MobileDrawer>

      <MobileDrawer isOpen={activeDrawer === 'style'} onClose={() => setActiveDrawer(null)} title="艺术风格实验室">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {styles.map(s => {
            return (
              <div 
                key={s.id} 
                onClick={() => { 
                  // 自动切换等级锚点
                  if (s.pts === 'Master') setQuality('master');
                  else if (s.pts === 'HD+') setQuality('hd');
                  else setQuality('standard');

                  const applyStyle = (forceOverwrite = false) => {
                    setSelectedStyle(s);
                    if (s.recommendedRatio) setAspectRatio(s.recommendedRatio);
                    
                    // 覆盖提示词逻辑：
                    // 1. 强制覆盖 (用户在弹窗点确定)
                    // 2. 当前输入为空
                    // 3. 当前输入仍是模板占位符 (包含 【 )
                    if (forceOverwrite || !prompt.trim() || prompt.includes('【')) {
                      setPrompt(s.placeholder || '');
                    }
                    
                    setActiveDrawer(null);
                    if (refImageUrl && !s.requiresImage) {
                      const tip = document.createElement('div');
                      tip.innerHTML = '📸 当前带有参考图，生图将参考此图';
                      tip.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);color:white;padding:8px 16px;border-radius:20px;font-size:12px;z-index:10001;white-space:nowrap;pointer-events:none;animation:fadeUpDown 2s forwards;border:1px solid rgba(255,255,255,0.1);';
                      document.body.appendChild(tip);
                      setTimeout(() => tip.remove(), 2000);
                    }
                  };

                  const isCustomPrompt = prompt && prompt.trim() && !prompt.includes('【');
                  if (isCustomPrompt) {
                    if (window.confirm('是否应用新风格的提示词模版？这会覆盖您当前输入的内容。')) {
                      applyStyle(true);
                    } else {
                      // 用户取消覆盖：仅切换风格，保留原提示词，同步更新推荐比例
                      setSelectedStyle(s);
                      if (s.recommendedRatio) setAspectRatio(s.recommendedRatio);
                      setActiveDrawer(null);
                    }
                  } else {
                    applyStyle(false);
                  }                }} 
                style={{ 
                  padding: '16px', borderRadius: '20px', background: selectedStyle.id === s.id ? 'var(--primary-glow)' : '#fff',
                  border: selectedStyle.id === s.id ? '2px solid var(--primary)' : '1px solid #F2F2F7',
                  opacity: 1, position: 'relative'
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#1D1D1F' }}>{s.name}</div>
                <div style={{ fontSize: '10px', color: '#8E8E93', marginTop: '2px' }}>{s.desc}</div>
                {s.requiresImage && <div style={{ fontSize: '9px', color: 'var(--primary)', marginTop: '4px', fontWeight: '700' }}>需参考图</div>}
                {s.pts !== 'All' && <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '10px', background: s.pts === 'Master' ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{s.pts === 'Master' ? '旗舰' : '专业'}</div>}
              </div>
            );
          })}
        </div>
      </MobileDrawer>

      <MobileDrawer isOpen={activeDrawer === 'pro'} onClose={() => setActiveDrawer(null)} title="PRO 高级创作工具">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '800', marginBottom: '12px', color: '#1D1D1F' }}>1. 构图比例</div>
            <div style={{ display: 'flex', background: '#F2F2F7', padding: '4px', borderRadius: '14px' }}>
              {['1:1', '9:16', '16:9'].map(r => (
                <div 
                  key={r} 
                  onClick={() => setAspectRatio(r)}
                  style={{ 
                    flex: 1, textAlign: 'center', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: '700',
                    background: aspectRatio === r ? '#fff' : 'transparent', color: aspectRatio === r ? 'var(--primary)' : '#8E8E93',
                    boxShadow: aspectRatio === r ? '0 4px 10px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  {r}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: '14px', fontWeight: '800', marginBottom: '12px', color: '#1D1D1F' }}>2. 视觉参考图 (图生图)</div>
            <div 
              onClick={() => document.getElementById('mobile-ref-upload').click()}
              style={{ 
                height: '120px', borderRadius: '20px', border: '2px dashed #D1D1D6', background: '#F9F9FB',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
              }}
            >
              {refImageUrl ? (
                <img src={refImageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <>
                  <Images size={24} color="#8E8E93" style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '12px', color: '#8E8E93' }}>点击上传参考图片</div>
                </>
              )}
            </div>
            {refImageUrl && (
              <div onClick={() => setRefImageUrl('')} style={{ textAlign: 'center', marginTop: '8px', fontSize: '12px', color: '#ff4d4f', fontWeight: '700' }}>清除参考图</div>
            )}
            <input 
              id="mobile-ref-upload" type="file" accept="image/*" hidden 
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
        </div>
      </MobileDrawer>

      <MobileDrawer isOpen={activeDrawer === 'notes'} onClose={() => setActiveDrawer(null)} title="创作笔记">
        <div style={{ padding: '20px', background: '#F9F9FB', borderRadius: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)', marginBottom: '12px' }}>创作建议</div>
          <div style={{ 
            fontSize: '13px', color: '#444', lineHeight: '1.8', padding: '16px', background: '#fff', 
            borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)'
          }}>
            AI 已根据您选择的风格自动优化了画面的细节。如果您对结果不满意，可以尝试在提示词中增加更多的描述性形容词。
          </div>
        </div>
      </MobileDrawer>

      {/* 任务并发确认弹窗 (Mobile) */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: 'var(--primary-glow)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--primary)' }}>
              <Zap size={32} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>任务正在进行中</h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', marginBottom: '32px' }}>
              已有任务正在运行。您可以继续等待，或者选择<b>开启新任务</b>并行处理。
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => handleGenerate(true)} className="btn-primary" style={{ width: '100%' }}>开启新任务</button>
              <button onClick={() => setShowConfirmModal(false)} className="btn-secondary" style={{ width: '100%' }}>继续等待</button>
            </div>
          </div>
        </div>
      )}

      {/* 游客拦截弹窗 */}
      {showGuestModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎨</div>
            <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '12px' }}>开启艺术之旅</h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', marginBottom: '32px' }}>
              检测到您当前为游客模式。为了保存您的创作记录并获得更多免费积分，请先登录。
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => navigate('/auth')} className="btn-primary" style={{ width: '100%' }}>立即登录 / 注册</button>
              <button onClick={() => setShowGuestModal(false)} className="btn-secondary" style={{ width: '100%' }}>先随便逛逛</button>
            </div>
          </div>
        </div>
      )}

      {/* 移动端全屏预览 Modal */}
      {previewImage && (
        <div 
          style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', 
            zIndex: 10002, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setPreviewImage(null)}
        >
          {/* 顶部提示 */}
          <div style={{ position: 'absolute', top: '60px', color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 'bold', background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: '20px', backdropFilter: 'blur(10px)' }}>
             💡 长按图片即可保存到手机
          </div>

          <img 
            src={previewImage} 
            style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }} 
            onClick={(e) => e.stopPropagation()} 
            alt="Preview"
          />

          <button 
            onClick={() => setPreviewImage(null)}
            style={{ position: 'absolute', bottom: '60px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={24} />
          </button>

          {/* 邀请引导按钮 (New) */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              const url = `${window.location.origin}/register?invite=${userInfo?.uid}`;
              navigator.clipboard.writeText(url);
              alert('✨ 专属邀请链接已复制！分享给好友，成功推荐后您可获 10 积分奖励。');
            }}
            style={{ 
              position: 'absolute', bottom: '130px', 
              background: 'linear-gradient(135deg, #FF6B00 0%, #FF3D00 100%)',
              color: 'white', padding: '12px 24px', borderRadius: '24px',
              fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 10px 20px rgba(255, 61, 0, 0.3)',
              animation: 'scaleIn 0.3s ease-out'
            }}
          >
            <Share2 size={16} /> 分享并邀请好友 (获 10 积分)
          </div>
        </div>
      )}

      {/* 积分不足弹窗 */}
      {showPointsModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '64px', height: '64px', background: '#fff7e6', borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#faad14' 
            }}>
              <Coins size={32} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>积分余额不足</h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', marginBottom: '32px' }}>
              当前生成需要 <b style={{ color: '#C59C8F' }}>{requiredPoints}</b> 积分<br/>
              您的余额仅剩 <b style={{ color: '#faad14' }}>{userInfo?.points || 0}</b> 积分
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => navigate('/pricing')} className="btn-primary" style={{ width: '100%' }}>立即充值</button>
              <button onClick={() => setShowPointsModal(false)} className="btn-secondary" style={{ width: '100%' }}>稍后再说</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeUpDown { 
          0% { opacity: 0; transform: translate(-50%, -20px); }
          15% { opacity: 1; transform: translate(-50%, 0); }
          85% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -20px); }
        }
      `}} />
    </div>
  );
};

export default MobileHomePage;
