import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import request from '../api/request';

export const useForgotPasswordController = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      setError('请输入有效的邮箱地址');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await request.post('/auth/forgot-password/send-code', { email });
      setCountdown(60);
      setCodeSent(true);
      setSuccess('验证码已发送，请检查您的邮箱');
    } catch (err) {
      setError(err.response?.data?.detail || '发送失败，请重试');
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!code) {
      setError('请输入验证码');
      return;
    }
    if (!newPassword) {
      setError('请输入新密码');
      return;
    }
    if (newPassword.length < 6) {
      setError('密码长度不能少于 6 位');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }

    setLoading(true);
    try {
      const res = await request.post('/auth/forgot-password/reset', {
        email,
        code,
        new_password: newPassword
      });
      
      // 自动登录逻辑
      if (res.access_token) {
        localStorage.setItem('token', res.access_token);
        setSuccess('密码重置成功！已为您自动登录');
        setTimeout(() => navigate('/'), 1500);
      } else {
        setSuccess(res.message || '密码重置成功！');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || '重置失败，请重试');
    }
    setLoading(false);
  };

  return {
    email, setEmail,
    code, setCode,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    error, success,
    loading, countdown,
    codeSent,
    handleSendCode,
    handleReset
  };
};
