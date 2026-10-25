import React from 'react';
import { Home, CreditCard, RefreshCw, Users, User } from 'lucide-react';

export type TabType = 'home' | 'upi' | 'makemoney' | 'team' | 'my' | 'admin' | 'tasks' | 'transactions';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onChangeTab }) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'upi' as TabType, label: 'UPI', icon: CreditCard },
    { id: 'makemoney' as TabType, label: 'Make money', icon: RefreshCw },
    { id: 'team' as TabType, label: 'Team', icon: Users },
    { id: 'my' as TabType, label: 'My', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t border-gray-100 z-50 flex items-center justify-around py-2 px-1 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 active:scale-95 ${
              isActive ? 'text-[#0088FF]' : 'text-[#8E9AA8]'
            }`}
          >
            <div className={`p-1 rounded-full ${isActive ? 'bg-[#EBF5FF]' : ''}`}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[11px] mt-0.5 font-medium ${isActive ? 'font-semibold text-[#0088FF]' : 'text-[#8E9AA8]'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
