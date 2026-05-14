import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import TutorialOverlay from '../components/TutorialOverlay';

const TutorialContext = createContext();

export const useTutorial = () => useContext(TutorialContext);

export const TutorialProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [rect, setRect] = useState(null);
  
  const steps = [
    { id: 'guide-input', content: "欢迎！在这里输入你的创意灵感。点击【提示词润色】能让想法瞬间高级，还支持一键撤销哦！" },
    { id: 'guide-style-list', content: "挑选一个你喜欢的艺术风格。" },
    { id: 'guide-generate-btn', content: "准备好了吗？点击开启你的创作！" },
    { id: 'guide-history-tab', content: "等待出图时，可以在这里查看进度或回顾以往作品。" },
    { id: 'guide-points', content: "太棒了！别忘了每日签到领取积分。开始你的创作之旅吧！" },
  ];

  const updateRect = useCallback((shouldScroll = false) => {
    if (!isActive) return;
    const element = document.getElementById(steps[currentStep].id);
    if (element) {
      const elementRect = element.getBoundingClientRect();
      // Update rect if any value changed
      if (!rect || 
          elementRect.top !== rect.top || 
          elementRect.left !== rect.left || 
          elementRect.width !== rect.width || 
          elementRect.height !== rect.height) {
        setRect(elementRect);
      }
      // Only scroll into view when explicitly requested (e.g., step change)
      if (shouldScroll) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setRect(null);
    }
  }, [isActive, currentStep, steps, rect]);

  // Initial check and auto-start
  useEffect(() => {
    const status = localStorage.getItem('visionary_guide_v1');
    const isLoggedIn = !!localStorage.getItem('token') || !!localStorage.getItem('user_info');
    
    if (status !== 'finished' && isLoggedIn) {
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Sync rect with element position
  useEffect(() => {
    if (!isActive) return;
    
    // Initial rect update and scroll for current step
    updateRect(true);
    
    const handleUpdate = () => updateRect(false);
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);
    
    const interval = setInterval(handleUpdate, 500);
    
    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
      clearInterval(interval);
    };
  }, [isActive, currentStep, updateRect]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finishTutorial();
    }
  };

  const finishTutorial = () => {
    setIsActive(false);
    localStorage.setItem('visionary_guide_v1', 'finished');
  };

  const value = {
    currentStep,
    setCurrentStep,
    isActive,
    setIsActive,
    steps,
    nextStep,
    finishTutorial,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
      {isActive && rect && (
        <TutorialOverlay 
          rect={rect}
          content={steps[currentStep].content}
          onNext={nextStep}
          onSkip={finishTutorial}
          isLastStep={currentStep === steps.length - 1}
        />
      )}
    </TutorialContext.Provider>
  );
};
