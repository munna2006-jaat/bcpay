import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeaderProps {
  onOpenGuide?: () => void;
  title?: string;
  showGuideButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGuide, title, showGuideButton = true }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-100">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
          <img src="/logo.svg" alt="EarnLoop Logo" className="w-full h-full object-contain" />
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900">
          {title || 'EarnLoop'}
        </span>
      </div>

      {showGuideButton && (
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-medium transition active:scale-95"
        >
          <span>User Guide</span>
          <div className="w-4 h-4 rounded-full bg-[#0088FF] text-white flex items-center justify-center">
            <ArrowRight size={10} strokeWidth={3} />
          </div>
        </button>
      )}
    </header>
  );
};
