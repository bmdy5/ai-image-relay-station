import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import request, { logout } from '../api/request';
import { 
  Images, Coins, ShieldCheck, User, LogOut, Search, X, RefreshCw, 
  Download, ClipboardCopy, RotateCcw, Sparkles, ArrowLeft, Trash2
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

  const handleReuse = (prompt) => {
    sessionStorage.setItem('pending_prompt', prompt);
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
      'default': '默认', '': '默认'
    };
    const q = qMap[img.quality] || '标准';
    const s = sMap[img.style] || '默认';
    return `${q}版 - ${s}`;
  };

  const MobileDetailDrawer = () => (
    <MobileDrawer isOpen={!!selectedImage && isMobile} onClose={() => setSelectedImage(null)} title="作品详情">
      {selectedImage && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <img src={selectedImage.image_url} alt="Preview" style={{ width: '100%', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} />
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
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => handleReuse(selectedImage.prompt)} style={{ flex: 2, padding: '16px', borderRadius: '16px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><RotateCcw size={18} /> 复用提示词</button>
            <button onClick={() => handleDownload(selectedImage)} style={{ flex: 1, padding: '16px', borderRadius: '16px', background: '#F2F2F7', color: '#1D1D1F', border: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Download size={18} /></button>
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
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <div className="gallery-prompt" style={{ flex: 1, fontSize: '13px', color: '#1D1D1F', fontWeight: '500' }}>{img.prompt}</div>
                            <div style={{ 
                              fontSize: '10px', 
                              color: img.quality === 'master' ? 'var(--master)' : '#8E8E93', 
                              background: img.quality === 'master' ? 'rgba(124, 77, 255, 0.08)' : 'rgba(0,0,0,0.04)',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontWeight: '700',
                              whiteSpace: 'nowrap',
                              flexShrink: 0
                            }}>
                              {img.quality === 'master' && '✦ '}{getFeatureLabel(img)}
                            </div>
                          </div>
                        </div>
                       <button className="reuse-btn-mini" onClick={(e) => { e.stopPropagation(); handleReuse(img.prompt); }}>复用</button>
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

      {!isMobile && selectedImage && createPortal(
        <div 
          className="modal-overlay" 
          style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', 
            backdropFilter: 'blur(15px)', zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="modal-content" 
            style={{ 
              position: 'relative', display: 'flex', flexDirection: 'column', 
              alignItems: 'center', animation: 'modalZoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' 
            }}
            onClick={e => e.stopPropagation()}
          >
            <img 
              src={selectedImage.image_url} 
              alt="Preview" 
              style={{ maxHeight: '85vh', maxWidth: '90vw', borderRadius: '16px', boxShadow: '0 30px 70px rgba(0,0,0,0.5)' }} 
            />
            <div className="modal-actions" style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
              <button className="btn-primary" onClick={() => handleDownload(selectedImage)}>下载图片</button>
              <button className="btn-primary" style={{ background: '#e66b33' }} onClick={() => handleReuse(selectedImage.prompt)}>复用提示词</button>
            </div>
            <button 
              onClick={() => setSelectedImage(null)}
              style={{ position: 'absolute', top: '-50px', right: '-50px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={32} />
            </button>
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
