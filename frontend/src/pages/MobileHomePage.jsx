import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import request from '../api/request';
import { 
  Sparkles, Zap, Diamond, Crown, X, Download, ArrowUpCircle, Palette, Settings2, Award
} from 'lucide-react';
import MobileDrawer from '../components/MobileDrawer';

// 结果卡片组件
const ResultCard = ({ job, onOpenNotes }) => {
  const isMaster = job.quality === 'master';
  
  return (
    <div style={{
      width: '100%',
      background: '#fff',
      borderRadius: 'var(--radius-mobile)',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
      border: isMaster ? '1px solid rgba(138,43,226,0.1)' : '1px solid rgba(0,0,0,0.02)',
      position: 'relative',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      {/* 提示词区 */}
      <div style={{ 
        padding: '12px 16px', 
        fontSize: '13px', 
        color: 'var(--text-secondary)', 
        background: '#FAFAFB',
        borderBottom: '1px solid rgba(0,0,0,0.02)'
      }}>
        {job.prompt}
      </div>

      {/* 图像显示/生成区 */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#F2F2F7', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {job.status === 'success' ? (
          <div style={{ width: '100%', position: 'relative' }}>
            <img src={job.result} alt="AI Result" style={{ width: '100%', display: 'block' }} />
            {isMaster && (
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(138, 43, 226, 0.9)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                 <Sparkles size={10} /> 大师版 ✦
              </div>
            )}
            {isMaster && (
              <div 
                onClick={() => onOpenNotes(job)}
                style={{ position: 'absolute', bottom: '12px', right: '12px', width: '40px', height: '40px', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--master)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', cursor: 'pointer' }}
              >
                <Award size={22} />
              </div>
            )}
            <a href={job.result} download style={{ position: 'absolute', bottom: '12px', left: '12px', width: '40px', height: '40px', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              <Download size={20} />
            </a>
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
  const [selectedStyle, setSelectedStyle] = useState({ id: 'default', name: '默认风格' });
  const [pricingMap, setPricingMap] = useState({ 'standard': 5, 'hd': 15, 'master': 30 });

  useEffect(() => {
    fetchConfig();
  }, []);

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
    { id: 'default', name: '默认风格', desc: '原生艺术呈现', icon: '✨', pts: 'All' },
    { id: 'real', name: '极致写实', desc: '4K 相机级质感', icon: '📷', pts: 'All' },
    { id: 'anime', name: '二次元', desc: '番剧级光影', icon: '🌸', pts: 'HD+' },
    { id: 'oil', name: '古典油画', desc: '大师笔触复刻', icon: '🎨', pts: 'HD+' },
    { id: 'cyber', name: '赛博朋克', desc: '霓虹幻境', icon: '🌆', pts: 'HD+' },
    { id: '3d', name: '3D 渲染', desc: 'C4D 极致建模', icon: '🧊', pts: 'HD+' },
    { id: 'ink', name: '水墨中国', desc: '东方韵味', icon: '🖌️', pts: 'HD+' },
    { id: 'poster', name: '极简海报', desc: '排版美学', icon: '📐', pts: 'HD+' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    const newJob = { id: Date.now().toString(), prompt, quality, status: 'pending', progress: 0 };
    setJobs(prev => [...prev, newJob]);
    setPrompt('');
    try {
      const res = await request.post('/image/generate', { 
        prompt: prompt, quality: quality, style: selectedStyle.id !== 'default' ? selectedStyle.id : undefined
      });
      const taskId = res.id;
      const pollTimer = setInterval(async () => {
        try {
          const statusRes = await request.get(`/image/status/${taskId}`);
          setJobs(prev => prev.map(j => {
            if (j.id === newJob.id) {
              if (statusRes.status === 'success') { clearInterval(pollTimer); return { ...j, status: 'success', progress: 100, result: statusRes.image_url }; }
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-main)' }}>
      <main ref={stackRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {jobs.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ccc', marginTop: '15vh' }}>
            <Sparkles size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>开启您的创作之旅</p>
          </div>
        ) : (
          jobs.map(job => <ResultCard key={job.id} job={job} onOpenNotes={() => setActiveDrawer('notes')} />)
        )}
      </main>

      <div style={{ padding: '16px 16px 24px', background: 'linear-gradient(to top, var(--bg-main) 60%, transparent)' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <div onClick={() => setActiveDrawer('tier')} style={{ padding: '10px 14px', background: quality === 'master' ? 'var(--master)' : 'var(--primary)', color: 'white', borderRadius: '14px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {quality === 'master' ? <Sparkles size={14} /> : <Zap size={14} />}
            {quality === 'master' ? '大师版 ✦' : quality === 'hd' ? '高清版' : '标准版'}
          </div>
          <div onClick={() => setActiveDrawer('style')} style={{ padding: '10px 14px', background: '#fff', borderRadius: '14px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(0,0,0,0.03)' }}>
            <Palette size={14} /> {selectedStyle.name}
          </div>
        </div>
        <div style={{ background: '#fff', height: '56px', borderRadius: '28px', display: 'flex', alignItems: 'center', padding: '0 8px 0 20px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
          <input type="text" placeholder="描述你的灵感画面..." value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleGenerate()} style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px' }} />
          <button onClick={handleGenerate} disabled={!prompt.trim()} style={{ width: '44px', height: '44px', background: quality === 'master' ? 'var(--master)' : 'var(--primary)', borderRadius: '50%', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowUpCircle size={24} />
          </button>
        </div>
      </div>

      <MobileDrawer isOpen={activeDrawer === 'tier'} onClose={() => setActiveDrawer(null)} title="选择创作模式">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { id: 'standard', name: '标准版', desc: '快速捕捉灵感', pts: pricingMap.standard, color: 'var(--primary)', icon: <Zap size={18} /> },
            { id: 'hd', name: '高清版', desc: '细节质感升级', pts: pricingMap.hd, color: '#3b82f6', icon: <Diamond size={18} /> },
            { id: 'master', name: '大师版 ✦', desc: '电影级光影重构', pts: pricingMap.master, color: 'var(--master)', icon: <Sparkles size={18} /> }
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
            const isLocked = quality === 'standard' && s.id !== 'default' && s.id !== 'real';
            return (
              <div 
                key={s.id} 
                onClick={() => { if(!isLocked) { setSelectedStyle(s); setActiveDrawer(null); } }} 
                style={{ 
                  padding: '16px', borderRadius: '20px', background: selectedStyle.id === s.id ? 'var(--primary-glow)' : '#fff',
                  border: selectedStyle.id === s.id ? '2px solid var(--primary)' : '1px solid #F2F2F7',
                  opacity: isLocked ? 0.5 : 1, position: 'relative'
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#1D1D1F' }}>{s.name}</div>
                <div style={{ fontSize: '10px', color: '#8E8E93', marginTop: '2px' }}>{s.desc}</div>
                {isLocked && <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '10px', background: '#eee', padding: '2px 6px', borderRadius: '6px' }}>🔒</div>}
              </div>
            );
          })}
        </div>
      </MobileDrawer>

      <MobileDrawer isOpen={activeDrawer === 'notes'} onClose={() => setActiveDrawer(null)} title="大师级创作笔记">
        <div style={{ color: '#444', fontSize: '14px', lineHeight: '1.8', padding: '20px', background: '#F9F9FB', borderRadius: '20px' }}>
          大师引擎已为您自动增强了画面的光影对比。
        </div>
      </MobileDrawer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
};

export default MobileHomePage;
