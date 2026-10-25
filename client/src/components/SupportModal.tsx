import React from 'react';
import { X, Headphones, MessageCircle, Send, Mail, Clock } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0088FF]/10 text-[#0088FF] flex items-center justify-center font-bold">
              <Headphones size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">EarnLoop Help & Support</h3>
              <p className="text-xs text-gray-500">24/7 Dedicated Assistance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Options */}
        <div className="p-5 space-y-3">
          <a
            href="https://wa.me/918619142008"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-xl border border-green-200 bg-green-50/50 hover:bg-green-50 transition active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-sm">
                <MessageCircle size={22} />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">WhatsApp Live Chat</div>
                <div className="text-xs text-green-700">Instant agent connection</div>
              </div>
            </div>
            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">Open</span>
          </a>

          <a
            href="https://t.me/earnloop_official"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0088FF] text-white flex items-center justify-center shadow-sm">
                <Send size={20} className="-translate-x-0.5" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">Telegram Official Channel</div>
                <div className="text-xs text-blue-700">Announcements & 24/7 Bot</div>
              </div>
            </div>
            <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Join</span>
          </a>

          <a
            href="mailto:support@earnloopfin.com"
            className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-gray-100 transition active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center shadow-sm">
                <Mail size={20} />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">Email Support</div>
                <div className="text-xs text-gray-500">support@earnloopfin.com</div>
              </div>
            </div>
            <span className="text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-1 rounded-full">Send</span>
          </a>

          <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 justify-center">
            <Clock size={14} />
            <span>Average response time: &lt; 5 minutes</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition text-sm active:scale-98"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
