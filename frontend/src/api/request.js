import axios from 'axios';

const request = axios.create({
  baseURL: import.meta.env.DEV 
    ? 'http://localhost:8000/api' 
    : 'http://119.29.232.114/api',
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

// 响应拦截器：处理鉴权失败
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 503) {
      // 触发全局维护事件
      window.dispatchEvent(new CustomEvent('system-maintenance'));
      return new Promise(() => {}); // 停止后续链式调用
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

export default request;
