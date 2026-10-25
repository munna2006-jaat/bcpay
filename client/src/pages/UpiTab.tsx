import React, { useState } from 'react';
import { CreditCard, Building, ShieldCheck, ArrowDownRight, ArrowUpRight, Check, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { TabType } from '../components/BottomNav';

interface UpiTabProps {
  onChangeTab: (tab: TabType) => void;
  onOpenSellModal: () => void;
}

export const UpiTab: React.FC<UpiTabProps> = ({ onChangeTab, onOpenSellModal }) => {
  const { user, wallet, refreshUser, showToast, setShowAuthModal } = useAuth();
  const [upiId, setUpiId] = useState(user?.profile?.upiId || '');
  const [bankAccount, setBankAccount] = useState(user?.profile?.bankAccount || '');
  const [bankIfsc, setBankIfsc] = useState(user?.profile?.bankIfsc || '');
  const [bankHolderName, setBankHolderName] = useState(user?.profile?.bankHolderName || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setIsSaving(true);
    try {
      await api.updateProfile({
        upiId: upiId.trim(),
        bankAccount: bankAccount.trim(),
        bankIfsc: bankIfsc.trim().toUpperCase(),
        bankHolderName: bankHolderName.trim(),
      });
      await refreshUser();
      showToast('Payment & UPI details saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update details', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="text-center py-1">
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">UPI & Bank Accounts</h1>
      </div>

      {/* Wallet Balance Strip */}
      <div className="bg-gradient-to-r from-blue-600 to-[#0088FF] rounded-2xl p-4 text-white shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs text-blue-100 block">Available Mcoin Balance</span>
          <span className="text-2xl font-black">{Number(wallet?.mcoinBalance || 0).toFixed(2)} Mcoin</span>
        </div>
        <button
          onClick={onOpenSellModal}
          className="px-4 py-2 bg-white text-[#0088FF] rounded-xl font-bold text-xs shadow-sm hover:bg-blue-50 active:scale-95 transition"
        >
          Sell / Withdraw
        </button>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onChangeTab('makemoney')}
          className="p-3.5 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-2.5 text-left hover:border-blue-200 transition active:scale-95"
        >
          <div className="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <ArrowDownRight size={18} />
          </div>
          <div>
            <div className="font-bold text-xs text-gray-900">Buy Mcoin</div>
            <div className="text-[10px] text-gray-400">Via UPI / USDT</div>
          </div>
        </button>

        <button
          onClick={onOpenSellModal}
          className="p-3.5 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-2.5 text-left hover:border-blue-200 transition active:scale-95"
        >
          <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0088FF] flex items-center justify-center shrink-0">
            <ArrowUpRight size={18} />
          </div>
          <div>
            <div className="font-bold text-xs text-gray-900">Sell Mcoin</div>
            <div className="text-[10px] text-gray-400">Withdraw to Bank</div>
          </div>
        </button>
      </div>

      {/* Bind UPI & Bank Details Form */}
      <form onSubmit={handleSaveDetails} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4 text-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
          <CreditCard size={18} className="text-[#0088FF]" />
          <h3 className="font-bold text-gray-900 text-sm">Bind Payout Information</h3>
        </div>

        {/* UPI ID */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700">UPI ID (VPA)</label>
          <input
            type="text"
            placeholder="e.g. yourname@oksbi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0088FF]"
          />
        </div>

        {/* Bank Holder Name */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700">Account Holder Name</label>
          <input
            type="text"
            placeholder="As per bank passbook"
            value={bankHolderName}
            onChange={(e) => setBankHolderName(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0088FF]"
          />
        </div>

        {/* Bank Account Number */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700">Bank Account Number</label>
          <input
            type="text"
            placeholder="e.g. 102938475612"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0088FF]"
          />
        </div>

        {/* IFSC Code */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700">IFSC Code</label>
          <input
            type="text"
            placeholder="e.g. SBIN0001234"
            value={bankIfsc}
            onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#0088FF]"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3 bg-[#0088FF] hover:bg-[#0077E6] text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 active:scale-98 transition flex items-center justify-center gap-2"
        >
          <Save size={16} />
          <span>{isSaving ? 'Saving...' : 'Save Payout Details'}</span>
        </button>
      </form>
    </div>
  );
};
