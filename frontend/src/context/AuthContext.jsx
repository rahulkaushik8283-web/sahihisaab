import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('sahihisaab_token') || 'user_demo_rahul_123');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('sahihisaab_token', token);
      fetchProfile();
    } else {
      localStorage.removeItem('sahihisaab_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.getProfile();
      if (res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const loginWithOtp = async (phone, otp) => {
    const res = await api.verifyOtp(phone, otp);
    if (res.token) {
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.error || 'Login failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = async (data) => {
    const res = await api.updateProfile(data);
    if (res.user) {
      setUser(res.user);
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, loginWithOtp, logout, updateUserProfile, refreshProfile: fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
