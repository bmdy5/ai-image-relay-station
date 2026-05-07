import React from 'react';
import { Download, Share2, SquarePlus, ArrowRight, X } from 'lucide-react';

const PWAInstallModal = ({ platform, onClose, onInstall, onNever }) => {
  // 确认对话框在 201x 高度下的黄金分割点（视觉重心靠上）
  const isIOS = platform === 'ios';
  const isAndroid = platform === 'android';
  const isWechat = platform === 'wechat';
  // Android 以外的平台（不支持原生 prompt），仅显示流程指引
  const needsGuide = isIOS || isWechat;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 3000,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '28px', width: '100%',
        maxWidth: '360px', padding: '32px 24px 28px',
        textAlign: 'center', position: 'relative',
        boxShadow: '0 24px 60px rgba(0,0,0,0.15)',
        animation: 'modalSlideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1)'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          width: '32px', height: '32px', borderRadius: '16px',
          background: '#F2F2F7', border: 'none', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#8E8E93'
        }}>
          <X size={16} />
        </button>

        {/* 图标 */}
        <div style={{
          width: '72px', height: '72px', borderRadius: '20px',
          background: 'linear-gradient(135deg, #FF6B00 0%, #FF3D00 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', boxShadow: '0 12px 30px rgba(255, 61, 0, 0.2)'
        }}>
          {needsGuide ? <SquarePlus size={36} color="#fff" /> : <Download size={36} color="#fff" />}
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px', color: '#1D1D1F' }}>
          {needsGuide ? '添加到主屏幕' : '安装 Visionary'}
        </h2>

        {isAndroid && (
          <>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>
              点击下方按钮，将 Visionary 安装到桌面，<br />
              像原生 App 一样快速启动，首次安装还送 <b style={{ color: '#FF6B00' }}>10 积分</b>。
            </p>
            <button
              onClick={onInstall}
              style={{
                width: '100%', padding: '16px', borderRadius: '16px',
                background: 'linear-gradient(135deg, #FF6B00 0%, #FF3D00 100%)',
                color: '#fff', border: 'none', fontWeight: '800', fontSize: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 10px 25px rgba(255, 61, 0, 0.25)',
                cursor: 'pointer'
              }}
            >
              <Download size={20} /> 一键安装到桌面
            </button>
            <button
              onClick={onClose}
              style={{
                width: '100%', padding: '12px', marginTop: '10px',
                background: 'none', border: 'none', color: '#999',
                fontSize: '13px', cursor: 'pointer'
              }}
            >
              暂时不需要
            </button>
            {onNever && (
              <button
                onClick={onNever}
                style={{
                  width: '100%', padding: '8px', marginTop: '4px',
                  background: 'none', border: 'none', color: '#bbb',
                  fontSize: '11px', cursor: 'pointer'
                }}
              >
                不再提示
              </button>
            )}
          </>
        )}

        {isIOS && (
          <>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>
              通过 Safari 将 Visionary 添加到主屏幕，<br />
              首次安装还可获赠 <b style={{ color: '#FF6B00' }}>10 积分</b>。
            </p>
            <div style={{
              background: '#F9F9FB', borderRadius: '20px', padding: '20px',
              textAlign: 'left', marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '14px',
                  background: '#FF6B00', color: '#fff', fontWeight: '800',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', flexShrink: 0
                }}>1</div>
                <span style={{ fontSize: '14px', color: '#1D1D1F' }}>
                  点击底部 <Share2 size={16} style={{ display: 'inline', verticalAlign: 'middle', color: '#007AFF' }} /> <b>分享</b> 按钮
                </span>
              </div>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '14px',
                  background: '#FF6B00', color: '#fff', fontWeight: '800',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', flexShrink: 0
                }}>2</div>
                <span style={{ fontSize: '14px', color: '#1D1D1F' }}>
                  选择 <b>「添加到主屏幕」</b>
                  <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} />
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '100%', padding: '16px', borderRadius: '16px',
                background: '#1D1D1F', color: '#fff', border: 'none',
                fontWeight: '800', fontSize: '16px', cursor: 'pointer'
              }}
            >
              我知道了
            </button>
            {onNever && (
              <button onClick={onNever} style={{ width: '100%', padding: '8px', marginTop: '4px', background: 'none', border: 'none', color: '#bbb', fontSize: '11px', cursor: 'pointer' }}>不再提示</button>
            )}
          </>
        )}

        {isWechat && (
          <>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>
              微信内无法直接安装，请点击右上角 <b>「···」</b><br />
              选择 <b>「在浏览器中打开」</b>，然后按浏览器指引安装。
            </p>
            <button
              onClick={onClose}
              style={{
                width: '100%', padding: '16px', borderRadius: '16px',
                background: '#1D1D1F', color: '#fff', border: 'none',
                fontWeight: '800', fontSize: '16px', cursor: 'pointer'
              }}
            >
              我知道了
            </button>
            {onNever && (
              <button onClick={onNever} style={{ width: '100%', padding: '8px', marginTop: '4px', background: 'none', border: 'none', color: '#bbb', fontSize: '11px', cursor: 'pointer' }}>不再提示</button>
            )}
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
    </div>
  );
};

export default PWAInstallModal;
