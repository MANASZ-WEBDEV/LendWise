import React from 'react';
import { ViewMode } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedPersonName?: string;
  onOpenNewLoan: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  searchQuery,
  onSearchChange,
  selectedPersonName,
  onOpenNewLoan,
}) => {
  return (
    <header className="bg-[#fff8f3] border-b border-[#ddbfc6] w-full h-14 flex justify-between items-center px-4 md:px-12 sticky top-0 z-50 transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="font-bold text-2xl text-[#620032] tracking-tight hover:opacity-85 transition-opacity"
        >
          LendWise
        </button>

        {/* Breadcrumb for detail or subview */}
        {currentView === 'person-detail' && selectedPersonName && (
          <div className="hidden md:flex items-center gap-2 text-[#574147] font-['JetBrains_Mono'] text-sm">
            <span className="cursor-pointer hover:underline" onClick={() => onNavigate('people')}>
              People
            </span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-[#620032] font-bold">{selectedPersonName}</span>
          </div>
        )}

        {/* Top Header Inline Links for quick switching */}
        <div className="hidden md:flex items-center gap-6 ml-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`font-['JetBrains_Mono'] text-sm py-1 px-3 rounded transition-all ${
              currentView === 'dashboard'
                ? 'text-[#620032] font-bold border-b-2 border-[#620032]'
                : 'text-[#574147] hover:bg-[#faf2ec]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('people')}
            className={`font-['JetBrains_Mono'] text-sm py-1 px-3 rounded transition-all ${
              currentView === 'people' || currentView === 'person-detail'
                ? 'text-[#620032] font-bold border-b-2 border-[#620032]'
                : 'text-[#574147] hover:bg-[#faf2ec]'
            }`}
          >
            People
          </button>
          <button
            onClick={() => onNavigate('transactions')}
            className={`font-['JetBrains_Mono'] text-sm py-1 px-3 rounded transition-all ${
              currentView === 'transactions'
                ? 'text-[#620032] font-bold border-b-2 border-[#620032]'
                : 'text-[#574147] hover:bg-[#faf2ec]'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => onNavigate('disburse-loan')}
            className={`font-['JetBrains_Mono'] text-sm py-1 px-3 rounded transition-all ${
              currentView === 'disburse-loan'
                ? 'text-[#620032] font-bold border-b-2 border-[#620032]'
                : 'text-[#574147] hover:bg-[#faf2ec]'
            }`}
          >
            Loans
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="hidden lg:flex flex-1 justify-center max-w-md mx-6">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#574147] text-xl">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 pl-9 pr-4 bg-[#faf2ec] border border-[#ddbfc6] rounded-lg text-sm text-[#1e1b17] placeholder:text-[#8a7077] focus:outline-none focus:ring-1 focus:ring-[#620032] focus:border-[#620032] font-['Inter']"
            placeholder="Search ledgers, people, or ID..."
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button className="p-2 text-[#574147] hover:bg-[#faf2ec] rounded-full transition-colors relative" title="Notifications">
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#8b004a] rounded-full"></span>
          </button>
          <button className="p-2 text-[#574147] hover:bg-[#faf2ec] rounded-full transition-colors" title="Support & Help">
            <span className="material-symbols-outlined text-xl">help_outline</span>
          </button>
        </div>

        <button
          onClick={onOpenNewLoan}
          className="bg-[#8b004a] text-white px-5 h-9 rounded-lg font-['JetBrains_Mono'] text-xs font-semibold transition-all hover:bg-[#620032] active:scale-95 shadow-sm flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base">add</span>
          New Loan
        </button>

        {/* Profile Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden border border-[#ddbfc6] flex-shrink-0 cursor-pointer" title="LendWise Murrey Ledger Admin">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
            alt="User profile"
          />
        </div>
      </div>
    </header>
  );
};
