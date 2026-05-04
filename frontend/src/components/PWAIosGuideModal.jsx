import React from 'react';
import { Share, PlusSquare, X, MoreHorizontal, ExternalLink, Compass } from 'lucide-react';

const PWAIosGuideModal = ({ onClose, isIOS, isAndroid, isInWechat, promptInstall, isInstallable }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '24px',
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom))'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: '#F5F5F5', border: 'none', borderRadius: '50%',
          width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 10
        }}>
          <X size={16} color="#666" />
        </button>

        {/* 顶部图标与标题 */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px', height: '64px', margin: '0 auto 16px',
            borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <img src="/icon.png" alt="Visionary Icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#333' }}>
            {isInWechat ? '请在浏览器中打开' : '添加到主屏幕'}
          </h3>
          <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#666' }}>
            {isInWechat 
              ? '微信环境不支持直接安装，请跳至浏览器开启完整体验' 
              : <span>添加至桌面，不仅体验更佳，首次安装还可<span style={{color: '#C56A50', fontWeight: '700'}}>获赠 10 积分</span>！</span>}
          </p>
        </div>

        {/* 核心引导区 */}
        <div style={{ background: '#FDFBF9', borderRadius: '16px', padding: '16px', border: '1px solid #F2EAE5' }}>
          {isInWechat ? (
            /* 微信专用引导 */
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: '#FFF', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <MoreHorizontal size={18} color="#333" />
                </div>
                <div style={{ fontSize: '15px', color: '#333' }}>
                  1. 点击右上角的 <strong>“...”</strong> 按钮
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#FFF', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <Compass size={18} color="#007AFF" />
                </div>
                <div style={{ fontSize: '15px', color: '#333' }}>
                  2. 选择 <strong>“在浏览器中打开”</strong>
                </div>
              </div>
            </>
          ) : isIOS ? (
            /* iOS Safari 专用引导 */
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: '#FFF', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <Share size={18} color="#007AFF" />
                </div>
                <div style={{ fontSize: '15px', color: '#333' }}>
                  1. 点击底部菜单栏的 <strong>分享</strong> 按钮
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#FFF', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <PlusSquare size={18} color="#333" />
                </div>
                <div style={{ fontSize: '15px', color: '#333' }}>
                  2. 向上滑动，选择 <strong>“添加到主屏幕”</strong>
                </div>
              </div>
            </>
          ) : (
            /* 安卓 Chrome/其他浏览器 专用引导 */
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: '#FFF', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <MoreHorizontal size={18} color="#333" />
                </div>
                <div style={{ fontSize: '15px', color: '#333' }}>
                  1. 点击浏览器右上角的 <strong>菜单</strong> 按钮
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#FFF', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <ExternalLink size={18} color="#C56A50" />
                </div>
                <div style={{ fontSize: '15px', color: '#333' }}>
                  2. 选择 <strong>“安装应用”</strong> 或 <strong>“添加到主屏幕”</strong>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 安卓专用一键安装按钮 */}
        {isAndroid && !isInWechat && (
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={() => {
                if (isInstallable) {
                  promptInstall();
                  onClose();
                } else {
                  alert('由于当前未使用 HTTPS 安全连接，浏览器禁用了自动安装。请点击浏览器右上角三个点，手动选择“安装应用”或“添加到主屏幕”。');
                }
              }}
              style={{
                width: '100%', padding: '14px',
                background: isInstallable ? 'linear-gradient(135deg, #e66b33 0%, #f09060 100%)' : '#F5F5F5',
                color: isInstallable ? 'white' : '#999',
                border: 'none', borderRadius: '16px',
                fontSize: '16px', fontWeight: '700',
                boxShadow: isInstallable ? '0 10px 20px rgba(230, 107, 51, 0.2)' : 'none',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {isInstallable ? '立即一键安装' : '环境限制 (需手动添加)'}
            </button>
            {!isInstallable && (
              <p style={{ fontSize: '11px', color: '#999', marginTop: '8px', textAlign: 'center' }}>
                提示：部署 HTTPS 后可开启一键自动安装
              </p>
            )}
          </div>
        )}

        {/* 动态指示箭头 */}
        <div style={{ 
          marginTop: '24px', 
          display: 'flex', justifyContent: 'center', 
          animation: isInWechat ? 'bounce-top-right 2s infinite' : 'bounce 2s infinite',
          position: isInWechat ? 'fixed' : 'relative',
          top: isInWechat ? '20px' : 'auto',
          right: isInWechat ? '20px' : 'auto',
          zIndex: isInWechat ? 10001 : 1
        }}>
          <div style={{ 
            width: '4px', height: '40px', 
            background: `linear-gradient(${isInWechat ? 'to top' : 'to bottom'}, transparent, #C56A50)`, 
            borderRadius: '2px', position: 'relative',
            transform: isInWechat ? 'rotate(45deg)' : 'none'
          }}>
            <div style={{ 
              position: 'absolute', 
              bottom: isInWechat ? 'auto' : '-6px', 
              top: isInWechat ? '-6px' : 'auto',
              left: '-4px', 
              width: '12px', height: '12px', 
              borderBottom: isInWechat ? 'none' : '3px solid #C56A50', 
              borderRight: isInWechat ? 'none' : '3px solid #C56A50', 
              borderTop: isInWechat ? '3px solid #C56A50' : 'none',
              borderLeft: isInWechat ? '3px solid #C56A50' : 'none',
              transform: isInWechat ? 'rotate(45deg)' : 'rotate(45deg)' 
            }} />
          </div>
        </div>

        <style>{`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(10px); }
            60% { transform: translateY(5px); }
          }
          @keyframes bounce-top-right {
            0%, 20%, 50%, 80%, 100% { transform: translate(0, 0) rotate(45deg); }
            40% { transform: translate(10px, -10px) rotate(45deg); }
            60% { transform: translate(5px, -5px) rotate(45deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PWAIosGuideModal;
