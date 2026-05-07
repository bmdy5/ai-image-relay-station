const CACHE_KEY = 'visionary_user_cache';

export const saveUserCache = (user) => {
  if (!user) return;
  const token = localStorage.getItem('token');
  const cache = {
    user,
    tokenPrefix: token ? token.substring(0, 8) : '',
    time: Date.now()
  };
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (e) {}
};

export const loadUserCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    const token = localStorage.getItem('token');
    if (!token || !cache.tokenPrefix || token.substring(0, 8) !== cache.tokenPrefix) {
      clearUserCache();
      return null;
    }
    return cache.user;
  } catch (e) { return null; }
};

export const clearUserCache = () => {
  localStorage.removeItem(CACHE_KEY);
};
