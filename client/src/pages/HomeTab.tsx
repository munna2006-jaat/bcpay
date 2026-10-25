import React, { useState } from 'react';
import { Eye, EyeOff, ChevronRight, Gift, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TabType } from '../components/BottomNav';

interface HomeTabProps {
  onChangeTab: (tab: TabType) => void;
  onOpenSellModal: () => void;
  onOpenGuide: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  onChangeTab,
  onOpenSellModal,
  onOpenGuide,
}) => {
  const { user, wallet, isBalanceVisible, toggleBalanceVisible, setShowAuthModal } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);

  const rawBalance = wallet?.mcoinBalance || '0.0000';
  const displayBalance = isBalanceVisible
    ? Number(rawBalance).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    : '••••••';

  const handleMakeMoneyClick = () => {
    onChangeTab('makemoney');
  };

  const handleInviteClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    onChangeTab('team');
  };

  const handleWelcomeRewardsClick = () => {
    onChangeTab('tasks');
  };

  return (
    <div className="p-4 space-y-4">
      {/* 1. Total Assets Card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="flex items-center justify-between text-gray-700 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-gray-800">Total assets (Mcoin)</span>
            <button
              onClick={toggleBalanceVisible}
              className="text-gray-400 hover:text-gray-600 transition p-0.5"
              aria-label="Toggle balance visibility"
            >
              {isBalanceVisible ? <Eye size={17} /> : <EyeOff size={17} />}
            </button>
          </div>
        </div>

        {/* Big Balance */}
        <div className="py-1">
          <span className="text-4xl font-extrabold text-[#0088FF] tracking-tight">
            {displayBalance}
          </span>
        </div>

        {/* Currency Conversions */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100 font-medium">
          <span>1Rs=1Mcoin</span>
          <span>1USDT=110.5Mcoin</span>
        </div>
      </div>

      {/* 2. Invite Friends Gradient Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg p-5 bg-gradient-to-r from-[#FF7A00] via-[#FF5533] to-[#FF3366] text-white">
        {/* Background glow and decorative circles */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute right-4 top-2 text-4xl opacity-30 select-none">🎁</div>

        <div className="relative z-10 space-y-1">
          <h2 className="text-lg font-black tracking-tight drop-shadow-sm">
            Invite Friends,
          </h2>
          <div className="text-2xl font-black text-white drop-shadow-sm flex items-center gap-1">
            Share Rewards
            <Sparkles size={20} className="text-yellow-300 inline animate-pulse" />
          </div>
          <p className="text-xs text-white/90 pt-0.5 font-medium">
            Build your team, double your earnings
          </p>

          <div className="pt-3 flex items-center justify-between">
            <button
              onClick={handleInviteClick}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-[#FFF0A0] to-[#FFE066] text-orange-950 font-bold text-xs shadow-md hover:brightness-105 active:scale-95 transition"
            >
              Invite Now
            </button>

            {/* Slider Dots */}
            <div className="flex items-center gap-1.5 pr-2">
              <span className="w-4 h-1.5 bg-white rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-white/50 rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-white/50 rounded-full"></span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Make Money & Sell Action Buttons */}
      <div className="grid grid-cols-2 gap-3.5 pt-1">
        <button
          onClick={handleMakeMoneyClick}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF9000] to-[#FF7700] hover:from-[#E68200] hover:to-[#E66B00] text-white font-bold text-base shadow-[0_4px_12px_rgba(255,140,0,0.3)] active:scale-98 transition flex items-center justify-center gap-1.5"
        >
          <span>Make Money</span>
        </button>

        <button
          onClick={onOpenSellModal}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0088FF] to-[#0066EE] hover:from-[#0077E6] hover:to-[#0055CC] text-white font-bold text-base shadow-[0_4px_12px_rgba(0,136,255,0.3)] active:scale-98 transition flex items-center justify-center gap-1.5"
        >
          <span>Sell</span>
        </button>
      </div>

      {/* 4. Rewards Section */}
      <div className="space-y-3 pt-1">
        <h3 className="text-base font-bold text-gray-900 tracking-tight">Rewards</h3>

        {/* Welcome Rewards Card */}
        <div
          onClick={handleWelcomeRewardsClick}
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

        {/* "YOUR FRIENDS BUY, YOU EARN!" Card */}
        <div className="bg-gradient-to-b from-[#FFF5EC] to-[#FFF0E2] rounded-2xl p-5 border border-orange-200/60 shadow-[0_4px_16px_rgba(255,140,0,0.06)] relative overflow-hidden">
          {/* Floating Coin Decoration Top Right */}
          <div className="absolute -top-3 -right-3 w-16 h-16 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full opacity-20 pointer-events-none" />

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
              onClick={handleInviteClick}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF8800] to-[#FF6600] text-white font-bold text-sm shadow-[0_4px_12px_rgba(255,102,0,0.3)] hover:brightness-105 active:scale-98 transition flex items-center justify-center gap-1.5"
            >
              <span>Invite Now</span>
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
