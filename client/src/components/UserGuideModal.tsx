import React from 'react';
import { X, ShieldCheck, HelpCircle, CheckCircle, ArrowRight } from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0088FF]/10 text-[#0088FF] flex items-center justify-center font-bold">
              ?
            </div>
            <h3 className="font-bold text-gray-900 text-base">Rules for Purchasing Mcoin</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-gray-600">
          <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 space-y-1">
            <div className="text-xs font-semibold text-blue-900 uppercase tracking-wider">Exchange Rate Standards</div>
            <div className="flex items-center justify-between text-gray-800 font-semibold pt-1">
              <span>1 INR (₹) = 1.00 Mcoin</span>
              <span>1 USDT ($) = 110.50 Mcoin</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle size={16} className="text-[#0088FF]" /> How to Buy Mcoin with INR (UPI)
            </h4>
            <p className="text-xs leading-relaxed text-gray-600">
              1. Navigate to <strong>Make Money</strong> and select the <strong>Buy Mcoin by INR</strong> tab.<br/>
              2. Choose your preferred package tier (Small, Middle, or Large) and click <strong>Buy</strong>.<br/>
              3. Scan the UPI QR code or copy the official UPI ID. Pay through any UPI App (GPay, PhonePe, Paytm).<br/>
              4. Copy the 12-digit <strong>UTR / Reference ID</strong> from your payment receipt and submit it.<br/>
              5. Once verified, your Mcoins and package bonus will be instantly credited to your wallet.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle size={16} className="text-[#0088FF]" /> How to Buy Mcoin with USDT
            </h4>
            <p className="text-xs leading-relaxed text-gray-600">
              1. Select the <strong>Buy Mcoin by USDT</strong> tab.<br/>
              2. Enter the USDT transfer amount (Rate: 1 USDT = 110.5 Mcoin).<br/>
              3. Choose the network (TRC20 recommended for fastest confirmation and lowest fees).<br/>
              4. Transfer the exact amount to the official deposit address and submit the Transaction Hash (TXID).
            </p>
          </div>

          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <ShieldCheck size={16} /> Important Security Notice
            </div>
            <p>
              Always copy the UPI ID or USDT wallet address directly from the application every time you make a transfer. Do not save addresses for future payments.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#0088FF] hover:bg-[#0077E6] text-white font-semibold rounded-xl transition text-sm shadow-md shadow-blue-500/20 active:scale-98"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
