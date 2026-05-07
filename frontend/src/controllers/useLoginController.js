import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import request from '../api/request';

export const useLoginController = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await request.post('/auth/login', { username, password });
      localStorage.setItem('token', data.access_token);
      localStorage.removeItem('isGuest');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || '登录失败');
      setPassword('');
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    error,
    handleLogin
  };
};
