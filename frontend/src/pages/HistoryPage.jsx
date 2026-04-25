import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import request, { logout } from '../api/request';
import './HistoryPage.css';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  useEffect(() => {
    fetchUserInfo();
    fetchHistory();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const data = await request.get('/auth/me');
      setUserInfo(data);
    } catch (err) {}
  };

  const fetchHistory = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);
    
    try {
      const currentSkip = isLoadMore ? skip + LIMIT : 0;
      const data = await request.get(`/image/history?skip=${currentSkip}&limit=${LIMIT}`);
      
      if (isLoadMore) {
        setImages(prev => [...prev, ...data]);
        setSkip(currentSkip);
      } else {
        setImages(data);
        setSkip(0);
      }
      
      if (data.length < LIMIT) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleDownload = async (url) => {
    setDownloading(true);
    try {
      // 通过后端代理下载，解决跨域问题
      const response = await fetch(`/api/image/download?url=${encodeURIComponent(url)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const filename = `creation_${new Date().getTime()}.png`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('下载失败，请重试');
    } finally {
      setDownloading(false);
    }
  };

  const handleReuse = (prompt) => {
    sessionStorage.setItem('pending_prompt', prompt);
    navigate('/');
  };

  return (
    <div className="history-container">
      {/* 顶部导航栏 (保持风格统一) */}
      <header style={{ height: '70px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e66b33', cursor: 'pointer' }} onClick={() => navigate('/')}>GPT Image 2</div>
          <nav style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#666' }}>
            <span style={{ cursor: 'pointer', color: '#e66b33', fontWeight: '600' }}>🖼 我的创作</span>
            <span style={{ cursor: 'pointer' }}>💰 价格</span>
            {userInfo?.is_admin && (
              <span style={{ cursor: 'pointer', color: '#e66b33', fontWeight: '600' }} onClick={() => navigate('/admin')}>🛠 管理后台</span>
            )}
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: '#f5f5f5', padding: '6px 12px', borderRadius: '20px', fontSize: '13px' }}>
            🪙 {userInfo?.points || 0}
          </div>
          <button onClick={() => navigate('/profile')} style={{ background: '#eee', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}>👤</button>
          <button onClick={logout} style={{ background: 'transparent', border: '1px solid #ddd', borderRadius: '6px', padding: '5px 12px', fontSize: '13px', cursor: 'pointer' }}>退出</button>
        </div>
      </header>

      <main>
        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>我的创作</h1>
            <p style={{ color: '#666', fontSize: '14px' }}>回溯您的艺术灵感，管理已生成的精美图片。</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/')}>✨ 开始新创作</button>
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
                <div key={img.id} className="gallery-item" onClick={() => setSelectedImage(img)}>
                  <img src={img.image_url} alt={img.prompt} loading="lazy" />
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
                    >
                      ✨ 复用
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
            <img src={selectedImage.image_url} alt="Full Preview" />
            <div className="modal-actions">
              <button 
                className="btn-primary" 
                disabled={downloading}
                onClick={() => handleDownload(selectedImage.image_url)}
              >
                {downloading ? '⏳ 正在准备...' : '📥 高清下载'}
              </button>
              <button 
                className="btn-primary" 
                style={{ background: '#e66b33' }}
                onClick={() => handleReuse(selectedImage.prompt)}
              >
                ✨ 立即复用此 Prompt
              </button>
              <button 
                className="btn-primary" 
                style={{ background: '#444' }}
                onClick={() => {
                  // 可以在此处实现复制 Prompt 功能
                  navigator.clipboard.writeText(selectedImage.prompt);
                  alert('Prompt 已复制');
                }}
              >
                📋 复制 Prompt
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
