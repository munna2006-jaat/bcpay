import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { HomeTab } from './pages/HomeTab';
import { MakeMoneyTab } from './pages/MakeMoneyTab';
import { TeamTab } from './pages/TeamTab';
import { UpiTab } from './pages/UpiTab';
import { MyTab } from './pages/MyTab';
import { TasksPage } from './pages/TasksPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AdminPanel } from './pages/AdminPanel';
import { AuthModal } from './pages/AuthModal';
import { UserGuideModal } from './components/UserGuideModal';
import { SupportModal } from './components/SupportModal';
import { WithdrawModal } from './components/WithdrawModal';
import { SettingsModal } from './components/SettingsModal';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export function App() {
  const { toast } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [previousTab, setPreviousTab] = useState<TabType>('home');

  // Modals state
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const switchTab = (tab: TabType) => {
    setPreviousTab(currentTab);
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#EEF2F6] flex justify-center selection:bg-[#0088FF] selection:text-white">
      {/* Mobile Shell (Pixel-perfect width) */}
      <div className="w-full max-w-[480px] min-h-screen bg-white relative flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.06)]">
        {/* Sticky Top Header (on primary tabs) */}
        {['home', 'upi', 'makemoney', 'team', 'my'].includes(currentTab) && (
          <Header
            onOpenGuide={() => setIsGuideOpen(true)}
            showGuideButton={currentTab === 'home' || currentTab === 'my'}
          />
        )}

        {/* Main Scrollable Content */}
        <main className="flex-1 pb-24">
          {currentTab === 'home' && (
            <HomeTab
              onChangeTab={switchTab}
              onOpenSellModal={() => setIsSellModalOpen(true)}
              onOpenGuide={() => setIsGuideOpen(true)}
            />
          )}

          {currentTab === 'upi' && (
            <UpiTab
              onChangeTab={switchTab}
              onOpenSellModal={() => setIsSellModalOpen(true)}
            />
          )}

          {currentTab === 'makemoney' && (
            <MakeMoneyTab onOpenGuide={() => setIsGuideOpen(true)} />
          )}

          {currentTab === 'team' && <TeamTab />}

          {currentTab === 'my' && (
            <MyTab
              onChangeTab={switchTab}
              onOpenGuide={() => setIsGuideOpen(true)}
              onOpenSupport={() => setIsSupportOpen(true)}
              onOpenTransactions={() => switchTab('transactions')}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}

          {currentTab === 'tasks' && (
            <TasksPage onBack={() => switchTab(previousTab || 'home')} />
          )}

          {currentTab === 'transactions' && (
            <TransactionsPage onBack={() => switchTab('my')} />
          )}

          {currentTab === 'admin' && (
            <AdminPanel onBack={() => switchTab('home')} />
          )}
        </main>

        {/* Sticky Bottom Navigation (only on primary tabs) */}
        {['home', 'upi', 'makemoney', 'team', 'my'].includes(currentTab) && (
          <BottomNav currentTab={currentTab} onChangeTab={switchTab} />
        )}

        {/* Global Toast Notification */}
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-xs w-full px-4 animate-bounce">
            <div
              className={`p-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md ${
                toast.type === 'success'
                  ? 'bg-green-600 text-white border-green-500'
                  : toast.type === 'error'
                  ? 'bg-red-600 text-white border-red-500'
                  : 'bg-gray-900 text-white border-gray-800'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 size={16} className="shrink-0" />
              ) : toast.type === 'error' ? (
                <AlertCircle size={16} className="shrink-0" />
              ) : (
                <Info size={16} className="shrink-0" />
              )}
              <span className="leading-snug">{toast.message}</span>
            </div>
          </div>
        )}

        {/* Global Modals */}
        <UserGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
        <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
        <WithdrawModal
          isOpen={isSellModalOpen}
          onClose={() => setIsSellModalOpen(false)}
          onSuccess={() => switchTab('transactions')}
        />
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onOpenAdmin={() => switchTab('admin')}
          onChangeTab={switchTab}
        />
        <AuthModal />
      </div>
    </div>
  );
}
export default App;
