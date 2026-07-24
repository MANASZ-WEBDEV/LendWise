import React from 'react';
import { ViewMode } from '../types';

interface MobileNavProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenNewLoan: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate, onOpenNewLoan }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#efe7e0] border-t border-[#ddbfc6] flex justify-around items-center h-16 px-4 z-50 shadow-lg">
      <button
        onClick={() => onNavigate('dashboard')}
        className={`flex flex-col items-center gap-1 ${
          currentView === 'dashboard' ? 'text-[#620032] font-bold' : 'text-[#574147]'
        }`}
      >
        <span className="material-symbols-outlined text-xl">dashboard</span>
        <span className="text-[10px]">Dash</span>
      </button>

      <button
        onClick={() => onNavigate('people')}
        className={`flex flex-col items-center gap-1 ${
          currentView === 'people' || currentView === 'person-detail'
            ? 'text-[#620032] font-bold'
            : 'text-[#574147]'
        }`}
      >
        <span className="material-symbols-outlined text-xl">group</span>
        <span className="text-[10px]">People</span>
      </button>

      <button
        onClick={onOpenNewLoan}
        className="flex flex-col items-center justify-center -translate-y-4 w-12 h-12 rounded-full bg-[#8b004a] text-white shadow-xl ring-4 ring-[#fff8f3] active:scale-90 transition-transform"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>

      <button
        onClick={() => onNavigate('transactions')}
        className={`flex flex-col items-center gap-1 ${
          currentView === 'transactions' ? 'text-[#620032] font-bold' : 'text-[#574147]'
        }`}
      >
        <span className="material-symbols-outlined text-xl">receipt_long</span>
        <span className="text-[10px]">Logs</span>
      </button>

      <button
        onClick={() => onNavigate('settings')}
        className={`flex flex-col items-center gap-1 ${
          currentView === 'settings' ? 'text-[#620032] font-bold' : 'text-[#574147]'
        }`}
      >
        <span className="material-symbols-outlined text-xl">settings</span>
        <span className="text-[10px]">Settings</span>
      </button>
    </nav>
  );
};
