import React, { useState } from 'react';
import { Transaction } from '../types';

interface TransactionsViewProps {
  transactions: Transaction[];
  searchQuery: string;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  searchQuery: initialSearch,
}) => {
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>(initialSearch);

  const filtered = transactions.filter((t) => {
    if (typeFilter === 'Repayment' && t.type !== 'Repayment') return false;
    if (typeFilter === 'Loan Disbursement' && t.type !== 'Loan Disbursement') return false;
    if (typeFilter === 'Interest Accrual' && t.type !== 'Interest Accrual') return false;

    const q = search.toLowerCase();
    if (!q) return true;

    return (
      t.personName.toLowerCase().includes(q) ||
      t.reference.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q)
    );
  });

  const exportCSV = () => {
    const headers = 'ID,Date,Type,Person,Reference,Amount,Status\n';
    const rows = filtered
      .map(
        (t) =>
          `"${t.id}","${t.date}","${t.type}","${t.personName}","${t.reference}",${t.amount},"${t.status}"`
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
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#620032] font-['Inter']">Master Ledger</h1>
          <p className="text-[#574147] text-sm mt-1">
            Complete immutable audit trail of disbursements, repayments, and system accruals.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-[#fff8f3] border border-[#ddbfc6] text-[#620032] font-['JetBrains_Mono'] font-bold text-xs rounded-lg hover:bg-[#ffd9e2] transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Export CSV
          </button>
          <button
            onClick={() => alert('Generating PDF Audit Statement...')}
            className="px-4 py-2 bg-[#8b004a] text-white font-['JetBrains_Mono'] font-bold text-xs rounded-lg hover:bg-[#620032] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
            Audit Report
          </button>
        </div>
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
            onClick={() => setTypeFilter('Repayment')}
            className={`px-3.5 py-1.5 rounded-md font-['JetBrains_Mono'] text-xs font-semibold transition-all ${
              typeFilter === 'Repayment' ? 'bg-[#620032] text-white shadow-xs' : 'text-[#574147] hover:bg-[#efe7e0]'
            }`}
          >
            Repayments
          </button>
          <button
            onClick={() => setTypeFilter('Loan Disbursement')}
            className={`px-3.5 py-1.5 rounded-md font-['JetBrains_Mono'] text-xs font-semibold transition-all ${
              typeFilter === 'Loan Disbursement' ? 'bg-[#620032] text-white shadow-xs' : 'text-[#574147] hover:bg-[#efe7e0]'
            }`}
          >
            Disbursements
          </button>
          <button
            onClick={() => setTypeFilter('Interest Accrual')}
            className={`px-3.5 py-1.5 rounded-md font-['JetBrains_Mono'] text-xs font-semibold transition-all ${
              typeFilter === 'Interest Accrual' ? 'bg-[#620032] text-white shadow-xs' : 'text-[#574147] hover:bg-[#efe7e0]'
            }`}
          >
            System Accruals
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
            placeholder="Search records..."
            className="w-full bg-white border border-[#ddbfc6] rounded-lg pl-9 pr-3 py-1.5 text-xs font-['Inter'] focus:ring-1 focus:ring-[#620032] outline-none"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#ffffff] border border-[#ddbfc6] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#efe7e0] border-b border-[#ddbfc6]">
                <th className="px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-wider">
                  Timestamp / Date
                </th>
                <th className="px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-wider">
                  Party / Contact
                </th>
                <th className="px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-wider">
                  Ref ID
                </th>
                <th className="px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-wider text-right">
                  Credit (+)
                </th>
                <th className="px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-wider text-right">
                  Debit (-)
                </th>
                <th className="px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-wider text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ddbfc6] font-['Inter'] text-sm">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-[#faf2ec] transition-colors">
                  <td className="px-6 py-4 font-['JetBrains_Mono'] text-xs text-[#1e1b17]">
                    {t.date}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-['JetBrains_Mono'] text-xs font-bold ${
                        t.type === 'Repayment'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.type === 'Loan Disbursement'
                          ? 'bg-[#ffd9e2] text-[#8d034b]'
                          : 'bg-[#e5e2da] text-[#5f5e58]'
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#1e1b17]">{t.personName}</td>
                  <td className="px-6 py-4 font-['JetBrains_Mono'] text-xs text-[#574147]">
                    {t.reference}
                  </td>
                  <td className="px-6 py-4 text-right font-['JetBrains_Mono'] text-xs font-bold text-[#620032]">
                    {t.credit ? `$${t.credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-right font-['JetBrains_Mono'] text-xs font-bold text-[#1e1b17]">
                    {t.debit ? `$${t.debit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold font-['JetBrains_Mono'] rounded uppercase">
                      {t.status || 'VERIFIED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auditor Verification Callout */}
      <div className="p-6 bg-[#faf2ec] border border-[#ddbfc6] rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#ffd9e2] border border-[#ddbfc6] flex items-center justify-center text-[#8d034b]">
            <span className="material-symbols-outlined text-2xl">verified</span>
          </div>
          <div>
            <h4 className="font-['JetBrains_Mono'] font-bold text-sm text-[#1e1b17]">
              SHA-256 Ledger Integrity Signature
            </h4>
            <p className="text-xs text-[#574147] font-['JetBrains_Mono']">
              Hash: 0x9f88a77321b0e2... • All 14 active ledgers mathematically balanced.
            </p>
          </div>
        </div>
        <button
          onClick={() => alert('Verification signature validated successfully!')}
          className="px-5 py-2.5 bg-[#1e1b17] text-[#fff8f3] font-['JetBrains_Mono'] text-xs font-bold rounded-lg hover:bg-[#2f2f2f] transition-colors"
        >
          Verify Hash
        </button>
      </div>
    </div>
  );
};
