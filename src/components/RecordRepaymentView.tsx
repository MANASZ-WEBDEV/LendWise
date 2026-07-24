import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchPeople, fetchPersonSummary, recordRepaymentTransaction } from '../lib/supabase-queries';
import { PersonSummary, DbBalance } from '../types';
import { formatINR } from '../lib/currency';
import { calculateRepaymentSplit } from '../lib/interest-engine';
import { toast } from 'sonner';

export const RecordRepaymentView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryBalanceId = searchParams.get('balanceId');
  const queryPersonId = searchParams.get('personId');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState<PersonSummary | null>(null);
  const [selectedBalanceId, setSelectedBalanceId] = useState<string>(queryBalanceId || '');

  // Form
  const [amountStr, setAmountStr] = useState<string>('2000');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (queryPersonId) {
      loadPerson(queryPersonId);
    } else {
      loadFirstAvailablePerson();
    }
  }, [queryPersonId]);

  const loadPerson = async (personId: string) => {
    setLoading(true);
    try {
      const people = await fetchPeople();
      const p = people.find(item => item.id === personId);
      if (p) {
        const s = await fetchPersonSummary(p);
        setSummary(s);
        if (!selectedBalanceId && s.balances.length > 0) {
          setSelectedBalanceId(s.balances[0].balance.id);
        }
      }
    } catch (err: any) {
      toast.error('Failed to load repayment details: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadFirstAvailablePerson = async () => {
    setLoading(true);
    try {
      const people = await fetchPeople();
      if (people.length > 0) {
        const s = await fetchPersonSummary(people[0]);
        setSummary(s);
        if (s.balances.length > 0) {
          setSelectedBalanceId(s.balances[0].balance.id);
        }
      }
    } catch (err: any) {
      toast.error('Failed to load contacts: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const selectedBalanceItem = summary?.balances.find(b => b.balance.id === selectedBalanceId);
  const currentPrincipal = selectedBalanceItem?.balance.principal || 0;
  const currentInterest = selectedBalanceItem?.liveAccruedInterest || 0;
  const totalDue = currentPrincipal + currentInterest;

  const numAmount = parseFloat(amountStr) || 0;
  const split = calculateRepaymentSplit(numAmount, currentInterest, currentPrincipal);

  const interestPct = numAmount > 0 ? (split.interestPaid / numAmount) * 100 : 0;
  const principalPct = numAmount > 0 ? (split.principalPaid / numAmount) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBalanceId) {
      toast.error('Please select a balance');
      return;
    }
    if (numAmount <= 0) {
      toast.error('Please enter a valid repayment amount');
      return;
    }

    setSubmitting(true);
    try {
      await recordRepaymentTransaction({
        balanceId: selectedBalanceId,
        amount: numAmount,
        outstandingInterest: currentInterest,
        currentPrincipal,
        date,
        notes,
      });

      toast.success(`Repayment of ${formatINR(numAmount)} recorded!`);
      if (summary) {
        navigate(`/person/${summary.person.id}`);
      } else {
        navigate('/people');
      }
    } catch (err: any) {
      toast.error('Failed to record repayment: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center font-['Inter']">
        <div className="inline-block w-8 h-8 border-4 border-[#620032] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-xs font-['JetBrains_Mono'] text-[#574147]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-8 font-['Inter'] pb-12">
      <div>
        <h1 className="text-3xl font-bold text-[#8b004a]">Record Repayment</h1>
        <p className="text-[#574147] text-sm mt-1">
          Payments are automatically applied to interest first, then to principal.
        </p>
      </div>

      {!summary || summary.balances.length === 0 ? (
        <div className="p-8 bg-[#fff8f3] border border-dashed border-[#ddbfc6] rounded-xl text-center">
          <p className="text-sm font-['JetBrains_Mono'] text-[#574147] mb-4">
            No balance found for repayment.
          </p>
          <button
            onClick={() => navigate('/people')}
            className="px-5 py-2.5 bg-[#8b004a] text-white font-['JetBrains_Mono'] text-xs font-bold rounded-lg hover:bg-[#620032]"
          >
            Go to People Directory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="bg-white border border-[#ddbfc6] rounded-xl overflow-hidden shadow-2xs">
              <div className="p-6 border-b border-[#ddbfc6] bg-[#fff8f3]">
                <h2 className="text-lg font-bold text-[#1e1b17] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#620032]">payments</span>
                  Repayment for {summary.person.name}
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Balance Selector if person has multiple balances */}
                {summary.balances.length > 1 && (
                  <div className="space-y-1.5 font-['JetBrains_Mono'] text-xs">
                    <label className="block text-[#574147] uppercase font-bold">Select Balance</label>
                    <select
                      value={selectedBalanceId}
                      onChange={(e) => setSelectedBalanceId(e.target.value)}
                      className="w-full h-11 px-3 bg-[#fff8f3] border border-[#ddbfc6] rounded-lg text-sm"
                    >
                      {summary.balances.map(b => (
                        <option key={b.balance.id} value={b.balance.id}>
                          {b.balance.direction === 'lent' ? 'Lent Balance' : 'Borrowed Balance'} — {formatINR(b.totalOwed)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Repayment Amount */}
                <div className="space-y-1.5">
                  <label className="block font-['JetBrains_Mono'] text-xs text-[#574147] uppercase font-bold">
                    Repayment Amount (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-['JetBrains_Mono'] text-[#574147] font-bold text-lg">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="1"
                      required
                      value={amountStr}
                      onChange={(e) => setAmountStr(e.target.value)}
                      placeholder="0"
                      className="w-full h-14 pl-10 pr-4 bg-[#fff8f3] border border-[#ddbfc6] rounded-lg font-['JetBrains_Mono'] text-2xl font-bold text-[#620032] focus:border-[#620032] outline-none"
                    />
                  </div>
                </div>

                {/* Payment Date */}
                <div className="space-y-1.5">
                  <label className="block font-['JetBrains_Mono'] text-xs text-[#574147] uppercase font-bold">
                    Payment Received Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-11 px-4 bg-[#fff8f3] border border-[#ddbfc6] rounded-lg text-sm outline-none"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="block font-['JetBrains_Mono'] text-xs text-[#574147] uppercase font-bold">
                    Notes / Reference (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Bank transfer reference, Google Pay, cash"
                    className="w-full p-3 bg-[#fff8f3] border border-[#ddbfc6] rounded-lg text-sm outline-none"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-[#faf2ec] border-t border-[#ddbfc6] flex justify-end gap-3 font-['JetBrains_Mono']">
                <button
                  type="button"
                  onClick={() => navigate(`/person/${summary.person.id}`)}
                  className="px-5 h-11 rounded-lg text-xs font-bold text-[#574147] border border-[#ddbfc6] hover:bg-[#efe7e0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 h-11 rounded-lg text-xs font-bold bg-[#8b004a] text-white hover:bg-[#620032] shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Confirming...' : 'Confirm Repayment'}
                </button>
              </div>
            </form>
          </div>

          {/* Allocation Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <section className="bg-[#e9e1db] border border-[#ddbfc6] rounded-xl p-6 shadow-2xs relative overflow-hidden font-['JetBrains_Mono']">
              <h2 className="text-base font-bold text-[#8b004a] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#620032]">analytics</span>
                Live Payment Allocation
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-end text-xs">
                  <span className="text-[#574147]">ALLOCATION SPLIT</span>
                  <span className="text-[#620032] font-bold">{formatINR(numAmount)}</span>
                </div>

                <div className="h-4 w-full bg-[#faf2ec] rounded-full flex overflow-hidden border border-[#ddbfc6]">
                  <div
                    className="h-full bg-[#8b004a] transition-all duration-300"
                    style={{ width: `${interestPct}%` }}
                    title="Interest Portion"
                  ></div>
                  <div
                    className="h-full bg-[#ffb0c9] transition-all duration-300"
                    style={{ width: `${principalPct}%` }}
                    title="Principal Portion"
                  ></div>
                </div>

                <div className="flex gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-xs bg-[#8b004a]"></div>
                    <span className="text-[#1e1b17]">Interest ({interestPct.toFixed(0)}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-xs bg-[#ffb0c9] border border-[#ddbfc6]"></div>
                    <span className="text-[#1e1b17]">Principal ({principalPct.toFixed(0)}%)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-3.5 rounded-lg bg-[#fff8f3] border border-[#ddbfc6]">
                  <div>
                    <span className="text-[#574147] font-bold block">COVERS INTEREST</span>
                    <span className="text-[11px] text-[#8a7077]">Accrued interest cleared</span>
                  </div>
                  <span className="font-bold text-[#1e1b17] text-sm">{formatINR(split.interestPaid)}</span>
                </div>

                <div className="flex justify-between p-3.5 rounded-lg bg-[#fff8f3] border border-[#ddbfc6]">
                  <div>
                    <span className="text-[#574147] font-bold block">REDUCES PRINCIPAL</span>
                    <span className="text-[11px] text-[#8a7077]">Net principal reduction</span>
                  </div>
                  <span className="font-bold text-[#1e1b17] text-sm">{formatINR(split.principalPaid)}</span>
                </div>
              </div>
            </section>

            {/* Remaining Balance Summary */}
            <section className="bg-white border border-[#ddbfc6] rounded-xl overflow-hidden shadow-2xs font-['JetBrains_Mono'] text-xs">
              <div className="p-3.5 border-b border-[#ddbfc6] bg-[#faf2ec]">
                <span className="text-[#574147] font-bold uppercase tracking-wider">
                  Post-Payment Remaining Balances
                </span>
              </div>
              <table className="w-full text-left">
                <tbody className="divide-y divide-[#ddbfc6]">
                  <tr>
                    <td className="px-5 py-3 text-[#1e1b17]">Principal Balance</td>
                    <td className="px-5 py-3 text-right font-bold text-[#1e1b17]">{formatINR(split.newPrincipal)}</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 text-[#1e1b17]">Outstanding Interest</td>
                    <td className="px-5 py-3 text-right font-bold text-[#620032]">{formatINR(split.newInterest)}</td>
                  </tr>
                  <tr className="bg-[#efe7e0]">
                    <td className="px-5 py-3 font-bold text-[#1e1b17]">Total Remaining</td>
                    <td className="px-5 py-3 text-right text-base font-bold text-[#620032]">{formatINR(split.totalRemaining)}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};
