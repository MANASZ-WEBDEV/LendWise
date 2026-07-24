import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPeople, fetchPersonSummary } from '../lib/supabase-queries';
import { PersonSummary } from '../types';
import { formatINR } from '../lib/currency';
import { toast } from 'sonner';

export const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<PersonSummary[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const people = await fetchPeople();
      const loadedSummaries: PersonSummary[] = [];

      for (const p of people) {
        const s = await fetchPersonSummary(p);
        loadedSummaries.push(s);
      }

      setSummaries(loadedSummaries);
    } catch (err: any) {
      toast.error('Failed to load dashboard: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Aggregate totals across all people
  const totalLentPrincipal = summaries.reduce((sum, s) => sum + s.totalLentPrincipal, 0);
  const totalLentInterest = summaries.reduce((sum, s) => sum + s.totalLentInterest, 0);
  const totalLentTotal = totalLentPrincipal + totalLentInterest;

  const totalBorrowedPrincipal = summaries.reduce((sum, s) => sum + s.totalBorrowedPrincipal, 0);
  const totalBorrowedInterest = summaries.reduce((sum, s) => sum + s.totalBorrowedInterest, 0);
  const totalBorrowedTotal = totalBorrowedPrincipal + totalBorrowedInterest;

  const netPosition = totalLentTotal - totalBorrowedTotal;

  // Active ledgers with non-zero balance
  const activeLedgers = summaries.filter(
    s => s.totalLentTotal > 0 || s.totalBorrowedTotal > 0 || s.balances.length > 0
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-['Inter']">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1e1b17] tracking-tight">
            Dashboard
          </h1>
          <p className="text-[#574147] text-sm mt-1">
            Financial ledger overview & live accruing interest
          </p>
        </div>
        <Link
          to="/disburse"
          className="bg-[#8b004a] text-white px-5 py-2.5 rounded-lg font-['JetBrains_Mono'] text-xs font-bold hover:bg-[#620032] transition-all active:scale-95 shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">send_money</span>
          Disburse New Loan
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#620032] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-xs font-['JetBrains_Mono'] text-[#574147]">Loading ledger data...</p>
        </div>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Lent */}
            <div className="bg-[#fff8f3] border border-[#ddbfc6] rounded-xl p-6 relative overflow-hidden group shadow-xs">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#620032] transition-all group-hover:w-2.5"></div>
              <p className="text-[#574147] font-['JetBrains_Mono'] text-xs uppercase tracking-wider font-semibold mb-1">
                Total Money Lent
              </p>
              <h2 className="font-['JetBrains_Mono'] text-3xl font-bold text-[#620032]">
                {formatINR(totalLentTotal)}
              </h2>
              <div className="mt-3 pt-3 border-t border-[#ddbfc6]/40 flex justify-between text-xs font-['JetBrains_Mono'] text-[#574147]">
                <span>Principal: {formatINR(totalLentPrincipal)}</span>
                <span className="text-[#620032] font-semibold">Interest: {formatINR(totalLentInterest)}</span>
              </div>
            </div>

            {/* Total Borrowed */}
            <div className="bg-[#fff8f3] border border-[#ddbfc6] rounded-xl p-6 relative overflow-hidden group shadow-xs">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#5f5e58] transition-all group-hover:w-2.5"></div>
              <p className="text-[#574147] font-['JetBrains_Mono'] text-xs uppercase tracking-wider font-semibold mb-1">
                Total Money Borrowed
              </p>
              <h2 className="font-['JetBrains_Mono'] text-3xl font-bold text-[#1e1b17]">
                {formatINR(totalBorrowedTotal)}
              </h2>
              <div className="mt-3 pt-3 border-t border-[#ddbfc6]/40 flex justify-between text-xs font-['JetBrains_Mono'] text-[#574147]">
                <span>Principal: {formatINR(totalBorrowedPrincipal)}</span>
                <span className="text-[#620032] font-semibold">Interest: {formatINR(totalBorrowedInterest)}</span>
              </div>
            </div>

            {/* Net Position */}
            <div className="bg-[#efe7e0] border border-[#ddbfc6] rounded-xl p-6 relative overflow-hidden group shadow-xs">
              <p className="text-[#574147] font-['JetBrains_Mono'] text-xs uppercase tracking-wider font-semibold mb-1">
                Net Position
              </p>
              <h2 className={`font-['JetBrains_Mono'] text-3xl font-bold ${netPosition >= 0 ? 'text-[#8b004a]' : 'text-[#ba1a1a]'}`}>
                {formatINR(netPosition)}
              </h2>
              <p className="mt-3 text-xs font-['JetBrains_Mono'] text-[#574147]">
                {netPosition >= 0 ? 'Net Receivable' : 'Net Payable'} across all active relationships
              </p>
            </div>
          </div>

          {/* Active Ledgers Table */}
          <div className="bg-[#fff8f3] border border-[#ddbfc6] rounded-xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-[#ddbfc6] flex justify-between items-center bg-[#faf2ec]">
              <div>
                <h3 className="font-bold text-lg text-[#1e1b17]">Active Ledgers</h3>
                <p className="text-xs text-[#574147]">Click any borrower row to open detail view & interest breakdown</p>
              </div>
              <Link
                to="/people"
                className="text-[#620032] font-bold font-['JetBrains_Mono'] text-xs flex items-center gap-1 hover:underline"
              >
                View All People <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>
            </div>

            {summaries.length === 0 ? (
              <div className="py-12 text-center p-6">
                <div className="w-12 h-12 rounded-full bg-[#ffd9e2] text-[#8d034b] flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-2xl">person_add</span>
                </div>
                <h4 className="font-bold text-base text-[#1e1b17]">No contacts in your ledger yet</h4>
                <p className="text-xs text-[#574147] max-w-sm mx-auto mt-1 font-['JetBrains_Mono'] mb-4">
                  Add your first contact to start tracking informal loans and accruing interest.
                </p>
                <Link
                  to="/people"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8b004a] text-white font-['JetBrains_Mono'] text-xs font-bold rounded-lg hover:bg-[#620032] transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add Person
                </Link>
              </div>
            ) : (
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
                        Live Accrued Interest
                      </th>
                      <th className="text-right px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-tight">
                        Total Owed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ddbfc6]">
                    {summaries.map((s) => {
                      const lentBal = s.balances.find(b => b.balance.direction === 'lent');
                      const borrowedBal = s.balances.find(b => b.balance.direction === 'borrowed');
                      const primaryBal = lentBal || borrowedBal;

                      const principal = (lentBal?.balance.principal || 0) - (borrowedBal?.balance.principal || 0);
                      const accrued = (lentBal?.liveAccruedInterest || 0) - (borrowedBal?.liveAccruedInterest || 0);
                      const total = principal + accrued;

                      return (
                        <tr
                          key={s.person.id}
                          onClick={() => navigate(`/person/${s.person.id}`)}
                          className="hover:bg-[#faf2ec] cursor-pointer transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#620032] text-white flex items-center justify-center font-['JetBrains_Mono'] text-xs font-bold">
                                {s.person.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-[#1e1b17] text-sm group-hover:text-[#620032] transition-colors">
                                  {s.person.name}
                                </span>
                                {s.person.notes && (
                                  <span className="text-xs text-[#574147] truncate max-w-[200px]">
                                    {s.person.notes}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-['JetBrains_Mono'] text-sm text-[#1e1b17]">
                            {formatINR(principal)}
                          </td>
                          <td className="px-6 py-4 text-right font-['JetBrains_Mono'] text-sm font-semibold text-[#620032]">
                            {formatINR(accrued)}
                          </td>
                          <td className="px-6 py-4 text-right font-['JetBrains_Mono'] text-sm font-bold text-[#8b004a]">
                            {formatINR(total)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
