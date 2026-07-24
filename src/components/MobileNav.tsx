import React from 'react';
import { NavLink, Link } from 'react-router-dom';

export const MobileNav: React.FC = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#efe7e0] border-t border-[#ddbfc6] flex justify-around items-center h-16 px-4 z-50 shadow-lg font-['JetBrains_Mono']">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 ${
            isActive ? 'text-[#620032] font-bold' : 'text-[#574147]'
          }`
        }
      >
        <span className="material-symbols-outlined text-xl">dashboard</span>
        <span className="text-[10px]">Dash</span>
      </NavLink>

      <NavLink
        to="/people"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 ${
            isActive ? 'text-[#620032] font-bold' : 'text-[#574147]'
          }`
        }
      >
        <span className="material-symbols-outlined text-xl">group</span>
        <span className="text-[10px]">People</span>
      </NavLink>

      <Link
        to="/disburse"
        className="flex flex-col items-center justify-center -translate-y-4 w-12 h-12 rounded-full bg-[#8b004a] text-white shadow-xl ring-4 ring-[#fff8f3] active:scale-90 transition-transform"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </Link>

      <NavLink
        to="/transactions"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 ${
            isActive ? 'text-[#620032] font-bold' : 'text-[#574147]'
          }`
        }
      >
        <span className="material-symbols-outlined text-xl">receipt_long</span>
        <span className="text-[10px]">Logs</span>
      </NavLink>
    </nav>
  );
};
