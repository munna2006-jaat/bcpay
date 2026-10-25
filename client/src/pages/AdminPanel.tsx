import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  ArrowLeft,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  ShoppingBag,
  Settings,
  FileText,
  DollarSign,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { api, setAdminPin, getAdminPin, clearAdminPin } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface AdminPanelProps {
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const { showToast } = useAuth();
  const [pin, setPin] = useState(getAdminPin() || '');
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAdminPin());
  const [activeTab, setActiveTab] = useState<'metrics' | 'orders' | 'users' | 'tasks' | 'settings' | 'logs'>('metrics');

  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Balance adjustment modal
  const [adjustModal, setAdjustModal] = useState<{ user: any; action: 'CREDIT' | 'DEBIT'; amount: string; reason: string } | null>(null);

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.adminLogin(pin);
      setAdminPin(pin);
      setIsAuthenticated(true);
      showToast('Admin authenticated successfully', 'success');
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Invalid PIN', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, ordersRes, usersRes, tasksRes, settingsRes, logsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminOrders(),
        api.getAdminUsers(),
        api.getAdminTaskSubmissions(),
        api.getAdminSettings(),
        api.getAdminAuditLogs(),
      ]);
      setStats(statsRes.metrics);
      setOrders(ordersRes.orders);
      setUsers(usersRes.users);
      setSubmissions(tasksRes.submissions);
      setSettings(settingsRes.settings);
      setLogs(logsRes.logs);
    } catch (err: any) {
      showToast(err.message || 'Failed to load admin data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllAdminData();
    }
  }, [isAuthenticated]);

  const handleReviewOrder = async (orderId: string, decision: 'APPROVE' | 'REJECT') => {
    try {
      await api.reviewOrder({ orderId, decision });
      showToast(`Order ${decision.toLowerCase()}ed!`, 'success');
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Review failed', 'error');
    }
  };

  const handleReviewTask = async (submissionId: string, decision: 'APPROVE' | 'REJECT') => {
    try {
      await api.reviewTaskSubmission({ submissionId, decision });
      showToast(`Task submission ${decision.toLowerCase()}ed!`, 'success');
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Review failed', 'error');
    }
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModal) return;
    try {
      await api.adjustUserBalance({
        userId: adjustModal.user.id,
        amount: adjustModal.amount,
        action: adjustModal.action,
        reason: adjustModal.reason,
      });
      showToast(`Balance adjusted successfully!`, 'success');
      setAdjustModal(null);
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Adjustment failed', 'error');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateAdminSettings(settings);
      showToast('Settings saved successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 max-w-sm mx-auto space-y-4 animate-fade-in text-center pt-10">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0088FF] mx-auto flex items-center justify-center shadow-sm">
          <Shield size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Admin Control Center</h2>
        <p className="text-xs text-gray-500">
          Enter your protected administrator PIN to access management tools.
        </p>

        <form onSubmit={handlePinLogin} className="space-y-3 pt-2">
          <div className="relative">
            <input
              type="password"
              placeholder="Enter Admin PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-base tracking-widest font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0088FF]"
              required
            />
          </div>

          <div className="text-[11px] text-gray-400">
            Default PIN: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-gray-700">EarnLoop@Admin#2026</code>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#0088FF] hover:bg-[#0077E6] text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 active:scale-95 transition"
          >
            {isLoading ? 'Verifying...' : 'Unlock Admin Portal'}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full py-2 text-xs text-gray-500 hover:text-gray-800"
          >
            ← Return to App
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between py-1 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-1.5">
            <Shield size={18} className="text-[#0088FF]" />
            <h1 className="text-base font-bold text-gray-900">Admin Panel</h1>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={loadAllAdminData}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => {
              clearAdminPin();
              setIsAuthenticated(false);
            }}
            className="text-xs text-red-500 font-semibold px-2 py-1 rounded-lg hover:bg-red-50"
          >
            Lock
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
        {[
          { id: 'metrics', label: 'Overview' },
          { id: 'orders', label: `Orders (${orders.filter(o => o.status === 'UNDER_REVIEW').length})` },
          { id: 'users', label: 'Users' },
          { id: 'tasks', label: `Tasks (${submissions.filter(s => s.status === 'SUBMITTED').length})` },
          { id: 'settings', label: 'Settings' },
          { id: 'logs', label: 'Audit' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Overview */}
      {activeTab === 'metrics' && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-1">
              <span className="text-xs text-gray-400 font-semibold uppercase">Total Users</span>
              <div className="text-2xl font-black text-gray-900">{stats.totalUsers}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-1">
              <span className="text-xs text-gray-400 font-semibold uppercase">Pending Orders</span>
              <div className="text-2xl font-black text-orange-500">{stats.pendingOrders}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-1">
              <span className="text-xs text-gray-400 font-semibold uppercase">Mcoin Issued</span>
              <div className="text-2xl font-black text-[#0088FF]">{Number(stats.totalMcoinIssued).toFixed(0)}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-1">
              <span className="text-xs text-gray-400 font-semibold uppercase">0.3% Team Comm</span>
              <div className="text-2xl font-black text-green-600">{Number(stats.totalCommissionPaid).toFixed(0)}</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          {orders.length > 0 ? (
            orders.map((o) => (
              <div
                key={o.id}
                className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-gray-900">{o.orderNumber}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      o.status === 'APPROVED'
                        ? 'bg-green-100 text-green-700'
                        : o.status === 'REJECTED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {o.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 text-gray-600">
                  <div>User Phone: <strong>+91 {o.userPhone}</strong></div>
                  <div>Type: <strong>{o.type}</strong></div>
                  <div>Amount: <strong>{o.currency === 'INR' ? '₹' : '$'}{o.fiatAmount}</strong></div>
                  <div>Mcoin: <strong className="text-[#0088FF]">{o.totalMcoin}</strong></div>
                  <div className="col-span-2">UTR/TXID: <strong className="font-mono text-gray-900">{o.utrNumber || 'Pending'}</strong></div>
                </div>

                {o.status === 'UNDER_REVIEW' && (
                  <div className="flex gap-2 pt-2 border-t border-gray-50">
                    <button
                      onClick={() => handleReviewOrder(o.id, 'APPROVE')}
                      className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xs transition"
                    >
                      Approve & Credit
                    </button>
                    <button
                      onClick={() => handleReviewOrder(o.id, 'REJECT')}
                      className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-xs transition"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400 text-xs">No orders recorded yet</div>
          )}
        </div>
      )}

      {/* 3. Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-900 block">+91 {u.phone}</span>
                  <span className="text-[10px] text-gray-400 font-mono">Ref: {u.referralCode}</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-[#0088FF] block">
                    {Number(u.wallet?.mcoinBalance || 0).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-gray-400">Mcoin</span>
                </div>
              </div>

              <div className="flex gap-2 pt-1 border-t border-gray-50">
                <button
                  onClick={() => setAdjustModal({ user: u, action: 'CREDIT', amount: '50', reason: 'Admin bonus' })}
                  className="flex-1 py-1 bg-blue-50 text-[#0088FF] font-semibold rounded-lg text-xs hover:bg-blue-100"
                >
                  + Credit
                </button>
                <button
                  onClick={() => setAdjustModal({ user: u, action: 'DEBIT', amount: '50', reason: 'Admin adjustment' })}
                  className="flex-1 py-1 bg-red-50 text-red-600 font-semibold rounded-lg text-xs hover:bg-red-100"
                >
                  - Debit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">{sub.taskTitle}</span>
                <span className="font-bold text-orange-600">+{sub.rewardMcoin} Mcoin</span>
              </div>
              <div className="text-gray-600">
                User: <strong>+91 {sub.userPhone}</strong>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg text-gray-800 font-mono text-[11px]">
                Proof: {sub.proofText}
              </div>

              {sub.status === 'SUBMITTED' && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleReviewTask(sub.id, 'APPROVE')}
                    className="flex-1 py-1.5 bg-green-600 text-white font-bold rounded-lg text-xs"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReviewTask(sub.id, 'REJECT')}
                    className="flex-1 py-1.5 bg-red-500 text-white font-bold rounded-lg text-xs"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 5. Settings Tab */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-3 text-xs">
          <h3 className="font-bold text-gray-900 text-sm">Application Rates & Addresses</h3>

          <div className="space-y-1">
            <label className="font-bold text-gray-700">1 INR to Mcoin Ratio</label>
            <input
              type="text"
              value={settings.INR_TO_MCOIN_RATE || '1.0'}
              onChange={(e) => setSettings({ ...settings, INR_TO_MCOIN_RATE: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-700">1 USDT to Mcoin Ratio</label>
            <input
              type="text"
              value={settings.USDT_TO_MCOIN_RATE || '110.5'}
              onChange={(e) => setSettings({ ...settings, USDT_TO_MCOIN_RATE: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-700">Admin UPI ID</label>
            <input
              type="text"
              value={settings.ADMIN_UPI_ID || ''}
              onChange={(e) => setSettings({ ...settings, ADMIN_UPI_ID: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-700">Admin USDT TRC20 Address</label>
            <input
              type="text"
              value={settings.ADMIN_USDT_TRC20 || ''}
              onChange={(e) => setSettings({ ...settings, ADMIN_USDT_TRC20: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-700">Admin Access PIN</label>
            <input
              type="text"
              value={settings.ADMIN_PIN || ''}
              onChange={(e) => setSettings({ ...settings, ADMIN_PIN: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#0088FF] text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 active:scale-95 transition"
          >
            Save All Settings
          </button>
        </form>
      )}

      {/* 6. Audit Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-2">
          {logs.map((l) => (
            <div key={l.id} className="bg-white p-3 rounded-xl border border-gray-100 text-[11px] space-y-1">
              <div className="flex justify-between font-bold text-gray-900">
                <span>{l.action}</span>
                <span className="text-gray-400 font-normal">{new Date(l.createdAt).toLocaleString()}</span>
              </div>
              <div className="text-gray-600 font-mono">{l.details}</div>
            </div>
          ))}
        </div>
      )}

      {/* Balance Adjustment Modal */}
      {adjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleAdjustBalance}
            className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-3 text-xs"
          >
            <h3 className="font-bold text-gray-900 text-sm">
              {adjustModal.action} Balance for +91 {adjustModal.user.phone}
            </h3>

            <div>
              <label className="block text-gray-600 mb-1">Mcoin Amount</label>
              <input
                type="number"
                step="0.01"
                value={adjustModal.amount}
                onChange={(e) => setAdjustModal({ ...adjustModal, amount: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-xl font-bold text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Mandatory Audit Reason</label>
              <input
                type="text"
                placeholder="e.g. Promotional grant or manual adjustment"
                value={adjustModal.reason}
                onChange={(e) => setAdjustModal({ ...adjustModal, reason: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdjustModal(null)}
                className="flex-1 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-[#0088FF] text-white font-bold rounded-xl shadow-md"
              >
                Confirm {adjustModal.action}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
