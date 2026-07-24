import React, { useState, useEffect } from 'react';
import { Person, Transaction, ViewMode } from '../types';

interface DashboardViewProps {
  people: Person[];
  transactions: Transaction[];
  onNavigate: (view: ViewMode) => void;
  onSelectPerson: (person: Person) => void;
  onExportRecords: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  people,
  transactions,
  onNavigate,
  onSelectPerson,
  onExportRecords,
}) => {
  // Live clock timer for Automated Audit
  const [auditSeconds, setAuditSeconds] = useState(288); // 04:48
  const [syncing, setSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setAuditSeconds((prev) => (prev > 0 ? prev - 1 : 899));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleManualSync = () => {
    setSyncing(true);
    setSyncNotice('Scanning 14 active ledger contracts...');
    setTimeout(() => {
      setAuditSeconds(900); // reset to 15:00
      setSyncing(false);
      setSyncNotice('Manual audit completed! All 14 contracts verified with 0 discrepancies.');
      setTimeout(() => setSyncNotice(null), 4000);
    }, 1200);
  };

  const totalLent = people
    .filter((p) => p.relationship === 'OWES_ME')
    .reduce((sum, p) => sum + p.principal, 0);

  const totalBorrowed = people
    .filter((p) => p.relationship === 'I_OWE_THEM')
    .reduce((sum, p) => sum + p.principal, 0);

  const netPosition = totalLent - totalBorrowed;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1e1b17] font-['Inter'] tracking-tight">
            Dashboard
          </h1>
          <p className="text-[#574147] text-base mt-1">
            Financial overview for LendWise Murrey Ledger
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#fff8f3] border border-[#ddbfc6] rounded-lg px-4 py-2 flex items-center gap-2.5 shadow-2xs">
            <span className="material-symbols-outlined text-[#620032] text-xl">calendar_today</span>
            <span className="font-['JetBrains_Mono'] text-sm text-[#1e1b17] font-medium">
              Oct 1 - Oct 27, 2023
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards: Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Lent */}
        <div className="bg-[#fff8f3] border border-[#ddbfc6] rounded-xl p-6 relative overflow-hidden group shadow-xs">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#620032] transition-all group-hover:w-2.5"></div>
          <p className="text-[#574147] font-['JetBrains_Mono'] text-xs uppercase tracking-wider font-semibold mb-2">
            Total Lent
          </p>
          <h2 className="font-['JetBrains_Mono'] text-3xl font-bold text-[#620032]">
            ${totalLent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h2>
          <div className="mt-4 flex items-center gap-2 text-[#620032] font-bold text-xs">
            <span className="material-symbols-outlined text-lg">trending_up</span>
            <span>+12.4% vs last month</span>
          </div>
        </div>

        {/* Total Borrowed */}
        <div className="bg-[#fff8f3] border border-[#ddbfc6] rounded-xl p-6 relative overflow-hidden group shadow-xs">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#5f5e58] transition-all group-hover:w-2.5"></div>
          <p className="text-[#574147] font-['JetBrains_Mono'] text-xs uppercase tracking-wider font-semibold mb-2">
            Total Borrowed
          </p>
          <h2 className="font-['JetBrains_Mono'] text-3xl font-bold text-[#1e1b17]">
            ${totalBorrowed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h2>
          <div className="mt-4 flex items-center gap-2 text-[#574147] font-bold text-xs">
            <span className="material-symbols-outlined text-lg">trending_flat</span>
            <span>Steady position</span>
          </div>
        </div>

        {/* Net Position */}
        <div className="bg-[#efe7e0] border border-[#ddbfc6] rounded-xl p-6 relative overflow-hidden group shadow-xs">
          <p className="text-[#574147] font-['JetBrains_Mono'] text-xs uppercase tracking-wider font-semibold mb-2">
            Net Position
          </p>
          <h2 className="font-['JetBrains_Mono'] text-3xl font-bold text-[#8b004a]">
            ${netPosition.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h2>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-2.5 flex-1 bg-[#ddbfc6] rounded-full overflow-hidden">
              <div className="h-full bg-[#620032] w-[74%] rounded-full"></div>
            </div>
            <span className="text-xs font-['JetBrains_Mono'] font-bold text-[#574147]">74% Equity</span>
          </div>
        </div>
      </div>

      {/* Main Section: Active Ledgers Table & Sidebar Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Ledgers Table (Lg: 8 Columns) */}
        <div className="lg:col-span-8 bg-[#fff8f3] border border-[#ddbfc6] rounded-xl overflow-hidden flex flex-col shadow-xs">
          <div className="px-6 py-4 border-b border-[#ddbfc6] flex justify-between items-center bg-[#faf2ec]">
            <div>
              <h3 className="font-bold text-lg text-[#1e1b17] font-['Inter']">Active Ledgers</h3>
              <p className="text-xs text-[#574147]">Click any borrower row to open full ledger & math breakdown</p>
            </div>
            <button
              onClick={() => onNavigate('people')}
              className="text-[#620032] font-bold font-['JetBrains_Mono'] text-xs flex items-center gap-1 hover:underline"
            >
              View All <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-[#faf2ec]">
                <tr>
                  <th className="text-left px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-tight">
                    Contact
                  </th>
                  <th className="text-right px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-tight">
                    Principal
                  </th>
                  <th className="text-right px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-tight">
                    Rate
                  </th>
                  <th className="text-right px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-tight">
                    Live Accrual
                  </th>
                  <th className="text-center px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-tight">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ddbfc6]">
                {people.slice(0, 5).map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => onSelectPerson(p)}
                    className="hover:bg-[#faf2ec] cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="w-9 h-9 rounded-full object-cover border border-[#ddbfc6]"
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-[#1e1b17] text-sm group-hover:text-[#620032] transition-colors">
                            {p.name}
                          </span>
                          <span className="text-xs text-[#574147] font-['JetBrains_Mono']">
                            {p.category} #{p.id.split('-')[1] || p.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-['JetBrains_Mono'] text-sm text-[#1e1b17]">
                      ${p.principal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right font-['JetBrains_Mono'] text-sm text-[#574147]">
                      {p.interestRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-right font-['JetBrains_Mono'] text-sm font-semibold text-[#620032]">
                      ${p.liveAccrual.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {p.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-['JetBrains_Mono']">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ffd9e2] text-[#620032] text-xs font-bold font-['JetBrains_Mono']">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#620032]"></span> Grace Period
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recent Activity & Automated Audit (Lg: 4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Recent Activity */}
          <div className="bg-[#fff8f3] border border-[#ddbfc6] rounded-xl p-6 shadow-2xs">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-lg text-[#1e1b17] font-['Inter']">Activity</h3>
              <span className="material-symbols-outlined text-[#574147]">history</span>
            </div>

            <div className="space-y-4">
              {transactions.slice(0, 3).map((t) => (
                <div key={t.id} className="flex items-start gap-3.5 pb-3.5 border-b border-[#ddbfc6] last:border-b-0 last:pb-0">
                  <div className="w-9 h-9 rounded-lg bg-[#efe7e0] flex items-center justify-center text-[#620032] flex-shrink-0">
                    <span className="material-symbols-outlined text-lg">
                      {t.type === 'Repayment' ? 'payments' : t.type === 'Loan Disbursement' ? 'outbox' : 'add_task'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1e1b17] font-bold text-xs truncate">
                      {t.type}: {t.personName}
                    </p>
                    <p className="text-[#574147] text-[11px] font-['JetBrains_Mono']">
                      {t.date} • {t.reference}
                    </p>
                  </div>
                  <span
                    className={`font-['JetBrains_Mono'] text-xs font-bold ${
                      t.credit ? 'text-emerald-700' : 'text-[#620032]'
                    }`}
                  >
                    {t.credit ? `+$${t.credit.toLocaleString()}` : `-$${(t.debit || t.amount).toLocaleString()}`}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={onExportRecords}
              className="w-full mt-5 py-2 border border-[#ddbfc6] text-[#1e1b17] font-bold rounded-lg text-xs font-['JetBrains_Mono'] hover:bg-[#faf2ec] transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Export All Records
            </button>
          </div>

          {/* Automated Interest Audit Card */}
          <div className="bg-[#8b004a] text-white rounded-xl p-6 relative overflow-hidden shadow-md">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#620032] opacity-30 rounded-full"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="bg-white/10 p-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-white text-lg">precision_manufacturing</span>
                </div>
                <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-widest font-semibold">
                  SYSTEM HEALTH
                </span>
              </div>

              <h3 className="text-xl font-bold mb-2">Automated Audit</h3>
              <p className="text-white/80 text-xs leading-relaxed mb-5">
                Real-time interest recalculation is active. 14 contracts scanned in the last 15 minutes. No discrepancies detected.
              </p>

              {syncNotice && (
                <div className="mb-4 p-2.5 bg-white/15 rounded-lg text-xs text-white font-['JetBrains_Mono'] animate-fade-in">
                  {syncNotice}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] opacity-70 font-['JetBrains_Mono']">Next scan in</span>
                  <span className="font-['JetBrains_Mono'] text-lg font-bold">{formatTime(auditSeconds)}</span>
                </div>

                <button
                  onClick={handleManualSync}
                  disabled={syncing}
                  className="bg-white text-[#8b004a] px-4 py-2 rounded-lg font-bold text-xs font-['JetBrains_Mono'] shadow-sm hover:brightness-95 active:scale-95 transition-all disabled:opacity-50"
                >
                  {syncing ? 'Syncing...' : 'Run Manual Sync'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Row: Visual Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interest Growth Bar Chart */}
        <div className="bg-[#fff8f3] border border-[#ddbfc6] rounded-xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-bold text-[#1e1b17] text-base">Interest Growth Projection</h4>
              <p className="text-xs text-[#574147]">Monthly compounding yields</p>
            </div>
            <span className="text-xs text-[#574147] font-['JetBrains_Mono'] font-medium bg-[#faf2ec] px-2.5 py-1 rounded border border-[#ddbfc6]">
              ESTIMATED ANNUAL: +$34.2K
            </span>
          </div>

          <div className="h-32 flex items-end justify-between gap-2 pt-2">
            {[
              { label: 'Jun', height: '40%', val: '$1.2k' },
              { label: 'Jul', height: '55%', val: '$1.8k' },
              { label: 'Aug', height: '48%', val: '$1.5k' },
              { label: 'Sep', height: '72%', val: '$2.4k' },
              { label: 'Oct', height: '85%', val: '$2.9k' },
              { label: 'Nov (Est)', height: '100%', val: '$3.2k', active: true },
              { label: 'Dec (Est)', height: '90%', val: '$3.0k' },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div
                  className={`w-full rounded-t-sm transition-all cursor-pointer ${
                    bar.active ? 'bg-[#620032]' : 'bg-[#ddbfc6] hover:bg-[#8b004a]'
                  }`}
                  style={{ height: bar.height }}
                  title={`${bar.label}: ${bar.val}`}
                ></div>
                <span className="text-[10px] text-[#574147] font-['JetBrains_Mono'] truncate">
                  {bar.label.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wealth Management Suite Banner */}
        <div className="bg-[#e9e1db] rounded-xl overflow-hidden relative min-h-[180px] flex items-center p-8 border border-[#ddbfc6] shadow-2xs">
          <div className="relative z-10 w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-[#574147] font-['JetBrains_Mono'] text-xs font-semibold uppercase tracking-wider mb-1">
                LendWise Murrey
              </p>
              <h4 className="text-[#1e1b17] font-bold text-2xl max-w-xs leading-tight">
                Premium Wealth Management Suite
              </h4>
              <p className="text-xs text-[#574147] mt-1">
                Bespoke private lending auditing & tax compliance export.
              </p>
            </div>
            <button
              onClick={() => alert('Accessing LendWise Private Concierge line...')}
              className="bg-[#1e1b17] text-[#fff8f3] px-6 py-3 rounded-full font-bold text-xs font-['JetBrains_Mono'] hover:bg-[#2f2f2f] transition-colors whitespace-nowrap shadow-sm"
            >
              Access Concierge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
