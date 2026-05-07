import axios from 'axios';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || (import.meta.env.DEV
    ? 'http://localhost:8000/api'
    : '/api'),
  timeout: 300000, // 增加到 5 分钟，防止生图超时
});

// 请求拦截器：注入 Token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 错误计数：10秒内连续5次才触发维护，防止网络抖动
let _errorCount = 0;
let _lastErrorTime = 0;

// 响应拦截器：处理鉴权失败
request.interceptors.response.use(
  (response) => { _errorCount = 0; return response.data; },
  (error) => {
    if (error.response?.status === 503 || !error.response) {
      const now = Date.now();
      if (now - _lastErrorTime > 10000) _errorCount = 0; // 超过10秒重置
      _lastErrorTime = now;
      _errorCount++;
      if (_errorCount >= 5) {
        window.dispatchEvent(new CustomEvent('system-maintenance'));
      }
      return Promise.reject(error);
    }
    _errorCount = 0;
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      const isGuest = localStorage.getItem('isGuest') === 'true';
      if (!isGuest && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('isGuest');
  window.location.href = '/login';
};

export default request;
