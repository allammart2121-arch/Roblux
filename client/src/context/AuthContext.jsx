import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState(null); // 'login' | 'register' | null
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadUser = async () => {
    const token = localStorage.getItem('roblox_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await apiService.getProfile();
      if (data.success) {
        setUser(data.user);
      } else {
        localStorage.removeItem('roblox_token');
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      localStorage.removeItem('roblox_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (credentials) => {
    const data = await apiService.login(credentials);
    if (data.success) {
      localStorage.setItem('roblox_token', data.token);
      setUser(data.user);
      setAuthModal(null);
      showToast(data.message || '¡Bienvenido de nuevo!');
      return data;
    }
  };

  const register = async (userData) => {
    const data = await apiService.register(userData);
    if (data.success) {
      localStorage.setItem('roblox_token', data.token);
      setUser(data.user);
      setAuthModal(null);
      showToast(data.message || '¡Cuenta creada exitosamente!');
      return data;
    }
  };

  const logout = () => {
    localStorage.removeItem('roblox_token');
    setUser(null);
    showToast('Has cerrado sesión correctamente.', 'success');
  };

  const refreshBalance = async () => {
    if (!user) return;
    try {
      const data = await apiService.getWalletBalance();
      if (data.success) {
        setUser(prev => prev ? { ...prev, walletBalance: data.walletBalance } : null);
      }
    } catch (err) {
      console.error('Error refreshing balance:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      refreshBalance,
      authModal,
      setAuthModal,
      walletModalOpen,
      setWalletModalOpen,
      toast,
      showToast
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
