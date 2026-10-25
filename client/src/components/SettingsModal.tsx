import React, { useState } from 'react';
import { X, Lock, Shield, User, LogOut, CreditCard, ChevronRight, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { TabType } from './BottomNav';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin: () => void;
  onChangeTab: (tab: TabType) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenAdmin,
  onChangeTab,
}) => {
  const { user, logout, showToast, refreshUser } = useAuth();
  const [nickname, setNickname] = useState(user?.profile?.nickname || '');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleUpdateNickname = async () => {
    if (!nickname.trim()) return;
    setIsUpdating(true);
    try {
      await api.updateProfile({ nickname: nickname.trim() });
      await refreshUser();
      showToast('Nickname updated!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl flex flex-col text-sm">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
          <h3 className="font-bold text-gray-900 text-base">Security & Settings</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* User info */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">Registered Phone</span>
              <span className="font-bold text-gray-800 font-mono">+91 {user?.phone || 'Not Logged In'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">Invitation Code</span>
              <span className="font-bold text-[#0088FF] font-mono">{user?.referralCode || 'N/A'}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-1.5">
            <button
              onClick={() => {
                onClose();
                onChangeTab('upi');
              }}
              className="w-full p-3 rounded-xl border border-gray-100 hover:bg-gray-50 flex items-center justify-between text-xs font-semibold text-gray-800 transition"
            >
              <div className="flex items-center gap-2.5">
                <CreditCard size={16} className="text-[#0088FF]" />
                <span>Bind UPI & Bank Accounts</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>

            {/* Admin Portal Gateway */}
            <button
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="w-full p-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 flex items-center justify-between text-xs font-bold text-[#0088FF] transition"
            >
              <div className="flex items-center gap-2.5">
                <Shield size={16} />
                <span>Admin Management Panel</span>
              </div>
              <span className="text-[10px] bg-blue-200/60 px-2 py-0.5 rounded-full font-mono">PIN</span>
            </button>
          </div>

          {/* Logout button */}
          {user && (
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 border border-red-100"
            >
              <LogOut size={15} />
              <span>Sign Out Account</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
