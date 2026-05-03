import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import request, { logout } from '../api/request';
import { 
  Images, Coins, ShieldCheck, User, LogOut, Search, X, RefreshCw, 
  Download, ClipboardCopy, RotateCcw, Sparkles, ArrowLeft, Trash2, Maximize2, Wand2
} from 'lucide-react';

import MobileDrawer from '../components/MobileDrawer';
import './HistoryPage.css';

const HistoryPage = ({ isMobile }) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const LIMIT = 20;


  useEffect(() => {
    fetchUserInfo();
    const timer = setTimeout(() => {
      fetchHistory(false, keyword);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  const fetchUserInfo = async () => {
    try {
      const data = await request.get('/auth/me');
      setUserInfo(data);
    } catch (err) {}
  };

  const fetchHistory = async (isLoadMore = false, searchKeyword = keyword) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);
    try {
      const currentSkip = isLoadMore ? skip + LIMIT : 0;
      const url = `/image/history?skip=${currentSkip}&limit=${LIMIT}${searchKeyword ? `&keyword=${encodeURIComponent(searchKeyword)}` : ''}`;
      const data = await request.get(url);
      if (isLoadMore) {
        setImages(prev => [...prev, ...data]);
        setSkip(currentSkip);
      } else {
        setImages(data);
        setSkip(0);
      }
      setHasMore(data.length === LIMIT);
    } catch (err) {
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleDownload = async (img) => {
    if (!img.image_url) return;
    setDownloading(true);
    try {
      const response = await fetch(img.image_url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `creation_${img.id}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      window.open(img.image_url, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const handleReuse = (img) => {
    sessionStorage.setItem('pending_reuse', JSON.stringify({
      prompt: img.prompt,
      style: img.style,
      quality: img.quality,
      ref_image_url: img.ref_image_url
    }));
    navigate('/');
  };

  const handleRefine = (img) => {
    const maxRefines = img.quality === 'master' ? 3 : (img.quality === 'hd' ? 2 : 0);
    if (maxRefines === 0) {
      alert('⚠️ 标准版暂不支持迭代精修，请升级专业版或旗舰版');
      return;
    }

    sessionStorage.setItem('pending_reuse', JSON.stringify({
      prompt: img.prompt,
      style: img.style,
      quality: img.quality,
      ref_image_url: img.image_url, // 注意：微调是基于生成后的图片
      parent_id: img.id,
      root_id: img.root_id || img.id, // 传递根 ID
      iteration: (img.iteration || 0) + 1,
      is_refining: true
    }));
    navigate('/');
  };


  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('确定删除吗？')) return;
    try {
      await request.delete(`/image/${id}`);
      setImages(prev => prev.filter(img => img.id !== id));
      if (selectedImage?.id === id) setSelectedImage(null);
    } catch (err) {
      alert('删除失败');
    }
  };

  const getFeatureLabel = (img) => {
    const qMap = { 'standard': '标准', 'hd': '高清', 'master': '大师' };
    const sMap = { 
      'real': '极致写实', 'anime': '二次元', 'oil': '油画', 
      'cyber': '赛博', '3d': '3D渲染', 'ink': '水墨', 'poster': '海报',
      'default': '默认', 'product': '电商白底', 'tech_poster': '科技海报',
      'travel': '旅游海报', 'interior': '室内设计', 'live_stream': '直播截图',
      'eri_silhouette': '侧脸叙事', 'silk_road': '丝绸山河', 'vintage_5s': '复古纪实',
      'relation_map': '关系图谱', 'encyclopedia': '科普百科', '': '默认'
    };
    const q = qMap[img.quality] || '标准';
    const s = sMap[img.style] || '默认';
    return `${q}版 - ${s}`;
  };

  const MobileDetailDrawer = () => (
    <MobileDrawer isOpen={!!selectedImage && isMobile} onClose={() => setSelectedImage(null)} title="作品详情">
      {selectedImage && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div onClick={() => setPreviewImage(selectedImage.image_url)} style={{ position: 'relative' }}>
            <img src={selectedImage.image_url} alt="Preview" style={{ width: '100%', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} />
            <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(255,255,255,0.8)', padding: '8px', borderRadius: '50%', color: 'var(--primary)' }}>
               <Maximize2 size={16} />
            </div>
          </div>

          
          {/* 参考图展示 (Mobile) */}
          {selectedImage.ref_image_url && (
             <div style={{ background: '#f5f5f7', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }}>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>创作参考图</div>
                <img src={selectedImage.ref_image_url} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} alt="Ref" />
             </div>
          )}

          <div style={{ background: '#F2F2F7', padding: '16px', borderRadius: '16px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '12px', color: '#8E8E93' }}>提示词 (Prompt)</div>
              <div style={{ 
                fontSize: '10px', 
                color: selectedImage.quality === 'master' ? 'var(--master)' : '#8E8E93',
                background: selectedImage.quality === 'master' ? 'rgba(124, 77, 255, 0.1)' : 'rgba(0,0,0,0.05)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: '800'
              }}>
                {selectedImage.quality === 'master' && '✦ '}{getFeatureLabel(selectedImage)}
              </div>
            </div>
            <div style={{ fontSize: '14px', color: '#1D1D1F', lineHeight: '1.6' }}>{selectedImage.prompt}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => handleRefine(selectedImage)} style={{ flex: 1, padding: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, #e66b33, #ff9800)', color: 'white', border: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(230,107,51,0.2)' }}>
              <Wand2 size={18} /> 基于此图迭代精修
            </button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => handleReuse(selectedImage)} style={{ flex: 2, padding: '16px', borderRadius: '16px', background: '#F2F2F7', color: '#1D1D1F', border: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><RotateCcw size={18} /> 复用环境</button>
              <button onClick={() => handleDownload(selectedImage)} style={{ flex: 1, padding: '16px', borderRadius: '16px', background: '#F2F2F7', color: '#1D1D1F', border: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Download size={18} /></button>
            </div>
          </div>
          <button onClick={(e) => handleDelete(e, selectedImage.id)} style={{ padding: '12px', background: 'transparent', border: 'none', color: '#FF3B30', fontSize: '13px', fontWeight: '600' }}>删除此作品</button>
        </div>
      )}
    </MobileDrawer>
  );

  return (
    <div className="history-container" style={isMobile ? { paddingBottom: '100px' } : {}}>
      <main>
        <div style={{ marginTop: isMobile ? '20px' : '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '800', marginBottom: '8px' }}>我的创作</h1>
            {!isMobile && <p style={{ color: '#666', fontSize: '14px' }}>回溯您的艺术灵感，管理已生成的精美图片。</p>}
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="search-box" style={isMobile ? { width: '44px', padding: 0, justifyContent: 'center', border: 'none', background: '#F2F2F7' } : {}}>
              <span className="search-icon"><Search size={isMobile ? 20 : 16} /></span>
              {!isMobile && <input type="text" placeholder="搜索提示词..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />}
            </div>
            {!isMobile && <button className="btn-primary" onClick={() => navigate('/')}><Sparkles size={18} /> 开始新创作</button>}
          </div>
        </div>

        {loading ? (
          <div className="gallery-grid">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="gallery-item skeleton" style={{ height: '200px' }}></div>)}
          </div>
        ) : images.length > 0 ? (
          <>
            <div className="gallery-grid">
              {images.map(img => (
                <div key={img.id} className={`gallery-item ${img.status !== 'success' ? 'is-loading' : ''}`} onClick={() => img.status === 'success' && setSelectedImage(img)}>
                   <button 
                     className="delete-btn-quick" 
                     onClick={(e) => handleDelete(e, img.id)}
                     title="删除此作品"
                   >
                     <Trash2 size={16} />
                   </button>

                   {img.status === 'success' ? (
                     <img src={img.image_url} alt={img.prompt} style={{ width: '100%', objectFit: 'cover' }} />
                   ) : img.status === 'failed' ? (
                     <div className="pending-card" style={{ background: '#fff1f0', border: '1px dashed #ff4d4f' }}>
                       <X size={32} color="#ff4d4f" style={{ opacity: 0.5 }} />
                       <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '10px', fontWeight: 'bold' }}>生成失败</div>
                     </div>
                   ) : (
                     <div className="pending-card">
                       <div className="skeleton" style={{ position: 'absolute', inset: 0, opacity: 0.5 }}></div>
                       <RefreshCw className="spin" size={32} color="var(--primary)" style={{ opacity: 0.5, position: 'relative' }} />
                       <div className="pulse-text" style={{ position: 'relative' }}>AI 创作中...</div>
                     </div>
                   )}
                   
                   {!isMobile && (
                     <div className="gallery-info">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                             <div className="gallery-prompt" style={{ flex: 1, fontSize: '12px', color: '#1D1D1F', fontWeight: '500', lineHeight: '1.4' }}>{img.prompt}</div>
                             <div style={{ 
                               fontSize: '9px', 
                               color: img.quality === 'master' ? 'var(--master)' : '#8E8E93', 
                               background: img.quality === 'master' ? 'rgba(124, 77, 255, 0.08)' : 'rgba(0,0,0,0.04)',
                               padding: '2px 6px',
                               borderRadius: '4px',
                               fontWeight: '700',
                               whiteSpace: 'nowrap',
                               flexShrink: 0
                             }}>
                               {img.quality === 'master' && '✦ '}{getFeatureLabel(img)}
                             </div>
                           </div>
                           
                           {/* 参考图微缩预览 (New) */}
                           {img.ref_image_url && (
                             <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.03)', padding: '4px 8px', borderRadius: '8px' }}>
                               <img src={img.ref_image_url} style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #eee' }} alt="Ref" />
                               <span style={{ fontSize: '10px', color: '#888', fontWeight: '600' }}>参考原图</span>
                             </div>
                           )}
                        </div>
                        <button className="reuse-btn-mini" onClick={(e) => { e.stopPropagation(); handleReuse(img); }}>复用</button>
                     </div>
                   )}
                </div>
              ))}
            </div>
            {hasMore && (
              <div style={{ textAlign: 'center', margin: '40px 0' }}>
                <button className="btn-primary" style={{ background: '#F2F2F7', color: '#1D1D1F', border: 'none' }} onClick={() => fetchHistory(true)} disabled={loadingMore}>
                  {loadingMore ? '加载中...' : '加载更多'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#999' }}>
            <Sparkles size={48} style={{ opacity: 0.2, marginBottom: '20px' }} />
            <p>暂无创作记录</p>
          </div>
        )}
      </main>

      <MobileDetailDrawer />

      {/* 图片全屏预览 Portal (通用逻辑) */}
      {previewImage && createPortal(
        <div 
          style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', 
            zIndex: 20000, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out',
            backdropFilter: 'blur(20px)'
          }}
          onClick={() => setPreviewImage(null)}
        >
          {/* 只有移动端显示保存提示 */}
          {isMobile && (
            <div style={{ position: 'absolute', top: '60px', color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 'bold', background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: '20px', backdropFilter: 'blur(10px)' }}>
               💡 长按图片即可保存到手机
            </div>
          )}

          <img 
            src={previewImage} 
            style={{ maxWidth: '95vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }} 
            onClick={(e) => e.stopPropagation()} 
            alt="Preview" 
          />

          <button 
            onClick={() => setPreviewImage(null)}
            style={{ position: 'absolute', bottom: '60px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={28} />
          </button>
        </div>,
        document.body
      )}

      {/* PC 端专业详情弹窗 (Lightroom 风格) */}
      {!isMobile && selectedImage && createPortal(
        <div 
          style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', 
            backdropFilter: 'blur(20px)', zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div 
            style={{ 
              width: '95vw', maxWidth: '1200px', height: '85vh',
              background: '#1c1c1e', borderRadius: '24px', overflow: 'hidden',
              display: 'flex', boxShadow: '0 50px 150px rgba(0,0,0,0.9)',
              animation: 'modalZoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* 左侧：画廊展示区 */}
            <div style={{ flex: 1, position: 'relative', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
               <img 
                 src={selectedImage.image_url} 
                 style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                 alt="Main creation" 
               />
               <div style={{ position: 'absolute', top: '24px', left: '24px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', letterSpacing: '2px', fontWeight: '800' }}>
                 PREVIEW · VISIONARY ART
               </div>
            </div>

            {/* 右侧：信息面板区 */}
            <div style={{ width: '360px', flexShrink: 0, display: 'flex', flexDirection: 'column', background: '#1c1c1e', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
              {/* 顶部标题区 */}
              <div style={{ padding: '32px 32px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ color: 'var(--primary)', fontWeight: '900', fontSize: '11px', letterSpacing: '1px', background: 'rgba(230,107,51,0.1)', padding: '4px 12px', borderRadius: '20px' }}>
                    {getFeatureLabel(selectedImage).toUpperCase()}
                  </div>
                  <button onClick={() => setSelectedImage(null)} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' }}><X size={20} /></button>
                </div>
                <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>作品详情</h3>
              </div>

              {/* 中间滚动区 */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 32px 32px' }}>
                {/* 提示词卡片 */}
                <div style={{ marginTop: '24px' }}>
                  <div style={{ color: '#666', fontSize: '11px', fontWeight: '800', marginBottom: '12px', letterSpacing: '1px' }}>PROMPT 提示词</div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', lineHeight: '1.8', wordBreak: 'break-all' }}>
                    {selectedImage.prompt}
                  </div>
                </div>

                {/* 参考图卡片 */}
                {selectedImage.ref_image_url && (
                  <div style={{ marginTop: '32px' }}>
                    <div style={{ color: '#666', fontSize: '11px', fontWeight: '800', marginBottom: '12px', letterSpacing: '1px' }}>SOURCE REFERENCE 灵感参考</div>
                    <div 
                      onClick={() => setPreviewImage(selectedImage.ref_image_url)}
                      style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', cursor: 'zoom-in', transition: 'transform 0.3s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <img src={selectedImage.ref_image_url} style={{ width: '100%', height: '180px', objectFit: 'cover' }} alt="Reference" />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', display: 'flex', alignItems: 'flex-end', padding: '12px' }}>
                        <div style={{ color: '#fff', fontSize: '11px', fontWeight: '700' }}>点击全屏查看</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 底部操作区 */}
              <div style={{ padding: '32px', background: '#1c1c1e', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button 
                  onClick={() => handleRefine(selectedImage)} 
                  className="btn-primary" 
                  style={{ width: '100%', height: '50px', background: 'linear-gradient(135deg, #e66b33, #ff9800)', color: '#fff', borderRadius: '14px', fontSize: '15px', fontWeight: '900', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                  <Wand2 size={20} /> 开启迭代精修 (Variation)
                </button>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => handleReuse(selectedImage)} 
                    className="btn-primary" 
                    style={{ flex: 1, height: '50px', background: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: '14px', fontSize: '15px', fontWeight: '900', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    复用创作环境
                  </button>
                  <button 
                    onClick={() => handleDownload(selectedImage)} 
                    className="btn-primary" 
                    style={{ width: '100px', height: '50px', background: '#fff', color: '#000', borderRadius: '14px', fontSize: '15px', fontWeight: '900', border: 'none' }}
                  >
                    下载
                  </button>
                </div>
              </div>
            </div>
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
    </div>
  );
};

export default HistoryPage;
