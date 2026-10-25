import React, { useState } from 'react';
import { X, Copy, Check, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface UsdtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  usdtAmount: string;
  network: string;
  totalMcoin: string;
  onSuccess: () => void;
}

export const UsdtPaymentModal: React.FC<UsdtPaymentModalProps> = ({
  isOpen,
  onClose,
  usdtAmount,
  network,
  totalMcoin,
  onSuccess,
}) => {
  const { user, showToast, setShowAuthModal } = useAuth();
  const [copied, setCopied] = useState(false);
  const [txid, setTxid] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  if (!isOpen) return null;

  const trc20Address = 'TQn9Y2khEsLJW1ChVWFMSMeSTow5KaxUSDT';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${trc20Address}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(trc20Address);
    setCopied(true);
    showToast('USDT TRC20 address copied!', 'success');
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
        type: 'USDT_BUY',
        fiatAmount: usdtAmount,
        network: network || 'TRC20',
      });
      setCreatedOrder(res.order);
      showToast('Order created! Please transfer USDT and enter TXID.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to create USDT order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitTxid = async () => {
    if (!createdOrder) {
      await handleCreateOrder();
      return;
    }
    if (!txid || txid.trim().length < 8) {
      showToast('Please enter a valid Transaction Hash / TXID', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.submitProof({
        orderId: createdOrder.id,
        utrNumber: txid.trim(),
      });
      showToast('USDT payment proof submitted! Under review.', 'success');
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
            <h3 className="font-bold text-gray-900 text-base">USDT Deposit Address</h3>
            <p className="text-xs text-gray-500">Network: {network || 'TRC20'}</p>
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
          {/* Summary Box */}
          <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 block">Transfer Amount</span>
              <span className="text-xl font-black text-gray-900">${usdtAmount} USDT</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 block">Total Mcoin</span>
              <span className="text-xl font-black text-[#0088FF]">{Number(totalMcoin).toFixed(2)}</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-40 h-40 bg-white p-2 rounded-xl shadow-sm border border-gray-200 mb-2">
              <img src={qrUrl} alt="USDT QR Code" className="w-full h-full object-contain" />
            </div>

            <div className="w-full p-2.5 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
              <div className="truncate mr-2">
                <span className="text-[10px] text-gray-400 block uppercase font-bold">TRC20 Deposit Address</span>
                <span className="font-mono text-xs font-semibold text-gray-800 break-all">{trc20Address}</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0088FF] text-white text-xs font-medium active:scale-95 transition"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Warning */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <span>
              Send only USDT to this address using the {network || 'TRC20'} network. Sending any other currency will result in permanent loss.
            </span>
          </div>

          {/* TXID Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              Transaction Hash / TXID
            </label>
            <input
              type="text"
              placeholder="e.g. 8d39f7a...3b21"
              value={txid}
              onChange={(e) => setTxid(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0088FF]"
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
            onClick={createdOrder ? handleSubmitTxid : handleCreateOrder}
            disabled={isSubmitting}
            className="flex-1 py-2.5 bg-[#0088FF] hover:bg-[#0077E6] text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 active:scale-98 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : createdOrder ? 'Submit Verification' : 'I Have Transferred (Enter TXID)'}
          </button>
        </div>
      </div>
    </div>
  );
};
