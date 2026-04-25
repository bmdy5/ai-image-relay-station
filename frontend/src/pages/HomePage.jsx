import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import request, { logout } from '../api/request';

const HomePage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [quality, setQuality] = useState('low');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [numImages, setNumImages] = useState(1);

  useEffect(() => {
    fetchUserInfo();
    checkPendingPrompt();
  }, []);

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
    setResult(null);
    try {
      const data = await request.post('/image/generate', { prompt, quality, aspectRatio, numImages });
      setResult(data.image_url);
      setUserInfo(prev => ({ ...prev, points: data.remaining_points }));
    } catch (err) {
      alert('生成失败: ' + (err.response?.data?.detail || '网络错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
      {/* 顶部导航栏 */}
      <header style={{ height: '70px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e66b33' }}>GPT Image 2</div>
          <nav style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#666' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/history')}>🖼 我的创作</span>
            <span style={{ cursor: 'pointer' }}>💰 价格</span>
            {userInfo?.is_admin && (
              <span style={{ cursor: 'pointer', color: '#e66b33', fontWeight: '600' }} onClick={() => navigate('/admin')}>🛠 管理后台</span>
            )}
            <span style={{ cursor: 'pointer' }}>📖 使用指南</span>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: '#f5f5f5', padding: '6px 12px', borderRadius: '20px', fontSize: '13px' }}>
            🪙 {userInfo?.points || 0}
          </div>
          <button 
            onClick={() => navigate('/profile')}
            title="个人中心"
            style={{ background: '#eee', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}
          >
            👤
          </button>
          <button 
            onClick={logout}
            style={{ background: 'transparent', border: '1px solid #ddd', borderRadius: '6px', padding: '5px 12px', fontSize: '13px', cursor: 'pointer' }}
          >
            退出
          </button>
        </div>
      </header>

      {/* 主工作台 (双栏) */}
      <main style={{ display: 'grid', gridTemplateColumns: '450px 1fr', gap: '30px', marginTop: '30px' }}>
        {/* 左侧：参数调节区 */}
        <div className="card" style={{ padding: '24px', height: 'fit-content' }}>
          <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '8px', padding: '4px', marginBottom: '20px' }}>
            <button style={{ flex: 1, border: 'none', background: '#fff', padding: '8px', borderRadius: '6px', fontWeight: '600' }}>生成图片</button>
            <button style={{ flex: 1, border: 'none', background: 'transparent', padding: '8px', color: '#666' }}>编辑图片</button>
          </div>

          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>✨ 描述您的创意</label>
          <textarea
            placeholder="一只可爱的橘猫坐在樱花树下..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{ width: '100%', height: '150px', border: '1px solid #ddd', borderRadius: '12px', padding: '15px', resize: 'none', fontSize: '14px' }}
          />

          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>输出数量</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[1, 2, 4, 8].map(n => (
                <button 
                  key={n}
                  onClick={() => setNumImages(n)}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: numImages === n ? '2px solid #e66b33' : '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>长宽比</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {['1:1', '3:4', '4:3', '16:9', '9:16', 'Auto'].map(r => (
                <button 
                  key={r}
                  onClick={() => setAspectRatio(r)}
                  style={{ padding: '8px', borderRadius: '8px', border: aspectRatio === r ? '2px solid #e66b33' : '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '13px' }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button 
            className="btn-primary" 
            onClick={handleGenerate} 
            disabled={loading}
            style={{ width: '100%', marginTop: '30px', height: '50px' }}
          >
            {loading ? '🚀 正在创作...' : '✨ 生成图片'}
          </button>
        </div>

        {/* 右侧：结果展示区 */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '600px', background: '#fbfbfb' }}>
          {loading ? (
            <div className="loading-spinner"></div>
          ) : result ? (
            <div style={{ width: '100%' }}>
              <img src={result} alt="Result" style={{ width: '100%', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
              <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                <button className="btn-primary" style={{ flex: 1, background: '#333' }}>🚀 继续编辑</button>
                <a href={result} download className="btn-primary" style={{ flex: 1 }}>📥 高清下载</a>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#999' }}>
              <div style={{ fontSize: '40px', marginBottom: '20px' }}>🎨</div>
              <p>在左侧输入创意，开始您的艺术之旅</p>
            </div>
          )}
        </div>
      </main>

      {/* 落地页模块 (落地宣传) */}
      <section style={{ marginTop: '100px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '10px' }}>秒出可商用的视觉素材</h1>
        <p style={{ color: '#666', maxWidth: '800px', margin: '0 auto 60px' }}>用文字描述，生成高清画作 —— GPT Image 2 通过顶尖 AI 算法，助您保持视觉风格一致。</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', marginBottom: '100px' }}>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>更快创建完美图像</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>告别反复尝试，开始精细调整。GPT Image 2 快速输出清晰的 2K 图像，可选 4K 放大用于印刷品质。</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <span style={{ color: '#e66b33' }}>⚡</span> 
                <div><strong>极速生成</strong><p style={{ fontSize: '13px', color: '#888' }}>几秒内呈现精美结果，快速迭代。</p></div>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <span style={{ color: '#e66b33' }}>💎</span> 
                <div><strong>精细输出</strong><p style={{ fontSize: '13px', color: '#888' }}>更锐利、更清晰的图像，适用于广告和产品。</p></div>
              </div>
            </div>
          </div>
          <div className="card" style={{ height: '400px', background: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800) center/cover' }}></div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
