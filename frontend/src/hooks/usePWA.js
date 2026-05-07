import { useState, useEffect, useCallback } from 'react';
import request from '../api/request';

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInWechat, setIsInWechat] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    // 1.2 Detect Android
    const android = /Android/i.test(navigator.userAgent);
    setIsAndroid(android);

    // 1.5 Detect WeChat
    const wechat = /MicroMessenger/i.test(navigator.userAgent);
    setIsInWechat(wechat);

    // 2. Detect Standalone mode (PWA active)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setIsStandalone(standalone);
    if (standalone) {
      setIsInstalled(true);
      checkAndClaimReward();
    }

    // 3. Listen for the install prompt (Chrome/Android/PC)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // If we get this event, the app is definitely not installed natively
      setIsInstalled(false);
    };

    // 4. Listen for successful installation
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      checkAndClaimReward();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const checkAndClaimReward = async () => {
    // Only claim if logged in (not guest)
    if (localStorage.getItem('isGuest') === 'true' || !localStorage.getItem('token')) {
      return;
    }

    // Prevent spamming
    if (localStorage.getItem('pwa_reward_claimed') === 'true') {
      return;
    }

    try {
      const res = await request.post('/auth/claim-install-reward');
      if (res && res.points) {
        localStorage.setItem('pwa_reward_claimed', 'true');
        // We could dispatch an event here to notify UI to show a toast, but usually points update via polling is enough
        window.dispatchEvent(new CustomEvent('pwa-reward-success', { detail: res.points }));
        window.dispatchEvent(new CustomEvent('points-updated'));
      }
    } catch (err) {
      console.error("Failed to claim PWA reward or already claimed", err);
      // Even if failed due to already claimed on backend, mark local cache to prevent future spams
      if (err.response?.status === 400) {
        localStorage.setItem('pwa_reward_claimed', 'true');
      }
    }
  };

  const promptInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  }, [deferredPrompt]);

  return {
    isInstallable: !!deferredPrompt,
    isStandalone,
    isIOS,
    isAndroid,
    isInWechat,
    isInstalled,
    promptInstall
  };
};
