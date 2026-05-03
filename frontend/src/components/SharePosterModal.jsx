import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Share2, Palette, Sparkles, Layout, Camera } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import request from '../api/request';

const SharePosterModal = ({ imageLog, userInfo, onClose }) => {
  const [activeTemplate, setActiveTemplate] = useState('minimal');
  const [generating, setGenerating] = useState(false);
  const [posterImage, setPosterImage] = useState(null);
  const posterRef = useRef(null);

  const templates = [
    { id: 'minimal', name: '极简艺术', icon: <Layout size={16} /> },
    { id: 'cyber', name: '未来科技', icon: <Sparkles size={16} /> },
    { id: 'vintage', name: '复古画框', icon: <Camera size={16} /> },
  ];

  const inviteUrl = `${window.location.origin}/register?invite=${userInfo?.uid}`;

  // 合成海报
  const generatePoster = async () => {
    if (!posterRef.current) return;
    setGenerating(true);
    try {
      // 增加延时确保图片加载完成
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(posterRef.current, {
        useCORS: true,
        scale: 2, // 提升清晰度
        backgroundColor: null,
      });
      
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      setPosterImage(dataUrl);
      
      // 记录分享行为
      if (imageLog?.id) {
        await request.post(`/image/${imageLog.id}/share`);
      }
    } catch (err) {
      console.error('海报合成失败:', err);
      alert('合成失败，请尝试长按原图保存');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    setPosterImage(null);
    generatePoster();
  }, [activeTemplate]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px', overflowY: 'auto'
    }}>
      {/* 头部控制栏 */}
      <div style={{ width: '100%', maxWidth: '400px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '800' }}>分享作品</h3>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%' }}>
          <X size={20} />
        </button>
      </div>

      {/* 模版切换器 */}
      <div style={{ 
        display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.1)', 
        padding: '6px', borderRadius: '20px', marginBottom: '24px' 
      }}>
        {templates.map(t => (
          <div 
            key={t.id}
            onClick={() => setActiveTemplate(t.id)}
            style={{
              padding: '8px 16px', borderRadius: '16px', fontSize: '13px', fontWeight: '700',
              cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', gap: '6px',
              background: activeTemplate === t.id ? 'white' : 'transparent',
              color: activeTemplate === t.id ? '#000' : '#fff'
            }}
          >
            {t.icon} {t.name}
          </div>
        ))}
      </div>

      {/* 海报预览/合成容器 */}
      <div style={{ position: 'relative', width: '320px', height: '540px', marginBottom: '30px' }}>
        {/* 隐藏的合成源 (实际渲染区域) */}
        <div 
          ref={posterRef}
          style={{
            width: '320px', height: '540px',
            position: 'absolute', top: 0, left: 0,
            zIndex: 1, overflow: 'hidden',
            borderRadius: '24px',
            ...getTemplateStyle(activeTemplate)
          }}
        >
          {/* 主图区 */}
          <div style={{ width: '100%', height: '400px', overflow: 'hidden', ...getImageContainerStyle(activeTemplate) }}>
            <img 
              src={imageLog?.image_url} 
              crossOrigin="anonymous" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              alt="Poster Main"
            />
          </div>

          {/* 信息底部 */}
          <div style={{ 
            padding: '24px', flex: 1, display: 'flex', 
            justifyContent: 'space-between', alignItems: 'flex-end',
            ...getFooterStyle(activeTemplate)
          }}>
            <div style={{ flex: 1, marginRight: '16px' }}>
              <div style={{ 
                fontSize: '12px', fontWeight: '800', opacity: 0.7, 
                marginBottom: '6px', ...getTextStyle(activeTemplate) 
              }}>
                VISIONARY AI 创作
              </div>
              <div style={{ 
                fontSize: '15px', fontWeight: '800', lineHeight: '1.4', 
                ...getTextStyle(activeTemplate) 
              }}>
                扫描左侧二维码 <br/>
                领取 <span style={{ color: '#FF6B00' }}>5 积分</span> 开启创作
              </div>
            </div>
            
            <div style={{ 
              padding: '6px', background: 'white', borderRadius: '12px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
            }}>
              <QRCodeCanvas value={inviteUrl} size={64} level="H" />
            </div>
          </div>
          
          {/* 水印装饰 */}
          {activeTemplate === 'cyber' && <CyberDecorations />}
          {activeTemplate === 'vintage' && <VintageOverlay />}
        </div>

        {/* 覆盖层：合成后的图片 (供用户长按) */}
        {posterImage && !generating && (
          <img 
            src={posterImage} 
            style={{ 
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
              zIndex: 10, borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' 
            }} 
            alt="Final Poster"
          />
        )}

        {generating && (
          <div style={{ 
            position: 'absolute', inset: 0, zIndex: 20, 
            background: 'rgba(0,0,0,0.4)', borderRadius: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
          }}>
            <div className="loading-spin">
              <Sparkles size={32} />
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '13px', maxWidth: '300px' }}>
        提示：生成的图片支持浏览器功能保存。<br/>
        <b>长按海报图片即可直接保存或发送给好友。</b>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .loading-spin {
          animation: loading-spin 1s linear infinite;
        }
      `}} />
    </div>
  );
};

// 模版样式计算
const getTemplateStyle = (id) => {
  if (id === 'minimal') return { background: '#FFFFFF', display: 'flex', flexDirection: 'column' };
  if (id === 'cyber') return { background: '#0A0A0A', display: 'flex', flexDirection: 'column' };
  if (id === 'vintage') return { background: '#F8F4ED', display: 'flex', flexDirection: 'column' };
  return {};
};

const getImageContainerStyle = (id) => {
  if (id === 'minimal') return { padding: '20px 20px 0 20px', borderRadius: '0' };
  if (id === 'vintage') return { padding: '24px 24px 0 24px', borderBottom: '1px solid #E5E1D8' };
  return {};
};

const getFooterStyle = (id) => {
  if (id === 'cyber') return { background: 'linear-gradient(to top, #1A1A1A, #0A0A0A)' };
  return {};
};

const getTextStyle = (id) => {
  if (id === 'cyber') return { color: '#FFFFFF' };
  if (id === 'minimal') return { color: '#333333' };
  if (id === 'vintage') return { color: '#5D574F', fontFamily: 'serif' };
  return {};
};

const CyberDecorations = () => (
  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
    <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '10px', color: '#00F2FF', opacity: 0.5 }}>SYS.IMAGE_GEN.2024</div>
    <div style={{ position: 'absolute', bottom: '110px', left: '24px', width: '40px', height: '2px', background: '#00F2FF' }}></div>
  </div>
);

const VintageOverlay = () => (
  <div style={{ 
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
    pointerEvents: 'none', background: 'radial-gradient(circle, transparent 70%, rgba(0,0,0,0.05) 100%)' 
  }}>
    <div style={{ position: 'absolute', top: '350px', left: '40px', fontSize: '11px', color: '#888', opacity: 0.5, fontStyle: 'italic' }}>Shot on Visionary Lens</div>
  </div>
);

export default SharePosterModal;
