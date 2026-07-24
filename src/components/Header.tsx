import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface HeaderProps {
  userEmail?: string;
}

export const Header: React.FC<HeaderProps> = ({ userEmail }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Signed out successfully');
      navigate('/');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-[#fff8f3] border-b border-[#ddbfc6] w-full h-14 flex justify-between items-center px-4 md:px-12 sticky top-0 z-50 transition-colors">
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className="font-bold text-2xl text-[#620032] tracking-tight hover:opacity-85 transition-opacity font-['Inter']"
        >
          LendWise
        </Link>

        {/* Top Header Navigation Links */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/"
            className={`font-['JetBrains_Mono'] text-xs py-1.5 px-3 rounded transition-all ${
              isActive('/')
                ? 'text-[#620032] font-bold bg-[#ffd9e2]'
                : 'text-[#574147] hover:bg-[#faf2ec]'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/people"
            className={`font-['JetBrains_Mono'] text-xs py-1.5 px-3 rounded transition-all ${
              isActive('/people') || location.pathname.startsWith('/person')
                ? 'text-[#620032] font-bold bg-[#ffd9e2]'
                : 'text-[#574147] hover:bg-[#faf2ec]'
            }`}
          >
            People
          </Link>
          <Link
            to="/transactions"
            className={`font-['JetBrains_Mono'] text-xs py-1.5 px-3 rounded transition-all ${
              isActive('/transactions')
                ? 'text-[#620032] font-bold bg-[#ffd9e2]'
                : 'text-[#574147] hover:bg-[#faf2ec]'
            }`}
          >
            Transactions
          </Link>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          to="/disburse"
          className="hidden sm:flex bg-[#8b004a] text-white px-3.5 sm:px-4 h-9 rounded-lg font-['JetBrains_Mono'] text-xs font-semibold transition-all hover:bg-[#620032] active:scale-95 shadow-sm items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base">add</span>
          New Loan
        </Link>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#ddbfc6]">
          <div
            className="w-8 h-8 rounded-full bg-[#620032] text-white flex items-center justify-center font-['JetBrains_Mono'] text-xs font-bold shadow-xs"
            title={userEmail || 'Authenticated User'}
          >
            {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 text-[#574147] hover:bg-[#faf2ec] hover:text-[#620032] rounded-lg transition-colors"
            title="Sign Out"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
