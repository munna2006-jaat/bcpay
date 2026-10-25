import React, { useState } from 'react';
import { X, ArrowDownRight, AlertCircle, Building, Wallet as WalletIcon } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, wallet, showToast, refreshUser } = useAuth();
  const [amount, setAmount] = useState('100');
  const [destinationType, setDestinationType] = useState<'UPI' | 'BANK'>('UPI');
  const [destinationValue, setDestinationValue] = useState(user?.profile?.upiId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentBalance = Number(wallet?.mcoinBalance || '0');

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to sell Mcoin', 'error');
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 100) {
      showToast('Minimum withdrawal amount is 100 Mcoin', 'error');
      return;
    }

    if (numAmount > currentBalance) {
      showToast('Insufficient Mcoin balance', 'error');
      return;
    }

    if (!destinationValue || destinationValue.trim().length < 4) {
      showToast(`Please enter your valid ${destinationType === 'UPI' ? 'UPI ID' : 'Bank Account Number'}`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createWithdrawal({
        mcoinAmount: amount,
        destinationType,
        destinationValue: destinationValue.trim(),
      });
      showToast('Sell order submitted successfully! Payout will be processed shortly.', 'success');
      await refreshUser();
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Withdrawal failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0088FF]/10 text-[#0088FF] flex items-center justify-center">
              <ArrowDownRight size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Sell Mcoin (Withdraw INR)</h3>
              <p className="text-xs text-gray-500">Available: {currentBalance.toFixed(2)} Mcoin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleWithdraw} className="p-5 space-y-4 text-sm">
          {/* Amount input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-gray-700">Mcoin Amount to Sell</label>
              <button
                type="button"
                onClick={() => setAmount(Math.floor(currentBalance).toString())}
                className="text-[#0088FF] font-semibold hover:underline"
              >
                Max ({Math.floor(currentBalance)})
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                min="100"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-base font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0088FF]"
                required
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-gray-400">Mcoin</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 pt-0.5">
              <span>Conversion: 1 Mcoin = ₹1.00</span>
              <span className="font-bold text-gray-800">You Receive: ₹{Number(amount || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Destination Type Toggle */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">Payout Method</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDestinationType('UPI')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  destinationType === 'UPI'
                    ? 'border-[#0088FF] bg-blue-50 text-[#0088FF]'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <WalletIcon size={14} /> UPI ID
              </button>
              <button
                type="button"
                onClick={() => setDestinationType('BANK')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  destinationType === 'BANK'
                    ? 'border-[#0088FF] bg-blue-50 text-[#0088FF]'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Building size={14} /> Bank Account
              </button>
            </div>
          </div>

          {/* Destination Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              {destinationType === 'UPI' ? 'Enter UPI ID (VPA)' : 'Enter Bank Account & IFSC'}
            </label>
            <input
              type="text"
              placeholder={destinationType === 'UPI' ? 'e.g. yourname@okhdfcbank' : 'A/C: 1234567890, IFSC: HDFC0001234'}
              value={destinationValue}
              onChange={(e) => setDestinationValue(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0088FF]"
              required
            />
          </div>

          {/* Notice */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs text-gray-500 space-y-1">
            <p>• Minimum withdrawal: 100 Mcoin</p>
            <p>• Withdrawal requests are audited and processed within 15–30 minutes.</p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || currentBalance < 100}
              className="flex-1 py-2.5 bg-[#0088FF] hover:bg-[#0077E6] text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 active:scale-98 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Confirm Sell Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
