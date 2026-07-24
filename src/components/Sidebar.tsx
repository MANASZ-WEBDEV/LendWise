import React from 'react';
import { ViewMode } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  return (
    <aside className="hidden md:flex flex-col h-[calc(100vh-3.5rem)] w-64 fixed left-0 top-14 border-r border-[#ddbfc6] bg-[#faf2ec] py-4 px-4 z-40">
      <nav className="flex-1 space-y-1.5 py-2">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-['JetBrains_Mono'] text-sm transition-all ${
            currentView === 'dashboard'
              ? 'bg-[#ffd9e2] text-[#8d034b] font-bold shadow-xs'
              : 'text-[#65645e] hover:bg-[#efe7e0]'
          }`}
        >
          <span className="material-symbols-outlined text-xl">dashboard</span>
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onNavigate('people')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-['JetBrains_Mono'] text-sm transition-all ${
            currentView === 'people' || currentView === 'person-detail'
              ? 'bg-[#ffd9e2] text-[#8d034b] font-bold shadow-xs'
              : 'text-[#65645e] hover:bg-[#efe7e0]'
          }`}
        >
          <span className="material-symbols-outlined text-xl">group</span>
          <span>People</span>
        </button>

        <button
          onClick={() => onNavigate('transactions')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-['JetBrains_Mono'] text-sm transition-all ${
            currentView === 'transactions'
              ? 'bg-[#ffd9e2] text-[#8d034b] font-bold shadow-xs'
              : 'text-[#65645e] hover:bg-[#efe7e0]'
          }`}
        >
          <span className="material-symbols-outlined text-xl">receipt_long</span>
          <span>Transactions</span>
        </button>

        <button
          onClick={() => onNavigate('disburse-loan')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-['JetBrains_Mono'] text-sm transition-all ${
            currentView === 'disburse-loan'
              ? 'bg-[#ffd9e2] text-[#8d034b] font-bold shadow-xs'
              : 'text-[#65645e] hover:bg-[#efe7e0]'
          }`}
        >
          <span className="material-symbols-outlined text-xl">analytics</span>
          <span>Reports / Wizard</span>
        </button>
      </nav>

      <div className="mt-auto border-t border-[#ddbfc6] pt-4 pb-4 space-y-2">
        <button
          onClick={() => onNavigate('disburse-loan')}
          className="w-full bg-[#8b004a] hover:bg-[#620032] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 text-sm"
        >
          <span className="material-symbols-outlined text-xl">send_money</span>
          <span>Disburse Loan</span>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-['JetBrains_Mono'] text-sm text-[#65645e] hover:bg-[#efe7e0] transition-all ${
            currentView === 'settings' ? 'bg-[#efe7e0] font-bold text-[#1e1b17]' : ''
          }`}
        >
          <span className="material-symbols-outlined text-xl">settings</span>
          <span>Settings</span>
        </button>

        <button
          onClick={() => onNavigate('support')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-['JetBrains_Mono'] text-sm text-[#65645e] hover:bg-[#efe7e0] transition-all ${
            currentView === 'support' ? 'bg-[#efe7e0] font-bold text-[#1e1b17]' : ''
          }`}
        >
          <span className="material-symbols-outlined text-xl">contact_support</span>
          <span>Support</span>
        </button>
      </div>
    </aside>
  );
};
