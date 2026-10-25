import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken, clearToken, setToken } from '../services/api';
import { IUser, IWallet } from '../types';

interface AuthContextType {
  user: IUser | null;
  wallet: IWallet | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authMode: 'login' | 'register' | 'forgot';
  setAuthMode: (mode: 'login' | 'register' | 'forgot') => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  isBalanceVisible: boolean;
  toggleBalanceVisible: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [wallet, setWallet] = useState<IWallet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(() => {
    return localStorage.getItem('earnloop_balance_visible') !== 'false';
  });

  const toggleBalanceVisible = () => {
    setIsBalanceVisible(prev => {
      const next = !prev;
      localStorage.setItem('earnloop_balance_visible', String(next));
      return next;
    });
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const refreshUser = async () => {
    if (!getToken()) {
      setUser(null);
      setWallet(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      setUser(res.user);
      setWallet(res.wallet);
    } catch (err) {
      clearToken();
      setUser(null);
      setWallet(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const logout = () => {
    clearToken();
    setUser(null);
    setWallet(null);
    showToast('Logged out successfully', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        isLoading,
        refreshUser,
        logout,
        showAuthModal,
        setShowAuthModal,
        authMode,
        setAuthMode,
        toast,
        showToast,
        isBalanceVisible,
        toggleBalanceVisible,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
