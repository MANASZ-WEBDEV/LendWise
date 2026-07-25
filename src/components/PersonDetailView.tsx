import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchPeople, fetchPersonSummary, recordRateChange, archivePerson } from '../lib/supabase-queries';
import { PersonSummary, DbTransaction } from '../types';
import { formatINR } from '../lib/currency';
import { toast } from 'sonner';

export const PersonDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<PersonSummary | null>(null);

  // Rate change modal state
  const [rateModalBalanceId, setRateModalBalanceId] = useState<string | null>(null);
  const [newRate, setNewRate] = useState<string>('1.5');
  const [effectiveDate, setEffectiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [submittingRate, setSubmittingRate] = useState(false);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (personId: string) => {
    setLoading(true);
    try {
      const people = await fetchPeople();
      const target = people.find(p => p.id === personId);
      if (!target) {
        toast.error('Person not found');
        navigate('/people');
        return;
      }
      const s = await fetchPersonSummary(target);
      setSummary(s);
    } catch (err: any) {
      toast.error('Failed to load person detail: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!summary) return;
    if (!confirm(`Archive ${summary.person.name}? They will be moved to the Archived tab.`)) return;

    try {
      await archivePerson(summary.person.id);
      toast.success(`${summary.person.name} archived successfully`);
      navigate('/people');
    } catch (err: any) {
      toast.error('Failed to archive contact: ' + (err.message || 'Unknown error'));
    }
  };

  const handleRateChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rateModalBalanceId || !newRate) return;

    setSubmittingRate(true);
    try {
      await recordRateChange({
        balanceId: rateModalBalanceId,
        newMonthlyRate: parseFloat(newRate),
        effectiveDate,
      });
      toast.success('Interest rate updated successfully');
      setRateModalBalanceId(null);
      if (id) loadData(id);
    } catch (err: any) {
      toast.error('Failed to update rate: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmittingRate(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center font-['Inter']">
        <div className="inline-block w-8 h-8 border-4 border-[#620032] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-xs font-['JetBrains_Mono'] text-[#574147]">Loading person details...</p>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24 font-['Inter']">
      {/* Top Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/people"
          className="inline-flex items-center gap-2 text-[#620032] font-['JetBrains_Mono'] text-xs font-semibold hover:underline"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          BACK TO PEOPLE DIRECTORY
        </Link>
      </div>

      {/* Person Header */}
      <div className="flex items-center gap-4 sm:gap-5">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#620032] text-white flex items-center justify-center font-['JetBrains_Mono'] text-xl sm:text-2xl font-bold shadow-xs shrink-0">
          {summary.person.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#620032] leading-tight">
            {summary.person.name}
            {summary.person.is_wm && (
              <sup className="ml-1.5 text-xs font-['JetBrains_Mono'] font-bold text-[#8b004a] bg-[#ffd9e2] px-1.5 py-0.5 rounded">WM</sup>
            )}
          </h1>
          {summary.person.notes && (
            <p className="text-xs text-[#574147] font-['JetBrains_Mono'] mt-0.5">
              {summary.person.notes}
            </p>
          )}
          {summary.person.phone && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-[#574147] font-['JetBrains_Mono'] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">call</span>
                {summary.person.phone}
              </span>
              <a
                href={`tel:${summary.person.phone}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#ffd9e2] text-[#8b004a] font-['JetBrains_Mono'] text-[11px] font-bold rounded-md hover:bg-[#ffb0c9] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="material-symbols-outlined text-sm">phone_in_talk</span>
                Call
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Balances & Explain-the-Math Grid */}
      {summary.balances.length === 0 ? (
        <div className="p-8 bg-[#fff8f3] border border-dashed border-[#ddbfc6] rounded-xl text-center">
          <p className="text-sm font-['JetBrains_Mono'] text-[#574147] mb-4">
            No active loan balance for {summary.person.name} yet.
          </p>
          <Link
            to={`/disburse?personId=${summary.person.id}`}
            className="px-5 py-2.5 bg-[#8b004a] text-white font-['JetBrains_Mono'] text-xs font-bold rounded-lg hover:bg-[#620032] transition-colors"
          >
            Disburse First Loan
          </Link>
        </div>
      ) : (
        summary.balances.map((bItem) => {
          const { balance, liveAccruedInterest, totalOwed, transactions, rateHistory } = bItem;

          // Find initial loan date
          const initialTxn = transactions.find(t => t.type === 'loan');
          const initialDate = initialTxn ? initialTxn.date : balance.created_at.split('T')[0];

          // Run engine to get segments for Explain the Math breakdown
          const engineTxns = transactions.map(t => ({
            id: t.id,
            type: t.type,
            amount: t.amount,
            newRate: t.new_rate,
            date: t.date,
            created_at: t.created_at,
          }));

          return (
            <section key={balance.id} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Balance Hero Card */}
              <div className="lg:col-span-7 space-y-4">
                {totalOwed === 0 && (
                  <div className="p-3.5 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-['JetBrains_Mono'] text-xs text-emerald-900 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-emerald-600 text-xl">verified</span>
                      <div>
                        <span className="font-bold block">Loan Fully Settled (₹0.00 Outstanding)</span>
                        <span className="text-[11px] text-emerald-700">All principal & accrued interest paid off.</span>
                      </div>
                    </div>
                    <button
                      onClick={handleArchive}
                      className="w-full sm:w-auto justify-center px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">archive</span>
                      Archive Contact
                    </button>
                  </div>
                )}

                <div className="p-4 sm:p-6 bg-[#f4ece6] border border-[#ddbfc6] rounded-xl relative overflow-hidden shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-widest font-bold text-[#620032]">
                      {balance.direction === 'lent' ? 'They Owe You (Lent)' : 'You Owe Them (Borrowed)'}
                    </span>
                    <button
                      onClick={() => {
                        setRateModalBalanceId(balance.id);
                        setNewRate(String(balance.current_rate));
                      }}
                      className="self-start sm:self-auto px-2.5 py-1 bg-[#fff8f3] border border-[#ddbfc6] text-[#620032] font-['JetBrains_Mono'] text-xs font-bold rounded hover:bg-[#ffd9e2] transition-colors"
                    >
                      Change Rate ({balance.current_rate}%/mo)
                    </button>
                  </div>

                  <div className="font-['JetBrains_Mono'] text-3xl sm:text-4xl font-bold text-[#620032] tracking-tight mt-2 sm:mt-3">
                    {formatINR(totalOwed)}
                  </div>

                  <div className="mt-4 sm:mt-5 pt-4 border-t border-[#ddbfc6] grid grid-cols-2 gap-4 text-xs font-['JetBrains_Mono']">
                    <div>
                      <span className="text-[#574147] block">Principal Balance</span>
                      <span className="text-sm sm:text-base font-bold text-[#1e1b17]">{formatINR(balance.principal)}</span>
                    </div>
                    <div>
                      <span className="text-[#574147] block">Accrued Interest (Live)</span>
                      <span className="text-sm sm:text-base font-bold text-[#620032]">{formatINR(liveAccruedInterest)}</span>
                    </div>
                  </div>
                </div>

                {/* Balance Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                  <Link
                    to={`/repayment?balanceId=${balance.id}&personId=${summary.person.id}`}
                    className="flex-1 py-3 text-center bg-[#fff8f3] border border-[#620032] text-[#620032] font-bold text-xs font-['JetBrains_Mono'] rounded-lg hover:bg-[#ffd9e2] transition-colors"
                  >
                    Record Repayment
                  </Link>
                  <Link
                    to={`/disburse?personId=${summary.person.id}&direction=${balance.direction}`}
                    className="flex-1 py-3 text-center bg-[#8b004a] text-white font-bold text-xs font-['JetBrains_Mono'] rounded-lg hover:bg-[#620032] transition-colors shadow-sm"
                  >
                    Add Loan Amount
                  </Link>
                </div>
              </div>

              {/* Right Column: Explain the Math Breakdown */}
              <div className="lg:col-span-5">
                <div className="bg-[#ffffff] p-6 rounded-xl border border-[#ddbfc6] shadow-2xs h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4 border-b border-[#ddbfc6] pb-3">
                      <h3 className="font-bold text-base text-[#1e1b17] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#620032]">calculate</span>
                        Explain the Math
                      </h3>
                      <span className="text-[11px] font-['JetBrains_Mono'] text-[#574147]">
                        Formula: P × (R/30) × Days
                      </span>
                    </div>

                    <div className="p-4 bg-[#faf2ec] rounded-lg border border-dashed border-[#ddbfc6] space-y-3 font-['JetBrains_Mono'] text-xs">
                      <div className="flex justify-between py-1 border-b border-[#ddbfc6]/40">
                        <span className="text-[#574147]">Monthly Interest Rate</span>
                        <span className="font-bold text-[#620032]">{balance.current_rate}% / month</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#ddbfc6]/40">
                        <span className="text-[#574147]">Daily Interest Rate</span>
                        <span className="font-bold text-[#1e1b17]">
                          {(balance.current_rate / 30).toFixed(4)}% / day
                        </span>
                      </div>

                      <div className="pt-2">
                        <p className="text-[10px] uppercase font-bold text-[#574147] mb-2">Live Interest Formula</p>
                        <p className="p-2.5 bg-white rounded border border-[#ddbfc6] text-[11px] leading-relaxed text-[#1e1b17]">
                          {formatINR(balance.principal)} × ({balance.current_rate}% ÷ 30) ={' '}
                          <strong>{formatINR(balance.principal * (balance.current_rate / 100 / 30))} / day</strong>
                        </p>
                      </div>

                      <div className="flex justify-between py-2 text-[#620032] font-bold text-sm border-t border-[#ddbfc6]">
                        <span>Total Live Accrued</span>
                        <span>{formatINR(liveAccruedInterest)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })
      )}

      {/* Transaction History Section */}
      <section className="space-y-4 pt-4">
        <div>
          <h3 className="text-xl font-bold text-[#1e1b17]">Transaction History & Audit Trail</h3>
          <p className="text-xs text-[#574147]">Chronological log of all disbursements, repayments, and rate changes.</p>
        </div>

        <div className="bg-[#ffffff] border border-[#ddbfc6] rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#efe7e0] border-b border-[#ddbfc6]">
                <th className="px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-wider text-right">
                  Amount
                </th>
                <th className="px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-wider text-right">
                  Interest / Principal Applied
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ddbfc6] font-['Inter'] text-sm">
              {summary.balances.flatMap(b => b.transactions).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-xs font-['JetBrains_Mono'] text-[#574147]">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                summary.balances
                  .flatMap(b => b.transactions)
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((txn) => (
                    <tr key={txn.id} className="hover:bg-[#faf2ec] transition-colors">
                      <td className="px-6 py-4 font-['JetBrains_Mono'] text-xs text-[#1e1b17]">
                        {txn.date}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-['JetBrains_Mono'] text-xs font-bold ${
                            txn.type === 'repayment'
                              ? 'bg-emerald-100 text-emerald-800'
                              : txn.type === 'loan'
                              ? 'bg-[#ffd9e2] text-[#8d034b]'
                              : 'bg-[#e5e2da] text-[#5f5e58]'
                          }`}
                        >
                          {txn.type === 'loan'
                            ? 'Loan Disbursement'
                            : txn.type === 'repayment'
                            ? 'Repayment'
                            : `Rate Change (${txn.new_rate}%/mo)`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-['JetBrains_Mono'] text-xs font-bold text-[#1e1b17]">
                        {txn.amount ? formatINR(txn.amount) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right font-['JetBrains_Mono'] text-xs text-[#574147]">
                        {txn.type === 'repayment' ? (
                          <span>
                            Interest: <strong className="text-[#620032]">{formatINR(txn.interest_applied)}</strong> | Principal: {formatINR(txn.principal_applied)}
                          </span>
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
      </section>

      {/* Rate Change Modal */}
      {rateModalBalanceId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#fff8f3] border border-[#ddbfc6] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-[#620032] mb-4">Change Interest Rate</h3>
            <form onSubmit={handleRateChangeSubmit} className="space-y-4 font-['JetBrains_Mono'] text-xs">
              <div>
                <label className="block text-[#574147] mb-1 font-bold">New Monthly Rate (% / month)</label>
                <input
                  type="number"
                  step="0.05"
                  required
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#ddbfc6] rounded-lg text-sm focus:border-[#620032] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#574147] mb-1 font-bold">Effective Date</label>
                <input
                  type="date"
                  required
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#ddbfc6] rounded-lg text-sm focus:border-[#620032] outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#ddbfc6]">
                <button
                  type="button"
                  onClick={() => setRateModalBalanceId(null)}
                  className="px-4 py-2 border border-[#ddbfc6] rounded-lg text-[#574147]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRate}
                  className="px-5 py-2 bg-[#8b004a] text-white rounded-lg font-bold hover:bg-[#620032]"
                >
                  {submittingRate ? 'Saving...' : 'Update Rate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
