import React, { useState } from 'react';
import { X, Copy, Check, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface InrPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageData: {
    amount: string;
    reward: string;
    formula?: string;
    total: string;
    tier?: string;
  } | null;
  onSuccess: () => void;
}

export const InrPaymentModal: React.FC<InrPaymentModalProps> = ({
  isOpen,
  onClose,
  packageData,
  onSuccess,
}) => {
  const { user, showToast, setShowAuthModal } = useAuth();
  const [copied, setCopied] = useState(false);
  const [utr, setUtr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  if (!isOpen || !packageData) return null;

  const upiId = 'paytm.earnloop@okaxis';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${upiId}%26pn=EarnLoop%26am=${packageData.amount}%26cu=INR`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    showToast('UPI ID copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateOrder = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.createBuyOrder({
        type: 'INR_BUY',
        fiatAmount: packageData.amount,
        tier: packageData.tier || 'Small',
        network: 'UPI',
      });
      setCreatedOrder(res.order);
      showToast('Order generated! Please pay and enter UTR.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to initialize order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitUtr = async () => {
    if (!createdOrder) {
      await handleCreateOrder();
      return;
    }
    if (!utr || utr.trim().length < 6) {
      showToast('Please enter a valid 12-digit UTR/Reference number', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.submitProof({
        orderId: createdOrder.id,
        utrNumber: utr.trim(),
      });
      showToast('Payment submitted successfully! Balance will be credited shortly.', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Submission failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
          <div>
            <h3 className="font-bold text-gray-900 text-base">UPI Payment & Verification</h3>
            <p className="text-xs text-gray-500">Order Amount: ₹{Number(packageData.amount).toLocaleString('en-IN')}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm">
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-[#0088FF]/10 via-[#0088FF]/5 to-white p-4 rounded-xl border border-blue-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 block">Total Mcoin to Receive</span>
              <span className="text-2xl font-black text-[#0088FF]">
                {Number(packageData.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-orange-600 font-bold block bg-orange-50 px-2 py-0.5 rounded-md">
                + ₹{Number(packageData.reward).toFixed(2)} Reward
              </span>
              <span className="text-[11px] text-gray-400 mt-1 block">1 Rs = 1 Mcoin</span>
            </div>
          </div>

          {/* QR Code and UPI ID */}
          <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-40 h-40 bg-white p-2 rounded-xl shadow-sm border border-gray-200 mb-2">
              <img src={qrUrl} alt="UPI QR Code" className="w-full h-full object-contain" />
            </div>
            <span className="text-xs text-gray-500 mb-2">Scan with GPay, PhonePe, Paytm, or BHIM</span>

            <div className="w-full flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200">
              <div className="truncate mr-2">
                <span className="text-[10px] text-gray-400 block uppercase font-bold">UPI ID</span>
                <span className="font-mono text-xs font-semibold text-gray-800">{upiId}</span>
              </div>
              <button
                onClick={handleCopyUpi}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0088FF] text-white text-xs font-medium active:scale-95 transition"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Step Instructions */}
          <div className="text-xs text-gray-600 space-y-1.5 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
            <p className="font-semibold text-blue-900">How to complete payment:</p>
            <p>1. Pay ₹{Number(packageData.amount).toLocaleString('en-IN')} using any UPI app.</p>
            <p>2. Copy the 12-digit <strong>UTR Number / Ref ID</strong> from the transaction receipt.</p>
            <p>3. Paste below and click <strong>Submit Verification</strong>.</p>
          </div>

          {/* UTR Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              Enter 12-digit UPI UTR / Reference Number
            </label>
            <input
              type="text"
              placeholder="e.g. 429618392104"
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0088FF]"
              maxLength={20}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-sm font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={createdOrder ? handleSubmitUtr : handleCreateOrder}
            disabled={isSubmitting}
            className="flex-1 py-2.5 bg-[#0088FF] hover:bg-[#0077E6] text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 active:scale-98 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : createdOrder ? 'Submit Verification' : 'I Have Paid (Enter UTR)'}
          </button>
        </div>
      </div>
    </div>
  );
};
