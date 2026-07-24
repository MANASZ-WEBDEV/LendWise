import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DbTransaction } from '../types';
import { formatINR } from '../lib/currency';
import { toast } from 'sonner';

interface TransactionWithContact extends DbTransaction {
  contactName?: string;
  direction?: string;
}

export const TransactionsView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [txns, setTxns] = useState<TransactionWithContact[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      // Fetch all transactions for current user
      const { data: txData, error: txErr } = await supabase
        .from('transactions')
        .select('*, balances(direction, people(name))')
        .order('date', { ascending: false });

      if (txErr) throw txErr;

      const formatted: TransactionWithContact[] = (txData || []).map((t: any) => ({
        id: t.id,
        balance_id: t.balance_id,
        user_id: t.user_id,
        type: t.type,
        amount: t.amount ? Number(t.amount) : null,
        new_rate: t.new_rate ? Number(t.new_rate) : null,
        date: t.date,
        interest_applied: t.interest_applied ? Number(t.interest_applied) : null,
        principal_applied: t.principal_applied ? Number(t.principal_applied) : null,
        notes: t.notes,
        created_at: t.created_at,
        contactName: t.balances?.people?.name || 'Unknown Contact',
        direction: t.balances?.direction || 'lent',
      }));

      setTxns(formatted);
    } catch (err: any) {
      toast.error('Failed to load transaction audit history: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const filteredTxns = txns.filter((t) => {
    if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;

    const q = search.toLowerCase();
    if (!q) return true;

    return (
      (t.contactName || '').toLowerCase().includes(q) ||
      t.date.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q) ||
      (t.notes || '').toLowerCase().includes(q)
    );
  });

  const exportCSV = () => {
    const headers = 'ID,Date,Type,Contact,Direction,Amount,Interest Applied,Principal Applied,Notes\n';
    const rows = filteredTxns
      .map(
        (t) =>
          `"${t.id}","${t.date}","${t.type}","${t.contactName}","${t.direction}",${t.amount || ''},${t.interest_applied || ''},${t.principal_applied || ''},"${t.notes || ''}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LendWise_Master_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-['Inter']">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#620032]">Master Ledger Audit Trail</h1>
          <p className="text-[#574147] text-sm mt-1">
            Complete chronological audit trail of disbursements, repayments, and rate changes.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-[#fff8f3] border border-[#ddbfc6] text-[#620032] font-['JetBrains_Mono'] font-bold text-xs rounded-lg hover:bg-[#ffd9e2] transition-colors flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">download</span>
          Export CSV
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-[#f4ece6] rounded-xl border border-[#ddbfc6] flex flex-wrap items-center justify-between gap-4">
        <div className="flex bg-white/80 p-1 rounded-lg border border-[#ddbfc6] shadow-2xs">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-md font-['JetBrains_Mono'] text-xs font-semibold transition-all ${
              typeFilter === 'ALL' ? 'bg-[#620032] text-white shadow-xs' : 'text-[#574147] hover:bg-[#efe7e0]'
            }`}
          >
            All Logs
          </button>
          <button
            onClick={() => setTypeFilter('loan')}
            className={`px-3.5 py-1.5 rounded-md font-['JetBrains_Mono'] text-xs font-semibold transition-all ${
              typeFilter === 'loan' ? 'bg-[#620032] text-white shadow-xs' : 'text-[#574147] hover:bg-[#efe7e0]'
            }`}
          >
            Disbursements
          </button>
          <button
            onClick={() => setTypeFilter('repayment')}
            className={`px-3.5 py-1.5 rounded-md font-['JetBrains_Mono'] text-xs font-semibold transition-all ${
              typeFilter === 'repayment' ? 'bg-[#620032] text-white shadow-xs' : 'text-[#574147] hover:bg-[#efe7e0]'
            }`}
          >
            Repayments
          </button>
          <button
            onClick={() => setTypeFilter('rate_change')}
            className={`px-3.5 py-1.5 rounded-md font-['JetBrains_Mono'] text-xs font-semibold transition-all ${
              typeFilter === 'rate_change' ? 'bg-[#620032] text-white shadow-xs' : 'text-[#574147] hover:bg-[#efe7e0]'
            }`}
          >
            Rate Changes
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#574147] text-base">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit records..."
            className="w-full bg-white border border-[#ddbfc6] rounded-lg pl-9 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-[#620032] outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#620032] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-xs font-['JetBrains_Mono'] text-[#574147]">Loading audit history...</p>
        </div>
      ) : (
        /* Main Table */
        <div className="bg-[#ffffff] border border-[#ddbfc6] rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#efe7e0] border-b border-[#ddbfc6]">
                  <th className="px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-wider text-right">
                    Amount
                  </th>
                  <th className="px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-wider text-right">
                    Breakdown / Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ddbfc6] text-sm">
                {filteredTxns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-xs font-['JetBrains_Mono'] text-[#574147]">
                      No audit records found.
                    </td>
                  </tr>
                ) : (
                  filteredTxns.map((t) => (
                    <tr key={t.id} className="hover:bg-[#faf2ec] transition-colors font-['Inter']">
                      <td className="px-6 py-4 font-['JetBrains_Mono'] text-xs text-[#1e1b17]">
                        {t.date}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-['JetBrains_Mono'] text-xs font-bold ${
                            t.type === 'repayment'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.type === 'loan'
                              ? 'bg-[#ffd9e2] text-[#8d034b]'
                              : 'bg-[#e5e2da] text-[#5f5e58]'
                          }`}
                        >
                          {t.type === 'loan'
                            ? 'Loan Disbursement'
                            : t.type === 'repayment'
                            ? 'Repayment'
                            : `Rate Change (${t.new_rate}%/mo)`}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#1e1b17]">{t.contactName}</td>
                      <td className="px-6 py-4 text-right font-['JetBrains_Mono'] text-xs font-bold text-[#1e1b17]">
                        {t.amount ? formatINR(t.amount) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right font-['JetBrains_Mono'] text-xs text-[#574147]">
                        {t.type === 'repayment' ? (
                          <span>
                            Interest: <strong className="text-[#620032]">{formatINR(t.interest_applied)}</strong> | Principal: {formatINR(t.principal_applied)}
                          </span>
                        ) : t.notes ? (
                          t.notes
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
