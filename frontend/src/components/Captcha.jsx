import React, { useRef, useEffect, useState, useCallback } from 'react';

const Captcha = ({ onMatch }) => {
  const canvasRef = useRef(null);
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');

  const generateCode = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }, []);

  const drawCaptcha = useCallback((text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // 背景
    ctx.fillStyle = '#f8f0eb';
    ctx.fillRect(0, 0, w, h);

    // 干扰线
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * w, Math.random() * h);
      ctx.lineTo(Math.random() * w, Math.random() * h);
      ctx.strokeStyle = `rgba(${Math.floor(Math.random()*150)},${Math.floor(Math.random()*150)},${Math.floor(Math.random()*150)},0.4)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 干扰点
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random()*200)},${Math.floor(Math.random()*200)},${Math.floor(Math.random()*200)},0.5)`;
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // 文字
    const colors = ['#e66b33', '#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#d35400'];
    for (let i = 0; i < text.length; i++) {
      ctx.save();
      ctx.font = `bold ${20 + Math.random() * 6}px Arial, sans-serif`;
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      const x = 12 + i * 24;
      const y = 26 + (Math.random() - 0.5) * 10;
      const angle = (Math.random() - 0.5) * 0.4;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
  }, []);

  const refresh = useCallback(() => {
    const newCode = generateCode();
    setCode(newCode);
    setInput('');
    onMatch(false);
    setTimeout(() => drawCaptcha(newCode), 0);
  }, [generateCode, drawCaptcha, onMatch]);

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (input.length === 4) {
      onMatch(input.toLowerCase() === code.toLowerCase());
    } else {
      onMatch(false);
    }
  }, [input, code, onMatch]);

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <input
        type="text"
        placeholder="验证码"
        value={input}
        onChange={(e) => setInput(e.target.value.slice(0, 4))}
        maxLength={4}
        autoComplete="off"
        style={{
          flex: 1, 
          minWidth: 0, // 防止 flex 布局下撑开容器
          padding: '12px', borderRadius: '8px',
          border: '1px solid #ddd', outline: 'none',
          fontSize: '14px', letterSpacing: '1px', // 稍微缩小间距
          boxSizing: 'border-box',
          transition: 'border-color 0.2s'
        }}
        onFocus={(e) => e.target.style.borderColor = '#e66b33'}
        onBlur={(e) => e.target.style.borderColor = '#ddd'}
      />
      <canvas
        ref={canvasRef}
        width={100}
        height={40}
        onClick={refresh}
        title="点击刷新验证码"
        style={{
          borderRadius: '8px',
          cursor: 'pointer',
          border: '1px solid #eee',
          flexShrink: 0
        }}
      />
    </div>
  );
};

export default Captcha;
