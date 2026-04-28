import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import request, { logout } from '../api/request';
import { 
  Images, 
  Coins, 
  ShieldCheck, 
  User, 
  LogOut, 
  Search, 
  X, 
  RefreshCw, 
  Download, 
  ClipboardCopy, 
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Trash2
} from 'lucide-react';
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

  // 统一初始化与搜索：只通过关键词监听来触发加载
  useEffect(() => {
    fetchUserInfo();
    const timer = setTimeout(() => {
      fetchHistory(false, keyword);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  // 增强：当页面重新获得焦点（如从首页切回来）时自动刷新列表 (Task 3.1 补丁)
  useEffect(() => {
    const onFocus = () => fetchHistory(false);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // 轮询逻辑 (Task 3.2)
  useEffect(() => {
    const pendingImages = images.filter(img => 
      ['pending', 'generating', 'storing'].includes(img.status)
    );
    
    if (pendingImages.length === 0) return;

    const pollTimer = setInterval(async () => {
      try {
        const ids = pendingImages.map(img => img.id).join(',');
        const results = await request.get(`/image/batch-status?ids=${ids}`);
        
        let hasChanges = false;
        const newImages = images.map(img => {
          const updated = results.find(r => r.id === img.id);
          if (updated && updated.status !== img.status) {
            hasChanges = true;
            
            // Task: Performance Logging for completed tasks
            if (updated.status === 'success' || updated.status === 'failed') {
              fetchUserInfo();
              if (updated.timings) {
                const { queue, api, generation, storage, total } = updated.timings;
                console.log(`%c🚀 创作任务完成 (ID: ${img.id})`, 'color: #10b981; font-weight: bold;');
                console.log(`- 提示词: ${img.prompt.substring(0, 20)}...`);
                console.log(`- 性能详情: 排队 ${queue}ms | API往返 ${api}ms | 系统 ${generation - api}ms | 转存 ${storage}ms | 总计 ${total}ms`);
              }
            }
            return { ...img, ...updated };
          }
          return img;
        });

        if (hasChanges) {
          setImages(newImages);
        }
      } catch (err) {
        console.error('Batch polling error', err);
      }
    }, 5000);

    return () => clearInterval(pollTimer);
  }, [images]);

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
      console.error('Failed to fetch history', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 内部组件：带 WebP 优化的图片 (Task 3.3 & 3.4 - 终极优化)
  const OptimizedImage = ({ src, alt, ...props }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    // 优化：仅对腾讯云 COS 链接添加处理参数
    const thumbUrl = src && src.includes('myqcloud.com') 
      ? `${src}?imageMogr2/thumbnail/400x/format/webp/quality/50/interlace/1`
      : src;
    
    return (
      <div style={{ position: 'relative', overflow: 'hidden', background: '#f5f5f5', borderRadius: '12px' }}>
        <img 
          src={thumbUrl} 
          alt={alt} 
          onLoad={() => setIsLoaded(true)}
          className={`lqip-img ${isLoaded ? 'loaded' : ''}`}
          {...props}
        />
        {!isLoaded && (
          <div className="skeleton" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
        )}
      </div>
    );
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
      const filename = `creation_${img.id}.png`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      // 如果直接下载失败（由于跨域），尝试打开新窗口
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
    if (!window.confirm('确定要删除这张作品吗？删除后不可恢复。')) return;
    
    try {
      await request.delete(`/image/${id}`);
      setImages(prev => prev.filter(img => img.id !== id));
      if (selectedImage?.id === id) setSelectedImage(null);
    } catch (err) {
      alert('删除失败，请稍后重试');
    }
  };

  return (
    <div className="history-container" style={isMobile ? { paddingBottom: '80px', height: '100%', overflowY: 'auto' } : {}}>
      {/* 顶部导航栏 (保持风格统一) */}
      {!isMobile && (
        <header style={{ height: '70px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e66b33', cursor: 'pointer' }} onClick={() => navigate('/')}>Visionary</div>
          <nav style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#666' }}>
            <span style={{ cursor: 'pointer', color: '#e66b33', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
      )}

      <main>
        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>我的创作</h1>
            <p style={{ color: '#666', fontSize: '14px' }}>回溯您的艺术灵感，管理已生成的精美图片。</p>
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div className="search-box">
              <span className="search-icon"><Search size={16} strokeWidth={1.75} /></span>
              <input 
                type="text" 
                placeholder="搜索提示词..." 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              {keyword && <span className="clear-btn" onClick={() => setKeyword('')}><X size={14} strokeWidth={2} /></span>}
            </div>
            <button className="btn-primary" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} strokeWidth={1.75} /> 开始新创作
            </button>
          </div>
        </div>

        {loading ? (
          <div className="gallery-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="gallery-item skeleton" style={{ height: i % 2 === 0 ? '300px' : '400px' }}></div>
            ))}
          </div>
        ) : images.length > 0 ? (
          <>
            <div className="gallery-grid">
              {images.map(img => (
                <div key={img.id} className="gallery-item" onClick={() => (img.status === 'success' || img.status === 'failed') && setSelectedImage(img)}>
                  {['pending', 'generating', 'storing'].includes(img.status) ? (
                    <div className="pending-card">
                      <div className="glass-overlay">
                        <RefreshCw size={32} className="spin-icon" style={{ color: '#e66b33' }} />
                        <div className="pulse-text">
                          {img.status === 'pending' && '等待调度...'}
                          {img.status === 'generating' && 'AI 绘画中...'}
                          {img.status === 'storing' && '正在保存...'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#999', marginTop: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '80%' }}>
                          {img.prompt}
                        </div>
                      </div>
                    </div>
                  ) : img.status === 'failed' ? (
                    <div className="pending-card" style={{ border: '1px solid #fee2e2', background: '#fef2f2' }}>
                      <X size={32} style={{ color: '#ef4444' }} />
                      <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '10px' }}>生成失败</div>
                    </div>
                  ) : (
                    <OptimizedImage 
                      src={img.image_url} 
                      alt={img.prompt} 
                      style={{ minHeight: '200px', objectFit: 'cover' }}
                    />
                  )}
                  
                  {/* 右上角删除按钮 */}
                  {(img.status === 'success' || img.status === 'failed') && (
                    <button 
                      onClick={(e) => handleDelete(e, img.id)}
                      style={{ 
                        position: 'absolute', top: '10px', right: '10px', 
                        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                        border: 'none', borderRadius: '8px', width: '32px', height: '32px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', cursor: 'pointer', zIndex: 10, transition: 'all 0.2s'
                      }}
                      className="delete-btn-overlay"
                      title="删除此作品"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  <div className="gallery-info">
                    <div className="gallery-prompt">{img.prompt}</div>
                    <div className="gallery-date">{new Date(img.created_at).toLocaleString()}</div>
                      <button 
                        className="reuse-btn-mini"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReuse(img.prompt);
                        }}
                        title="立即复用此 Prompt"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <RotateCcw size={12} strokeWidth={2} /> 复用
                      </button>
                  </div>
                </div>
              ))}
            </div>
            
            {hasMore && (
              <div style={{ textAlign: 'center', margin: '40px 0' }}>
                <button 
                  className="btn-primary" 
                  style={{ background: '#f5f5f5', color: '#666', border: '1px solid #ddd' }}
                  onClick={() => fetchHistory(true)}
                  disabled={loadingMore}
                >
                  {loadingMore ? '正在加载...' : '加载更多作品'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#999' }}>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>Empty</div>
            <p>您还没有任何创作记录，快去生成第一张图片吧！</p>
          </div>
        )}
      </main>

      {/* 预览模态框 */}
      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedImage(null)}>&times;</button>
            {selectedImage.status === 'failed' ? (
              <div style={{ width: '400px', height: '300px', background: '#fef2f2', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px' }}>
                <X size={64} color="#ef4444" />
                <h3 style={{ color: '#ef4444', marginTop: '20px' }}>生成失败</h3>
                <p style={{ color: '#666', fontSize: '14px', textAlign: 'center', marginTop: '10px' }}>{selectedImage.error || '服务器连接超时，请重试'}</p>
                <div style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>积分已原路退回您的账户</div>
              </div>
            ) : (
              <img src={selectedImage.image_url} alt="Full Preview" />
            )}
            <div className="modal-actions">
              <button 
                className="btn-primary" 
                disabled={downloading}
                onClick={() => handleDownload(selectedImage)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {downloading ? '⏳ 正在准备...' : <><Download size={18} strokeWidth={1.75} /> 高清下载</>}
              </button>
              <button 
                className="btn-primary" 
                style={{ background: '#e66b33', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={() => handleReuse(selectedImage.prompt)}
              >
                <RotateCcw size={18} strokeWidth={1.75} /> 立即复用此 Prompt
              </button>
              <button 
                className="btn-primary" 
                style={{ background: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={() => {
                  navigator.clipboard.writeText(selectedImage.prompt);
                  alert('Prompt 已复制');
                }}
              >
                <ClipboardCopy size={18} strokeWidth={1.75} /> 复制 Prompt
              </button>
            </div>
            <div style={{ marginTop: '20px', color: '#ccc', textAlign: 'center', fontSize: '14px' }}>
              {selectedImage.prompt}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
