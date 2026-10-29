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

  const refreshBalance = async () => {
    const token = localStorage.getItem('roblox_token');
    if (!token) return;
    try {
      const data = await apiService.getWalletBalance();
      if (data.success && typeof data.walletBalance === 'number') {
        setUser(prev => {
          if (!prev) return prev;
          if (prev.walletBalance !== data.walletBalance) {
            return { ...prev, walletBalance: data.walletBalance };
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Error refreshing balance:', err);
    }
  };

  useEffect(() => {
    loadUser();

    // Auto-refresh balance every 3 seconds so new deposits reflect instantly without page reload
    const interval = setInterval(() => {
      const token = localStorage.getItem('roblox_token');
      if (token) {
        refreshBalance();
      }
    }, 3000);

    // Refresh immediately when returning to the tab
    const handleFocus = () => {
      const token = localStorage.getItem('roblox_token');
      if (token) {
        refreshBalance();
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

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
