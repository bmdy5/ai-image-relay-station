# Pricing Page Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the pricing page into a premium, 3D interactive experience with generative icons and liquid borders.

**Architecture:** Use a decoupled 3D hierarchy (Tilt Wrapper -> Flip Inner -> Faces) to allow persistent tilt feedback. Utilize CSS Houdini for high-performance border animations.

**Tech Stack:** React, CSS (Vanilla), Lucide-React, SVG.

---

### Task 1: Global Infrastructure & Styles

**Files:**
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Add Global CSS Definitions**
Add the Outfit font import, Houdini @property, and the noise filter utility.

```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

:root {
  --pricing-primary: #e66b33;
  --pricing-bg: #0a0a0c;
}

.noise-overlay {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 9999;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E");
}
```

- [ ] **Step 2: Commit**
```bash
git add frontend/src/index.css
git commit -m "style: add pricing page global infrastructure (outfit font, noise, houdini)"
```

### Task 2: Generative Icon Components

**Files:**
- Create: `frontend/src/components/PricingIcons.jsx`

- [ ] **Step 1: Implement Generative Icons**
Create `PulseIcon`, `OrbitIcon`, and `LatticeIcon`.

```jsx
import React from 'react';

export const PulseIcon = () => (
  <div className="icon-stage">
    <div className="particle-core" />
    <style>{`
      .icon-stage { width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; }
      .particle-core {
        width: 24px; height: 24px; background: var(--pricing-primary); border-radius: 50%;
        filter: blur(2px); box-shadow: 0 0 30px var(--pricing-primary);
        animation: pricing-pulse 2s infinite ease-in-out;
      }
      @keyframes pricing-pulse { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.5); opacity: 1; } }
    `}</style>
  </div>
);

export const OrbitIcon = () => (
  <div className="icon-stage">
    <div className="orbit-container">
      <div className="orbit-particle p1" />
      <div className="orbit-particle p2" />
      <div className="orbit-particle p3" />
      <div className="energy-line" />
      <div className="particle-core-small" />
    </div>
    <style>{`
      .orbit-container { width: 60px; height: 60px; position: relative; animation: pricing-spin 6s linear infinite; border: 1px dashed rgba(255,255,255,0.1); border-radius: 50%; }
      .orbit-particle { position: absolute; width: 8px; height: 8px; background: #fff; border-radius: 50%; box-shadow: 0 0 15px #fff; }
      .p1 { top: -4px; left: 50%; transform: translateX(-50%); }
      .p2 { bottom: -4px; left: 50%; transform: translateX(-50%); }
      .p3 { left: -4px; top: 50%; transform: translateY(-50%); }
      .particle-core-small { position: absolute; inset: 22px; background: var(--pricing-primary); border-radius: 50%; filter: blur(2px); }
      @keyframes pricing-spin { to { transform: rotate(360deg); } }
    `}</style>
  </div>
);

export const LatticeIcon = () => (
  <div className="icon-stage">
    <div className="lattice">
      <div className="lattice-square s1" />
      <div className="lattice-square s2" />
      <div className="lattice-square s3" />
    </div>
    <style>{`
      .lattice { width: 50px; height: 50px; position: relative; transform-style: preserve-3d; animation: pricing-spin-3d 8s linear infinite; }
      .lattice-square { position: absolute; inset: 0; border: 1.5px solid var(--pricing-primary); box-shadow: 0 0 15px var(--pricing-primary); }
      .s1 { transform: rotateX(45deg) rotateY(45deg); }
      .s2 { transform: rotateX(-45deg) rotateY(-45deg); }
      .s3 { transform: rotateY(90deg); }
      @keyframes pricing-spin-3d { to { transform: rotateX(360deg) rotateY(360deg); } }
    `}</style>
  </div>
);
```

- [ ] **Step 2: Commit**
```bash
git add frontend/src/components/PricingIcons.jsx
git commit -m "feat: add generative pricing icons (Pulse, Orbit, Lattice)"
```

### Task 3: PricingCard Component Refactor

**Files:**
- Modify: `frontend/src/pages/PCPricingPage.jsx`

- [ ] **Step 1: Rewrite PricingCard with Decoupled Tilt/Flip**
Implement the new structure and JS logic for tilt and glint.

```jsx
const PricingCard = ({ tier, onRecharge }) => {
  const containerRef = useRef(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    containerRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    containerRef.current.querySelectorAll('.glint').forEach(glint => {
      glint.style.setProperty('--mouse-x', `${percentX}%`);
      glint.style.setProperty('--mouse-y', `${percentY}%`);
    });
  };

  const handleMouseLeave = () => {
    if (containerRef.current) {
      containerRef.current.style.transform = `rotateX(0deg) rotateY(0deg)`;
    }
  };

  return (
    <div 
      className={`card-outer-container tier-${tier.id} ${isFlipped ? 'is-flipped' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: '2000px', width: '360px', height: '540px', position: 'relative' }}
    >
      {tier.id === 'master' && <div className="liquid-border" />}
      
      <div ref={containerRef} className="card-tilt-wrapper">
        <div className="card-flip-inner">
          {/* Front Face */}
          <div className={`card-face card-front face-${tier.id}`}>
            <div className="glint" />
            <div className="icon-stage-wrapper">
              {tier.id === 'basic' && <PulseIcon />}
              {tier.id === 'advanced' && <OrbitIcon />}
              {tier.id === 'master' && <LatticeIcon />}
            </div>
            <h3 className="card-title">{tier.name}</h3>
            <p className="card-subtitle">{tier.description}</p>
            <div className="card-features">
              {tier.features.map((f, i) => (
                <div key={i} className="feature-row">
                  <div className="feature-dot" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <div className="flip-hint">点击翻转查看价格</div>
          </div>

          {/* Back Face */}
          <div className={`card-face card-back back-${tier.id}`}>
            <div className="glint" />
            <div className="back-content">
              <span className="back-label">QUANTUM ENERGY</span>
              <p className="back-price">{tier.points}</p>
              <p className="back-info">POINTS · ¥{tier.price}</p>
              <button 
                className="card-buy-btn"
                onClick={(e) => { e.stopPropagation(); onRecharge(tier.price); }}
              >
                立即获取
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Add Required CSS to PCPricingPage.jsx**
Add the styles for glassmorphism, liquid border, and 3D layers.

```css
        .card-tilt-wrapper {
          width: 100%; height: 100%; transform-style: preserve-3d; transition: transform 0.1s ease-out;
        }
        .card-flip-inner {
          width: 100%; height: 100%; position: relative; transform-style: preserve-3d; transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .is-flipped .card-flip-inner { transform: rotateY(180deg); }
        
        .card-face {
          position: absolute; inset: 0; backface-visibility: hidden; border-radius: 44px; padding: 60px 45px;
          display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.3);
          background: rgba(255, 255, 255, 0.04); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .card-back { transform: rotateY(180deg); text-align: center; justify-content: center; }
        
        .liquid-border {
          position: absolute; inset: -2px; border-radius: 46px; z-index: -1; opacity: 0.8;
          background: conic-gradient(from var(--angle), transparent 70%, #e66b33 85%, #ffcc00 100%);
          animation: rotate-border 4s linear infinite;
        }
        @keyframes rotate-border { to { --angle: 360deg; } }
        
        .glint {
          position: absolute; inset: 0; pointer-events: none; z-index: 5; opacity: 0; transition: opacity 0.5s;
          background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.15) 0%, transparent 60%);
        }
        .card-outer-container:hover .glint { opacity: 1; }
        
        .card-title { font-family: 'Outfit'; font-size: 32px; font-weight: 800; letter-spacing: -1px; margin-bottom: 12px; }
        .card-subtitle { font-size: 15px; color: rgba(255,255,255,0.4); line-height: 1.6; margin-bottom: 40px; }
        .back-price { font-size: 84px; font-weight: 900; margin: 0; font-family: 'Outfit'; letter-spacing: -2px; }
        .card-buy-btn { width: 100%; padding: 24px; border-radius: 24px; border: none; background: #fff; color: #000; font-weight: 800; font-size: 18px; cursor: pointer; transition: all 0.3s; }
        .card-buy-btn:hover { transform: scale(1.02); box-shadow: 0 15px 40px rgba(255,255,255,0.2); }
```

- [ ] **Step 3: Commit**
```bash
git add frontend/src/pages/PCPricingPage.jsx
git commit -m "feat: refactor PricingCard with premium 3D effects and styles"
```

### Task 4: Page Layout & Polish

**Files:**
- Modify: `frontend/src/pages/PCPricingPage.jsx`

- [ ] **Step 1: Update PCPricingPage Main Content**
Add the noise overlay and update the page header.

```jsx
const PCPricingPage = () => {
  // ... existing states ...

  return (
    <div className="pricing-page-root" style={{ color: '#fff', background: '#0d0d10', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <div className="noise-overlay" />
      
      <div className="pricing-header" style={{ textAlign: 'center', marginBottom: '80px', paddingTop: '60px' }}>
        <span style={{ letterSpacing: '6px', fontSize: '11px', fontWeight: '800', color: 'var(--pricing-primary)', opacity: 0.8, display: 'block', marginBottom: '20px' }}>QUANTUM ENERGY TIER</span>
        <h1 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-2px', background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>注入无限创作能量</h1>
      </div>

      <div className="pricing-grid" style={{ display: 'flex', justifyContent: 'center', gap: '40px', paddingBottom: '60px' }}>
        {tiers.map(tier => (
          <PricingCard key={tier.id} tier={tier} onRecharge={handleRecharge} />
        ))}
      </div>
      
      {/* ... rest of the page (Showcase, footer, etc) ... */}
    </div>
  );
};
```

- [ ] **Step 2: Commit**
```bash
git add frontend/src/pages/PCPricingPage.jsx
git commit -m "feat: update PCPricingPage layout and add premium typography/noise"
```
