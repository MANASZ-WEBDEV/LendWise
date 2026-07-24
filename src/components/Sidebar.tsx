import React from 'react';
import { NavLink, Link } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:flex flex-col h-[calc(100vh-3.5rem)] w-64 fixed left-0 top-14 border-r border-[#ddbfc6] bg-[#faf2ec] py-4 px-4 z-40">
      <nav className="flex-1 space-y-1.5 py-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-4 py-3 rounded-lg font-['JetBrains_Mono'] text-sm transition-all ${
              isActive
                ? 'bg-[#ffd9e2] text-[#8d034b] font-bold shadow-xs'
                : 'text-[#65645e] hover:bg-[#efe7e0]'
            }`
          }
        >
          <span className="material-symbols-outlined text-xl">dashboard</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/people"
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-4 py-3 rounded-lg font-['JetBrains_Mono'] text-sm transition-all ${
              isActive
                ? 'bg-[#ffd9e2] text-[#8d034b] font-bold shadow-xs'
                : 'text-[#65645e] hover:bg-[#efe7e0]'
            }`
          }
        >
          <span className="material-symbols-outlined text-xl">group</span>
          <span>People</span>
        </NavLink>

        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-4 py-3 rounded-lg font-['JetBrains_Mono'] text-sm transition-all ${
              isActive
                ? 'bg-[#ffd9e2] text-[#8d034b] font-bold shadow-xs'
                : 'text-[#65645e] hover:bg-[#efe7e0]'
            }`
          }
        >
          <span className="material-symbols-outlined text-xl">receipt_long</span>
          <span>Transactions</span>
        </NavLink>
      </nav>

      <div className="mt-auto border-t border-[#ddbfc6] pt-4 pb-4 space-y-2">
        <Link
          to="/disburse"
          className="w-full bg-[#8b004a] hover:bg-[#620032] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 text-sm font-['JetBrains_Mono']"
        >
          <span className="material-symbols-outlined text-xl">send_money</span>
          <span>Disburse Loan</span>
        </Link>
      </div>
    </aside>
  );
};
