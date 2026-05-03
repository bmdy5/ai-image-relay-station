import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import request from '../api/request';
import { 
  Sparkles, Zap, Diamond, Crown, X, Download, ArrowUpCircle, Palette, Settings2, Award, Images, Plus, ArrowUp, Maximize2
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
const ResultCard = ({ job, onOpenNotes, onPreview }) => {
  const isMaster = job.quality === 'master';
  const qName = QUALITY_NAME_MAP[job.quality] || '标准版';
  const sName = STYLE_NAME_MAP[job.style] || '默认';
  
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
          <div style={{ width: '100%', position: 'relative' }} onClick={() => onPreview(job.result)}>
            <img src={job.result} alt="AI Result" style={{ width: '100%', display: 'block' }} />
            {isMaster && (
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(138, 43, 226, 0.9)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                 <Sparkles size={10} /> 大师版 ✦
              </div>
            )}
            <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '40px', height: '40px', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
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
  const [jobs, setJobs] = useState([]); 
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState({ id: 'default', name: '默认风格', desc: '原生艺术呈现', icon: '✨', pts: 'All', placeholder: '主题：【在此输入你想生成的画面】' });
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [refImageUrl, setRefImageUrl] = useState('');
  const [pricingMap, setPricingMap] = useState({ 'standard': 5, 'hd': 15, 'master': 30 });
  const [selectedJob, setSelectedJob] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [enhancing, setEnhancing] = useState(false);
  const [historyPrompt, setHistoryPrompt] = useState('');

  
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
    fetchConfig();
    checkPendingPrompt();
  }, []);

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
    // --- 基础梯队 ---
    { id: 'default', name: '默认风格', desc: '原生艺术呈现', icon: '✦', pts: 'All', placeholder: '主题：【在此输入你想生成的画面】' },
    { id: 'real', name: '极致写实', desc: '仿真现实模拟', icon: '📸', pts: 'All', placeholder: '主题：【在此输入人像或画面，支持多样化构图生成】' },
    { id: 'product', name: '商业大片', desc: '设计师级商业海报质感', icon: '🛒', pts: 'All', placeholder: '产品名称：【在此输入产品名称】' },
    { id: 'tech_poster', name: '科技海报', desc: '高级感信息排版', icon: '🎨', pts: 'All', placeholder: '海报主题：【在此输入科技主题】' },
    { id: 'travel_guide', name: '旅游攻略', desc: '手绘旅行手账', icon: '🧭', pts: 'All', placeholder: '目的地 @ 天数：【如：大理 @ 3】' },

    // --- 专业梯队 ---
    { id: 'travel', name: '旅游海报', desc: '高阶旅行杂志封面', icon: '✈️', pts: 'HD+', placeholder: '灵感：【如：京都极简小巷、霓虹下的东京、海岛日落】 氛围：【如：复古排版、莫兰迪色调】' },
    { id: 'interior', name: '室内设计', desc: '空间重构方案', icon: '🛋️', pts: 'HD+', placeholder: '装修风格：【在此输入风格】', requiresImage: true },
    { id: 'live_stream', name: '直播截图', desc: '还原带货现场', icon: '📡', pts: 'HD+', placeholder: '直播内容：【在此输入直播内容】', requiresImage: true },
    { id: 'vintage_5s', name: '复古纪实', desc: 'iPhone 5s 怀旧', icon: '🎞️', pts: 'HD+', placeholder: '拍摄环境：【如：90年代香港中环、午后老街】', requiresImage: true },
    { id: 'ccd_snap', name: 'CCD 随手抓拍', desc: '闪光灯氛围', icon: '⚡', pts: 'HD+', placeholder: '人物：【在此输入，支持多样化构图】 环境：【如：深夜旺角街头、雨夜霓虹】', requiresImage: true },
    { id: 'restore_old', name: '老照片修复', desc: '质感修复与高清还原', icon: '🕰️', pts: 'HD+', placeholder: '描述照片背景或需要重点修复的细节（可选）', requiresImage: true },

    // --- 旗舰梯队 ---
    { id: 'eri_silhouette', name: '轮廓宇宙', desc: '史诗级叙事海报', icon: '🌑', pts: 'Master', placeholder: '叙事主题：【在此输入主题】' },
    { id: 'silk_road', name: '国风月夜', desc: '宋代山水意境', icon: '🎋', pts: 'Master', placeholder: '主题：【在此输入主题名称】' },
    { id: 'relation_map', name: '人物关系图谱', desc: '作品逻辑梳理', icon: '🕸️', pts: 'Master', placeholder: '作品：【在此输入名称】' },
    { id: 'encyclopedia', name: '科普百科', desc: '图鉴模块化卡片', icon: '🏮', pts: 'Master', placeholder: '百科对象：【在此输入】' },
    { id: 'ui_upgrade', name: 'UI 视觉进化', desc: '草图/截图一键转高保真大厂设计', icon: '🪟', pts: 'Master', placeholder: '💡 UI 进化模式：无需输入文字。请直接上传您的 UI 截图或草图，点击“开始创作”，系统将自动分析并重构。', requiresImage: true }
  ];

  // AI 润色白名单 (Task: Strict Whitelist)
  const ALLOWED_ENHANCE_STYLES = ['default', 'real', 'product', 'tech_poster'];

  const handleGenerate = async () => {
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
        ref_image_url: refImageUrl
      });
      const taskId = res.id;
      
      const tip = document.createElement('div');
      tip.innerHTML = '✨ 任务已进入后台，您可以继续创作（支持 3 路并行）';
      tip.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);color:white;padding:8px 16px;border-radius:20px;font-size:12px;z-index:10001;white-space:nowrap;pointer-events:none;animation:fadeUpDown 3s forwards;border:1px solid rgba(255,255,255,0.1);';
      document.body.appendChild(tip);
      setTimeout(() => tip.remove(), 3000);

      const pollTimer = setInterval(async () => {
        try {
          const statusRes = await request.get(`/image/status/${taskId}`);
          setJobs(prev => prev.map(j => {
            if (j.id === newJob.id) {
              if (statusRes.status === 'success') { 
                clearInterval(pollTimer); 
                return { 
                    ...j, 
                    status: 'success', 
                    progress: 100, 
                    result: statusRes.image_url, 
                    ref_image_url: statusRes.ref_image_url, // 同步参考图
                    quality: statusRes.quality,           // 同步档次
                    style: statusRes.style,               // 同步风格
                    final_prompt: statusRes.final_prompt 
                }; 
              }
              else if (statusRes.status === 'failed') { clearInterval(pollTimer); return { ...j, status: 'failed', error: statusRes.error }; }
              return { ...j, status: statusRes.status, progress: Math.min(j.progress + 5, 95) };
            }
            return j;
          }));
        } catch (err) { clearInterval(pollTimer); }
      }, 3000);
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
          </div>
        ) : (
          jobs.map(job => (
            <ResultCard 
              key={job.id} 
              job={job} 
              onOpenNotes={(j) => { setSelectedJob(j); setActiveDrawer('notes'); }} 
              onPreview={(img) => setPreviewImage(img)}
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

        <div 
          className={enhancing ? 'ai-enhancing-border' : ''}
          style={{ 
            background: enhancing ? 'transparent' : 'rgba(255, 255, 255, 0.8)', 
            backdropFilter: 'blur(20px)',
            height: '56px', borderRadius: '28px', display: 'flex', alignItems: 'center', padding: enhancing ? '0' : '0 8px 0 12px', 
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
              onClick={() => { setQuality(t.id); setActiveDrawer(null); }}
              style={{ 
                padding: '16px', borderRadius: '18px', border: quality === t.id ? `2px solid ${t.color}` : '2px solid #F2F2F7', 
                background: quality === t.id ? `${t.color}08` : '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', background: '#F2F2F7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.color }}>{t.icon}</div>
                <div><b style={{ fontSize: '15px' }}>{t.name}</b><div style={{ fontSize: '11px', color: '#999' }}>{t.desc}</div></div>
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
            let isLocked = false;
            if (quality === 'standard') {
              isLocked = s.pts !== 'All';
            } else if (quality === 'hd') {
              isLocked = s.pts === 'Master';
            }
            return (
              <div 
                key={s.id} 
                onClick={() => { 
                  if(!isLocked) { 
                    const applyStyle = () => {
                      setSelectedStyle(s);
                      if (s.placeholder && (!prompt || prompt.includes('【'))) {
                        setPrompt(s.placeholder);
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

                    if (prompt && prompt !== s.placeholder && !prompt.includes('【')) {
                      if (window.confirm('是否应用新风格的提示词模版？这会覆盖您当前输入的内容。')) {
                        applyStyle();
                      } else {
                        setSelectedStyle(s);
                        setActiveDrawer(null);
                      }
                    } else {
                      applyStyle();
                    }
                  } 
                }} 
                style={{ 
                  padding: '16px', borderRadius: '20px', background: selectedStyle.id === s.id ? 'var(--primary-glow)' : '#fff',
                  border: selectedStyle.id === s.id ? '2px solid var(--primary)' : '1px solid #F2F2F7',
                  opacity: isLocked ? 0.5 : 1, position: 'relative'
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#1D1D1F' }}>{s.name}</div>
                <div style={{ fontSize: '10px', color: '#8E8E93', marginTop: '2px' }}>{s.desc}</div>
                {s.requiresImage && <div style={{ fontSize: '9px', color: 'var(--primary)', marginTop: '4px', fontWeight: '700' }}>需参考图</div>}
                {isLocked && <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '10px', background: '#eee', padding: '2px 6px', borderRadius: '6px' }}>🔒</div>}
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
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
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
