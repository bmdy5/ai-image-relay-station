import React, { useEffect, useRef } from 'react';

const NeuralPlexus = ({ transparent = false }) => {
  const canvasRef = useRef(null);
  const mainRectRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    let mouse = { x: -1000, y: -1000, active: false };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      
      // 检测鼠标是否在中间工作区之外
      const mainElement = document.getElementById('pc-main-stage');
      if (mainElement) {
        const rect = mainElement.getBoundingClientRect();
        mainRectRef.current = rect;
        mouse.active = !(
          e.clientX > rect.left && 
          e.clientX < rect.right && 
          e.clientY > rect.top && 
          e.clientY < rect.bottom
        );
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
        this.vx = Math.random() * 0.4 - 0.2;
        this.vy = Math.random() * 0.4 - 0.2;
        this.size = Math.random() * 1.5 + 1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;

        const rect = mainRectRef.current;
        this.inWindow = rect && (
          this.x > rect.left && 
          this.x < rect.right && 
          this.y > rect.top && 
          this.y < rect.bottom
        );

        if (mouse.active) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            this.vx -= dx / dist * 0.01;
            this.vy -= dy / dist * 0.01;
          }
        }

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.fillStyle = `rgba(230, 107, 51, ${this.inWindow ? 0.04 : 0.45})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 30 : 70;

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 每一帧都尝试更新主工作区的坐标，确保避让准确
      const mainElement = document.getElementById('pc-main-stage');
      if (mainElement) {
        mainRectRef.current = mainElement.getBoundingClientRect();
      }

      particles.forEach((p, i) => {
        p.update();
        p.draw();
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const baseAlpha = p.inWindow || p2.inWindow ? 0.02 : 1;
            const pulse = (Math.sin(time / 800 + i) + 1) / 2;
            ctx.strokeStyle = `rgba(230, 107, 51, ${(1 - dist / 120) * 0.5 * baseAlpha * (0.5 + pulse * 0.5)})`;
            ctx.lineWidth = 0.5 + pulse * 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: transparent ? 'transparent' : '#f8f8fa'
      }}
    />
  );
};

export default NeuralPlexus;
