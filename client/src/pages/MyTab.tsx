import React, { useState } from 'react';
import {
  Settings,
  Eye,
  EyeOff,
  FileText,
  Compass,
  Headphones,
  Gift,
  ChevronRight,
  ArrowRight,
  LogOut,
  Shield,
  CreditCard,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TabType } from '../components/BottomNav';

interface MyTabProps {
  onChangeTab: (tab: TabType) => void;
  onOpenGuide: () => void;
  onOpenSupport: () => void;
  onOpenTransactions: () => void;
  onOpenSettings: () => void;
}

export const MyTab: React.FC<MyTabProps> = ({
  onChangeTab,
  onOpenGuide,
  onOpenSupport,
  onOpenTransactions,
  onOpenSettings,
}) => {
  const {
    user,
    wallet,
    isBalanceVisible,
    toggleBalanceVisible,
    setShowAuthModal,
    logout,
  } = useAuth();

  // If user is logged in, show user format e.g. "8619142008-26757" matching screenshot 2
  const userIdDisplay = user
    ? `${user.phone}-${user.id.slice(-5)}`
    : 'Guest (Click to Login)';

  const totalAssetsNum = Number(wallet?.mcoinBalance || '0').toFixed(0);
  const todayEarningsNum = Number(wallet?.todayEarnings || '0').toFixed(0);

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Top Bar matching Screenshot 2 */}
      <div className="flex items-center justify-between py-1">
        <div
          onClick={() => !user && setShowAuthModal(true)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
            <img src="/logo.svg" alt="EarnLoop" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-gray-900 text-base font-mono">
            {userIdDisplay}
          </span>
        </div>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-700 active:scale-95 transition"
          aria-label="Settings"
        >
          <Settings size={22} />
        </button>
      </div>

      {/* 2 Stat Cards matching Screenshot 2 */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Assets Card */}
        <div className="bg-[#F0F5FF] rounded-2xl p-4 border border-blue-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <span>Total assets</span>
            <button
              onClick={toggleBalanceVisible}
              className="text-gray-400 hover:text-gray-600"
            >
              {isBalanceVisible ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
          </div>

          <div className="text-2xl font-black text-gray-900">
            <span className="text-[#0088FF] mr-1">
              {isBalanceVisible ? totalAssetsNum : '••••'}
            </span>
            <span className="text-xs font-bold text-gray-700">Mcoin</span>
          </div>
        </div>

        {/* Today's earnings Card */}
        <div className="bg-[#F0F5FF] rounded-2xl p-4 border border-blue-100 space-y-2">
          <div className="text-xs text-gray-600 font-medium">
            Today's earnings
          </div>

          <div className="text-2xl font-black text-gray-900">
            <span className="text-[#0088FF] mr-1">
              {isBalanceVisible ? todayEarningsNum : '••••'}
            </span>
            <span className="text-xs font-bold text-gray-700">Mcoin</span>
          </div>
        </div>
      </div>

      {/* 3 Quick Action Icons matching Screenshot 2 */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] grid grid-cols-3 gap-2 text-center">
        {/* Transaction History */}
        <button
          onClick={onOpenTransactions}
          className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-gray-50 active:scale-95 transition"
        >
          <div className="w-11 h-11 rounded-full bg-blue-50 text-[#0088FF] flex items-center justify-center mb-1.5 shadow-sm">
            <FileText size={22} />
          </div>
          <span className="text-xs font-semibold text-gray-800 leading-tight">
            Transaction<br />History
          </span>
        </button>

        {/* User Guide */}
        <button
          onClick={onOpenGuide}
          className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-gray-50 active:scale-95 transition"
        >
          <div className="w-11 h-11 rounded-full bg-blue-50 text-[#0088FF] flex items-center justify-center mb-1.5 shadow-sm">
            <Compass size={22} />
          </div>
          <span className="text-xs font-semibold text-gray-800 leading-tight">
            User<br />Guide
          </span>
        </button>

        {/* Support */}
        <button
          onClick={onOpenSupport}
          className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-gray-50 active:scale-95 transition"
        >
          <div className="w-11 h-11 rounded-full bg-blue-50 text-[#0088FF] flex items-center justify-center mb-1.5 shadow-sm">
            <Headphones size={22} />
          </div>
          <span className="text-xs font-semibold text-gray-800 leading-tight">
            Support<br />24/7
          </span>
        </button>
      </div>

      {/* Welcome Rewards Card */}
      <div
        onClick={() => onChangeTab('tasks')}
        className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between cursor-pointer hover:border-blue-200 transition active:scale-98"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-sm">
            <Gift size={20} />
          </div>
          <span className="font-semibold text-gray-800 text-sm">Welcome Rewards</span>
        </div>

        <div className="flex items-center gap-1 text-[#FF5500] font-bold text-xs">
          <span>Up to 200Mcoin</span>
          <ChevronRight size={16} />
        </div>
      </div>

      {/* "YOUR FRIENDS BUY, YOU EARN!" Card matching Screenshot 2 */}
      <div className="bg-gradient-to-b from-[#FFF5EC] to-[#FFF0E2] rounded-2xl p-5 border border-orange-200/60 shadow-[0_4px_16px_rgba(255,140,0,0.06)] relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <h4 className="text-base font-black italic tracking-wide text-[#E65500]">
            YOUR FRIENDS BUY, YOU EARN!
          </h4>

          <div className="space-y-2 text-xs text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-[#FF6600] font-bold text-sm leading-none mt-0.5">✦</span>
              <p className="leading-snug">
                For every friend you invite to make a purchase, you earn a <strong className="text-[#FF5500]">0.3%</strong> reward
              </p>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-[#FF6600] font-bold text-sm leading-none mt-0.5">✦</span>
              <p className="leading-snug">
                If 20 friends each spend ₹100,000, you earn <strong className="text-[#FF5500]">₹6,000</strong> instantly.
              </p>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-[#FF6600] font-bold text-sm leading-none mt-0.5">✦</span>
              <p className="leading-snug">
                Invite more friends, earn more rewards!
              </p>
            </div>
          </div>

          <button
            onClick={() => onChangeTab('team')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF8800] to-[#FF6600] text-white font-bold text-sm shadow-[0_4px_12px_rgba(255,102,0,0.3)] hover:brightness-105 active:scale-98 transition flex items-center justify-center gap-1.5"
          >
            <span>Invite Now</span>
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
