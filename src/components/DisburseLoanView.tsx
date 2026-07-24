import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchPeople, recordLoanDisbursement } from '../lib/supabase-queries';
import { DbPerson, BalanceDirection } from '../types';
import { formatINR } from '../lib/currency';
import { computePeriodInterest, getDaysDifference } from '../lib/interest-engine';
import { toast } from 'sonner';

export const DisburseLoanView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryPersonId = searchParams.get('personId');
  const queryDirection = searchParams.get('direction') as BalanceDirection | null;

  const [people, setPeople] = useState<DbPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedPersonId, setSelectedPersonId] = useState<string>(queryPersonId || '');
  const [direction, setDirection] = useState<BalanceDirection>(queryDirection || 'lent');
  const [principal, setPrincipal] = useState<string>('10000');
  const [monthlyRate, setMonthlyRate] = useState<string>('1.5');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    setLoading(true);
    try {
      const data = await fetchPeople();
      setPeople(data);
      if (!selectedPersonId && data.length > 0) {
        setSelectedPersonId(data[0].id);
      }
    } catch (err: any) {
      toast.error('Failed to load contacts: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const numPrincipal = parseFloat(principal) || 0;
  const numRate = parseFloat(monthlyRate) || 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const elapsedDays = date < todayStr ? getDaysDifference(date, todayStr) : 0;
  const estimatedAccrued = computePeriodInterest(numPrincipal, numRate, elapsedDays);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonId) {
      toast.error('Please select a contact');
      return;
    }
    if (numPrincipal <= 0) {
      toast.error('Please enter a valid principal amount');
      return;
    }
    if (numRate <= 0) {
      toast.error('Please enter a valid monthly interest rate');
      return;
    }

    setSubmitting(true);
    try {
      await recordLoanDisbursement({
        personId: selectedPersonId,
        direction,
        amount: numPrincipal,
        monthlyRate: numRate,
        date,
        notes,
      });

      toast.success('Loan disbursement recorded successfully!');
      navigate(`/person/${selectedPersonId}`);
    } catch (err: any) {
      toast.error('Failed to record loan: ' + (err.message || 'Unknown error'));
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
    <div className="max-w-4xl mx-auto py-2 sm:py-6 font-['Inter'] space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#620032] tracking-tight">Disburse / Add Loan</h1>
        <p className="text-xs sm:text-sm text-[#574147] mt-1">
          Record a new loan disbursement or onboard an existing informal loan.
        </p>
      </div>

      {people.length === 0 ? (
        <div className="p-6 sm:p-8 bg-[#fff8f3] border border-dashed border-[#ddbfc6] rounded-xl text-center">
          <p className="text-sm font-['JetBrains_Mono'] text-[#574147] mb-4">
            You must add a contact before disbursing a loan.
          </p>
          <button
            onClick={() => navigate('/people')}
            className="px-5 py-2.5 bg-[#8b004a] text-white font-['JetBrains_Mono'] text-xs font-bold rounded-lg hover:bg-[#620032]"
          >
            Go to People Directory
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-[#ddbfc6] rounded-xl p-4 sm:p-6 shadow-2xs space-y-5 sm:space-y-6">
          {/* Person Selection */}
          <div className="space-y-1.5">
            <label className="block font-['JetBrains_Mono'] text-xs uppercase font-bold text-[#574147]">
              Select Person *
            </label>
            <select
              value={selectedPersonId}
              onChange={(e) => setSelectedPersonId(e.target.value)}
              className="w-full h-11 px-4 bg-[#fff8f3] border border-[#ddbfc6] rounded-lg text-sm focus:border-[#620032] outline-none"
            >
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.notes ? `(${p.notes})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Direction */}
            <div className="space-y-1.5">
              <label className="block font-['JetBrains_Mono'] text-xs uppercase font-bold text-[#574147]">
                Transaction Direction *
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as BalanceDirection)}
                className="w-full h-11 px-4 bg-[#fff8f3] border border-[#ddbfc6] rounded-lg text-sm focus:border-[#620032] outline-none"
              >
                <option value="lent">Money Lent (They owe you)</option>
                <option value="borrowed">Money Borrowed (You owe them)</option>
              </select>
            </div>

            {/* Monthly Rate */}
            <div className="space-y-1.5">
              <label className="block font-['JetBrains_Mono'] text-xs uppercase font-bold text-[#574147]">
                Monthly Interest Rate (% / month) *
              </label>
              <input
                type="number"
                step="0.05"
                required
                value={monthlyRate}
                onChange={(e) => setMonthlyRate(e.target.value)}
                placeholder="e.g. 1.5"
                className="w-full h-11 px-4 bg-[#fff8f3] border border-[#ddbfc6] rounded-lg text-sm font-['JetBrains_Mono'] focus:border-[#620032] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Principal Amount */}
            <div className="space-y-1.5">
              <label className="block font-['JetBrains_Mono'] text-xs uppercase font-bold text-[#574147]">
                Principal Amount (₹) *
              </label>
              <input
                type="number"
                step="100"
                required
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="10000"
                className="w-full h-11 px-4 bg-[#fff8f3] border border-[#ddbfc6] rounded-lg text-sm font-['JetBrains_Mono'] focus:border-[#620032] outline-none"
              />
            </div>

            {/* Date (Supports Backdating) */}
            <div className="space-y-1.5">
              <label className="block font-['JetBrains_Mono'] text-xs uppercase font-bold text-[#574147]">
                Loan Start Date (Effective Date) *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 px-4 bg-[#fff8f3] border border-[#ddbfc6] rounded-lg text-sm font-['Inter'] focus:border-[#620032] outline-none"
              />
            </div>
          </div>

          {/* Backdating Information Callout */}
          {elapsedDays > 0 && (
            <div className="p-4 bg-[#ffd9e2]/40 border border-[#ddbfc6] rounded-lg flex items-start gap-3">
              <span className="material-symbols-outlined text-[#620032] text-xl mt-0.5">info</span>
              <div className="text-xs font-['JetBrains_Mono'] text-[#1e1b17] space-y-1">
                <p className="font-bold text-[#620032]">Backdated Loan Entry Detected</p>
                <p>
                  This loan started <strong>{elapsedDays} days ago</strong> on {date}. The engine will automatically compute accrued interest of approximately <strong>{formatINR(estimatedAccrued)}</strong> up to today.
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block font-['JetBrains_Mono'] text-xs uppercase font-bold text-[#574147]">
              Notes / Reference (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. UPI transaction ID, bank transfer note"
              className="w-full p-3 bg-[#fff8f3] border border-[#ddbfc6] rounded-lg text-sm focus:border-[#620032] outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#ddbfc6] flex justify-end gap-3 font-['JetBrains_Mono']">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-5 h-11 border border-[#ddbfc6] text-[#574147] font-bold text-xs rounded-lg hover:bg-[#faf2ec]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 h-11 bg-[#8b004a] text-white font-bold text-xs rounded-lg hover:bg-[#620032] shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Record Loan'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
