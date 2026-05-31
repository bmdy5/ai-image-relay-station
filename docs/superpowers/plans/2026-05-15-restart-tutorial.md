# Restart Tutorial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Restart Tutorial" button to both PC and Mobile profile pages to allow users to re-watch the onboarding guide.

**Architecture:** Direct integration in Profile pages using `window.confirm` for confirmation, `localStorage` for state reset, and `react-router-dom` for navigation.

**Tech Stack:** React, Lucide-react (Icons), React Router.

---

### Task 1: PC Profile Page Integration

**Files:**
- Modify: `frontend/src/pages/PCProfilePage.jsx`

- [ ] **Step 1: Add handleRestartGuide function**

```javascript
// Around line 188, after handleResetTasks
const handleRestartGuide = () => {
  if (window.confirm('确定要重新开始新手引导吗？系统将带您回到首页并开启教学模式。')) {
    localStorage.removeItem('visionary_guide_v1');
    navigate('/');
  }
};
```

- [ ] **Step 2: Import HelpCircle icon**

```javascript
// Around line 7, add HelpCircle
import {
  ShieldCheck, ArrowRight, LogOut, Wallet, User, Lock,
  RefreshCw, Copy, MessageSquare, CreditCard, ChevronRight, Users, Share2, Download, Gift,
  HelpCircle
} from 'lucide-react';
```

- [ ] **Step 3: Add button to the grid**

```javascript
// Around line 300, inside the "Quick Actions" grid
<div 
  onClick={handleRestartGuide}
  style={{ 
    padding: '20px', borderRadius: '16px', background: 'white', border: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.3s'
  }}
  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-glow)'; }}
  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'white'; }}
>
  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
    <HelpCircle size={20} />
  </div>
  <div>
    <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>新手引导</div>
    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>重新查看功能指引</div>
  </div>
</div>
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/PCProfilePage.jsx
git commit -m "feat: add restart tutorial button to PC profile page"
```

---

### Task 2: Mobile Profile Page Integration

**Files:**
- Modify: `frontend/src/pages/MobileProfilePage.jsx`

- [ ] **Step 1: Add restart logic and HelpCircle import**

```javascript
// Around line 7, add HelpCircle
import { 
  ShieldCheck, ArrowRight, LogOut, Wallet, User, Lock, 
  RefreshCw, Copy, ExternalLink, MessageSquare, Download, Gift,
  HelpCircle
} from 'lucide-react';

// Around line 200, add the function
const handleRestartGuide = () => {
  if (window.confirm('确定要重新开始新手引导吗？')) {
    localStorage.removeItem('visionary_guide_v1');
    navigate('/');
  }
};
```

- [ ] **Step 2: Add menu item to the list**

```javascript
// Around line 400, inside the settings list
<div 
  onClick={handleRestartGuide}
  style={{ 
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0',
    borderBottom: '1px solid #F2F2F7'
  }}
>
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,122,255,0.1)', color: '#007AFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <HelpCircle size={20} />
    </div>
    <span style={{ fontSize: '16px', fontWeight: '600' }}>新手引导</span>
  </div>
  <ChevronRight size={18} color="#C7C7CC" />
</div>
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/MobileProfilePage.jsx
git commit -m "feat: add restart tutorial button to mobile profile page"
```
