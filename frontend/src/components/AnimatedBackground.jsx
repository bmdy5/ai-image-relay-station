import React, { useEffect, useRef } from 'react';

const AnimatedBackground = ({ type = 'dots', intensity = 1, excludeRect = null }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let mouse = { x: -1000, y: -1000, active: false };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (excludeRect) {
        mouse.active = !(
          e.clientX > excludeRect.left &&
          e.clientX < excludeRect.right &&
          e.clientY > excludeRect.top &&
          e.clientY < excludeRect.bottom
        );
      } else {
        mouse.active = true;
      }
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    resize();

    class Particle {
      constructor() {
        this.init();
      }
      init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = type === 'dots' ? Math.random() * 2 + 0.5 : Math.random() * 2 + 1;
        this.vx = Math.random() * 0.4 - 0.2;
        this.vy = Math.random() * 0.4 - 0.2;
        this.opacity = Math.random() * 0.5 + 0.1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;

        // 避让逻辑 (如果定义了排除区域)
        if (excludeRect) {
          const centerX = (excludeRect.left + excludeRect.right) / 2;
          const centerY = (excludeRect.top + excludeRect.bottom) / 2;
          const dx = this.x - centerX;
          const dy = this.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const safeRadius = Math.max(excludeRect.width, excludeRect.height) * 0.6;
          
          if (dist < safeRadius) {
            this.x += (dx / dist) * 0.8;
            this.y += (dy / dist) * 0.8;
          }
        }

        // 鼠标交互 (仅在背景)
        if (mouse.active) {
          const mdx = this.x - mouse.x;
          const mdy = this.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 120) {
            if (type === 'plexus') {
              this.vx -= (mdx / mdist) * 0.02; // 吸引
              this.vy -= (mdy / mdist) * 0.02;
            } else {
              this.x += (mdx / mdist) * 2; // 排斥
              this.y += (mdy / mdist) * 2;
            }
          }
        }

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }
      draw() {
        const color = type === 'plexus' ? '230, 107, 51' : '0, 0, 0';
        ctx.fillStyle = `rgba(${color}, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particleCount = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 15000), 100) * intensity;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, i) => {
        p.update();
        p.draw();

        if (type === 'plexus') {
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              const pulse = (Math.sin(time / 500 + i) + 1) / 2;
              ctx.strokeStyle = `rgba(230, 107, 51, ${(1 - dist / 120) * 0.2 * (0.5 + pulse * 0.5)})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [type, intensity, excludeRect]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        background: type === 'plexus' ? 'linear-gradient(135deg, #fff 0%, #fdf5f0 100%)' : 'transparent'
      }}
    />
  );
};

export default AnimatedBackground;
