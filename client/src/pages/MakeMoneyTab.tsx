import React, { useState } from 'react';
import { PlayCircle, ShieldAlert, ArrowRight, BookOpen } from 'lucide-react';
import { INR_PACKAGES } from '../data/packages';
import { InrPaymentModal } from '../components/InrPaymentModal';
import { UsdtPaymentModal } from '../components/UsdtPaymentModal';
import { useAuth } from '../context/AuthContext';

interface MakeMoneyTabProps {
  onOpenGuide: () => void;
}

export const MakeMoneyTab: React.FC<MakeMoneyTabProps> = ({ onOpenGuide }) => {
  const { user, setShowAuthModal, refreshUser } = useAuth();
  const [currencyMode, setCurrencyMode] = useState<'INR' | 'USDT'>('INR');
  const [inrTier, setInrTier] = useState<'Small' | 'Middle' | 'Large'>('Small');

  // USDT State
  const [usdtAmount, setUsdtAmount] = useState('100');
  const [usdtNetwork, setUsdtNetwork] = useState('TRC20 (Tron)');
  const usdtRatio = 110.5;

  // Modals
  const [selectedInrPackage, setSelectedInrPackage] = useState<any>(null);
  const [isUsdtModalOpen, setIsUsdtModalOpen] = useState(false);

  const calculatedUsdtMcoin = (Number(usdtAmount || 0) * usdtRatio).toFixed(2);

  const handleInrBuyClick = (pkg: any) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedInrPackage({ ...pkg, tier: inrTier });
  };

  const handleUsdtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setIsUsdtModalOpen(true);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Top Title */}
      <div className="text-center py-1">
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">Make Money</h1>
      </div>

      {/* Main Toggle Pills (Buy Mcoin by INR / Buy Mcoin by USDT) */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrencyMode('INR')}
          className={`flex-1 py-3 px-2 rounded-full font-bold text-xs sm:text-sm transition-all duration-200 active:scale-95 ${
            currencyMode === 'INR'
              ? 'bg-[#0088FF] text-white shadow-[0_4px_12px_rgba(0,136,255,0.3)]'
              : 'bg-white text-[#0088FF] border border-[#0088FF] hover:bg-blue-50/50'
          }`}
        >
          Buy Mcoin by INR
        </button>

        <button
          onClick={() => setCurrencyMode('USDT')}
          className={`flex-1 py-3 px-2 rounded-full font-bold text-xs sm:text-sm transition-all duration-200 active:scale-95 ${
            currencyMode === 'USDT'
              ? 'bg-[#0088FF] text-white shadow-[0_4px_12px_rgba(0,136,255,0.3)]'
              : 'bg-white text-[#0088FF] border border-[#0088FF] hover:bg-blue-50/50'
          }`}
        >
          Buy Mcoin by USDT
        </button>
      </div>

      {/* ================= INR VIEW (Screenshot 4) ================= */}
      {currencyMode === 'INR' && (
        <div className="space-y-4 animate-fade-in">
          {/* Sub-filters (Small, Middle, Large + Tutorial) */}
          <div className="flex items-center justify-between border-b border-gray-200/80 pb-1">
            <div className="flex items-center gap-6">
              {(['Small', 'Middle', 'Large'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setInrTier(tier)}
                  className={`text-sm font-bold pb-2 relative transition ${
                    inrTier === tier
                      ? 'text-[#0088FF]'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tier}
                  {inrTier === tier && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0088FF] rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0088FF] text-xs font-bold hover:bg-blue-100 transition active:scale-95"
            >
              <PlayCircle size={14} />
              <span>Tutorial</span>
            </button>
          </div>

          {/* Order Cards List matching Screenshot 4 */}
          <div className="space-y-3">
            {INR_PACKAGES[inrTier].map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-blue-100 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-base font-extrabold text-gray-900">
                    Order Amount: <span className="text-black">₹{Number(item.amount).toLocaleString('en-IN')}</span>
                  </div>

                  <button
                    onClick={() => handleInrBuyClick(item)}
                    className="px-6 py-1.5 rounded-full bg-[#0088FF] hover:bg-[#0077E6] text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition"
                  >
                    Buy
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs font-medium pt-1 border-t border-gray-50">
                  <div className="text-[#FF5500] font-bold">
                    Reward:{Number(item.reward).toFixed(2)} ({item.formula})
                  </div>
                  <div className="text-[#FF5500] font-semibold">
                    Total Mcoin: {Number(item.total).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= USDT VIEW (Screenshot 5) ================= */}
      {currencyMode === 'USDT' && (
        <div className="space-y-4 animate-fade-in">
          {/* Top Quick Links */}
          <div className="flex items-center justify-between">
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#0088FF] text-xs font-bold hover:bg-blue-100 transition"
            >
              <PlayCircle size={14} />
              <span>Video Tutorial</span>
            </button>

            <button
              onClick={onOpenGuide}
              className="px-4 py-1.5 rounded-full bg-blue-50 text-[#0088FF] text-xs font-bold hover:bg-blue-100 transition"
            >
              Rules
            </button>
          </div>

          {/* USDT Calculation Form matching Screenshot 5 */}
          <form
            onSubmit={handleUsdtSubmit}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.03)] space-y-4"
          >
            {/* Input transfer amount */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800">
                Transfer amount (USDT)
              </label>
              <div className="relative flex items-center bg-gray-50 rounded-xl border border-gray-200 overflow-hidden focus-within:border-[#0088FF] focus-within:ring-2 focus-within:ring-blue-100">
                <span className="pl-4 text-xl font-bold text-gray-500 select-none">$</span>
                <input
                  type="number"
                  min="10"
                  step="1"
                  value={usdtAmount}
                  onChange={(e) => setUsdtAmount(e.target.value)}
                  placeholder="100"
                  className="w-full px-3 py-3 bg-transparent text-xl font-black text-gray-900 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Ratio & Details */}
            <div className="text-xs space-y-1.5 pt-1 text-gray-700">
              <div className="text-gray-500">
                Ratio: <strong className="text-gray-900 font-bold">1USDT = {usdtRatio}Mcoin</strong>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0088FF]" />
                  <span className="font-medium text-gray-600">Reward:</span>
                </div>
                <span className="font-bold text-[#FF5500]">0.00</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0088FF]" />
                  <span className="font-medium text-gray-600">Total Mcoin:</span>
                </div>
                <span className="font-black text-[#FF5500] text-base">{calculatedUsdtMcoin}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-gray-200 my-2" />

            {/* Network Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800">Select NetWork</label>
              <select
                value={usdtNetwork}
                onChange={(e) => setUsdtNetwork(e.target.value)}
                className="w-full px-3.5 py-3 border border-gray-300 rounded-xl bg-white text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0088FF]"
              >
                <option value="TRC20 (Tron)">TRC20 (Tron) - Fast & Low Fee</option>
                <option value="ERC20 (Ethereum)">ERC20 (Ethereum)</option>
                <option value="BEP20 (BNB Smart Chain)">BEP20 (BNB Smart Chain)</option>
              </select>
            </div>

            {/* Peach Warning Box from Screenshot 5 */}
            <div className="bg-[#FFF8EC] p-3.5 rounded-xl border border-amber-200/60 text-xs text-amber-900/90 flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-amber-400 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                !
              </div>
              <div className="space-y-0.5 leading-relaxed text-[11px]">
                <p className="font-semibold text-amber-950">
                  For your security, please copy the USDT address from the APP <strong className="text-orange-600">every time</strong>.
                </p>
                <p className="text-amber-800/80">
                  The address may change. Using a saved address may result in loss of funds.
                </p>
              </div>
            </div>

            {/* Blue Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#0088FF] hover:bg-[#0077E6] text-white font-bold text-base shadow-[0_4px_16px_rgba(0,136,255,0.35)] active:scale-98 transition"
            >
              Submit
            </button>
          </form>
        </div>
      )}

      {/* INR Payment Drawer/Modal */}
      <InrPaymentModal
        isOpen={!!selectedInrPackage}
        onClose={() => setSelectedInrPackage(null)}
        packageData={selectedInrPackage}
        onSuccess={() => {
          refreshUser();
        }}
      />

      {/* USDT Payment Modal */}
      <UsdtPaymentModal
        isOpen={isUsdtModalOpen}
        onClose={() => setIsUsdtModalOpen(false)}
        usdtAmount={usdtAmount}
        network={usdtNetwork}
        totalMcoin={calculatedUsdtMcoin}
        onSuccess={() => {
          refreshUser();
        }}
      />
    </div>
  );
};
