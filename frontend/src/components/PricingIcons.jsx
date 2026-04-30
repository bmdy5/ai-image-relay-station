import React from 'react';

// 初探版：平稳脉动的核心粒子
export const PulseIcon = () => (
  <div className="icon-stage">
    <div className="particle-core" />
    <style>{`
      .icon-stage { width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; position: relative; }
      .particle-core {
        width: 24px; height: 24px; background: var(--pricing-primary); border-radius: 50%;
        filter: blur(1px); box-shadow: 0 0 30px var(--pricing-primary);
        animation: pricing-pulse 2s infinite ease-in-out;
      }
      @keyframes pricing-pulse {
        0%, 100% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.4); opacity: 1; }
      }
    `}</style>
  </div>
);

// 进阶版：三颗互相绕转的粒子，带有能量感
export const OrbitIcon = () => (
  <div className="icon-stage">
    <div className="orbit-container">
      <div className="orbit-particle p1" />
      <div className="orbit-particle p2" />
      <div className="orbit-particle p3" />
      <div className="energy-core" />
    </div>
    <style>{`
      .orbit-container {
        width: 60px; height: 60px; position: relative; border: 1px dashed rgba(255, 255, 255, 0.15);
        border-radius: 50%; animation: pricing-spin 8s linear infinite;
        display: flex; align-items: center; justify-content: center;
      }
      .orbit-particle {
        position: absolute; width: 8px; height: 8px; background: #fff; border-radius: 50%;
        box-shadow: 0 0 15px #fff;
      }
      .p1 { top: -4px; left: calc(50% - 4px); }
      .p2 { bottom: -4px; left: calc(50% - 4px); }
      .p3 { left: -4px; top: calc(50% - 4px); }
      
      .energy-core {
        width: 14px; height: 14px; background: var(--pricing-primary); border-radius: 50%;
        filter: blur(2px); box-shadow: 0 0 20px var(--pricing-primary);
      }
      
      @keyframes pricing-spin { to { transform: rotate(360deg); } }
    `}</style>
  </div>
);

// 专业版：3D 嵌套自转晶格 (Lattice)
export const LatticeIcon = () => (
  <div className="icon-stage">
    <div className="lattice">
      <div className="lattice-square s1" />
      <div className="lattice-square s2" />
      <div className="lattice-square s3" />
    </div>
    <style>{`
      .lattice {
        width: 50px; height: 50px; position: relative; transform-style: preserve-3d;
        animation: pricing-spin-3d 10s linear infinite;
      }
      .lattice-square {
        position: absolute; inset: 0; border: 1.5px solid var(--pricing-primary);
        box-shadow: 0 0 15px var(--pricing-primary);
        background: rgba(230, 107, 51, 0.05);
      }
      .s1 { transform: rotateX(45deg) rotateY(45deg); }
      .s2 { transform: rotateX(-45deg) rotateY(-45deg); }
      .s3 { transform: rotateY(90deg); }
      
      @keyframes pricing-spin-3d {
        to { transform: rotateX(360deg) rotateY(360deg); }
      }
    `}</style>
  </div>
);
