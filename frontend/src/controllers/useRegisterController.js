import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import request from '../api/request';

export const useRegisterController = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const fingerprint = btoa(navigator.userAgent).substring(0, 32);
      await request.post('/auth/register', { username, password, fingerprint });
      alert('注册成功！');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || '注册失败');
    }
  };

  return {
    username, setUsername,
    password, setPassword,
    showPassword, setShowPassword,
    error, handleRegister
  };
};
