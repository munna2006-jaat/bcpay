import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Gift, Users, Award, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ILedgerTransaction } from '../types';

interface TransactionsPageProps {
  onBack: () => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<ILedgerTransaction[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTxs = async () => {
      try {
        const res = await api.getTransactions();
        setTransactions(res.transactions);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchTxs();
  }, [user]);

  const filtered = transactions.filter((t) => {
    const isCredit = ['DEPOSIT_CREDIT', 'WELCOME_BONUS', 'TASK_REWARD', 'REFERRAL_COMMISSION'].includes(t.type);
    if (filter === 'CREDIT') return isCredit;
    if (filter === 'DEBIT') return !isCredit;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'WELCOME_BONUS':
        return <Gift size={16} className="text-amber-500" />;
      case 'REFERRAL_COMMISSION':
        return <Users size={16} className="text-purple-500" />;
      case 'TASK_REWARD':
        return <Award size={16} className="text-green-500" />;
      case 'WITHDRAWAL_DEBIT':
        return <ArrowUpRight size={16} className="text-red-500" />;
      default:
        return <ArrowDownLeft size={16} className="text-[#0088FF]" />;
    }
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center gap-3 py-1 border-b border-gray-100">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700 active:scale-95 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-bold text-gray-900">Transaction History</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
        {(['ALL', 'CREDIT', 'DEBIT'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 py-1.5 rounded-lg transition ${
              filter === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab === 'ALL' ? 'All' : tab === 'CREDIT' ? 'Earnings' : 'Withdrawals'}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-2.5">
        {filtered.length > 0 ? (
          filtered.map((t) => {
            const isCredit = ['DEPOSIT_CREDIT', 'WELCOME_BONUS', 'TASK_REWARD', 'REFERRAL_COMMISSION'].includes(t.type);
            return (
              <div
                key={t.id}
                className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                    {getIcon(t.type)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{t.description}</h4>
                    <span className="text-[10px] text-gray-400">
                      {new Date(t.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-black block ${
                      isCredit ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {isCredit ? '+' : '-'}{Number(t.amount).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Bal: {Number(t.balanceAfter).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-400 text-xs">
            No transactions found
          </div>
        )}
      </div>
    </div>
  );
};
