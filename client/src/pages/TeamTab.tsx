import React, { useState, useEffect } from 'react';
import { Copy, Check, Users, Sparkles, Share2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const TeamTab: React.FC = () => {
  const { user, showToast, setShowAuthModal } = useAuth();
  const [teamData, setTeamData] = useState<any>({
    totalCommission: '0.0000',
    todayCommission: '0.0000',
    totalInvites: 0,
    todayInvites: 0,
    invitationCode: user?.referralCode || 'sx5PB08U7T',
    invitationLink: `${window.location.origin}/#/register?ref=${user?.referralCode || 'sx5PB08U7T'}`,
    invitationHistory: [],
  });
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeam = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.getTeamData();
      setTeamData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [user]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(teamData.invitationCode);
    setCopiedCode(true);
    showToast('Invitation code copied!', 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(teamData.invitationLink);
    setCopiedLink(true);
    showToast('Invitation link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!user) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0088FF] mx-auto flex items-center justify-center">
          <Users size={32} />
        </div>
        <h3 className="font-bold text-gray-900 text-lg">Earn Team Commissions</h3>
        <p className="text-xs text-gray-500 max-w-xs mx-auto">
          Sign in or register to get your unique referral code and start earning 0.3% commission on every friend's purchase.
        </p>
        <button
          onClick={() => setShowAuthModal(true)}
          className="px-6 py-2.5 bg-[#0088FF] text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 active:scale-95 transition"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Top Header matching Screenshot 3 */}
      <div className="text-center py-1">
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">My Team</h1>
      </div>

      {/* 4 Grid Cards (2x2) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Total commission */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-2">
          <span className="text-xs font-medium text-gray-500 block">Total commission</span>
          <div className="text-xl font-black text-gray-900">
            <span className="text-[#0088FF] mr-1">{Number(teamData.totalCommission).toFixed(0)}</span>
            <span className="text-xs font-semibold text-gray-500">Mcoin</span>
          </div>
        </div>

        {/* Card 2: Today's Commission */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-2">
          <span className="text-xs font-medium text-gray-500 block">Today's Commission</span>
          <div className="text-xl font-black text-gray-900">
            <span className="text-[#0088FF] mr-1">{Number(teamData.todayCommission).toFixed(0)}</span>
            <span className="text-xs font-semibold text-gray-500">Mcoin</span>
          </div>
        </div>

        {/* Card 3: Total Invites */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-2">
          <span className="text-xs font-medium text-gray-500 block">Total Invites</span>
          <div className="text-xl font-black text-[#0088FF]">
            {teamData.totalInvites}
          </div>
        </div>

        {/* Card 4: Today's Invites */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-2">
          <span className="text-xs font-medium text-gray-500 block">Today's Invites</span>
          <div className="text-xl font-black text-[#0088FF]">
            {teamData.todayInvites}
          </div>
        </div>
      </div>

      {/* Section: My invitation promotion */}
      <div className="space-y-2 pt-1">
        <h3 className="text-sm font-bold text-gray-900">My invitation promotion</h3>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
          {/* Invitation Code */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <span className="text-xs text-gray-400 block font-medium">Invitation Code</span>
              <span className="text-sm font-bold text-gray-800 font-mono tracking-wider">
                {teamData.invitationCode}
              </span>
            </div>

            <button
              onClick={handleCopyCode}
              className="p-2 rounded-lg text-[#0088FF] hover:bg-blue-50 active:scale-95 transition"
              aria-label="Copy invitation code"
            >
              {copiedCode ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
            </button>
          </div>

          {/* Invitation Link */}
          <div className="flex items-center justify-between">
            <div className="overflow-hidden mr-3">
              <span className="text-xs text-gray-400 block font-medium">Invitation Link</span>
              <span className="text-xs text-gray-600 font-mono truncate block max-w-[240px]">
                {teamData.invitationLink}
              </span>
            </div>

            <button
              onClick={handleCopyLink}
              className="p-2 rounded-lg text-[#0088FF] hover:bg-blue-50 active:scale-95 transition shrink-0"
              aria-label="Copy invitation link"
            >
              {copiedLink ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Section: Invitation History */}
      <div className="space-y-2 pt-1">
        <h3 className="text-sm font-bold text-gray-900">Invitation History</h3>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] min-h-[120px] flex flex-col justify-center items-center">
          {teamData.invitationHistory && teamData.invitationHistory.length > 0 ? (
            <div className="w-full divide-y divide-gray-100">
              {teamData.invitationHistory.map((item: any, idx: number) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-800 block">{item.phoneMasked}</span>
                    <span className="text-gray-400 text-[10px]">
                      {new Date(item.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                    Active Member
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs text-gray-400 font-medium">No More</span>
          )}
        </div>
      </div>
    </div>
  );
};
