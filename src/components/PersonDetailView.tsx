import React, { useState } from 'react';
import { Person, Transaction, ViewMode } from '../types';

interface PersonDetailViewProps {
  person: Person;
  transactions: Transaction[];
  onNavigate: (view: ViewMode) => void;
  onRecordRepayment: (person: Person) => void;
  onNewLoanForPerson: (person: Person) => void;
  onBack: () => void;
}

export const PersonDetailView: React.FC<PersonDetailViewProps> = ({
  person,
  transactions,
  onNavigate,
  onRecordRepayment,
  onNewLoanForPerson,
  onBack,
}) => {
  // Live "Explain the Math" interactive parameters
  const [calcRate, setCalcRate] = useState<number>(person.interestRate || 14.0);
  const [calcDays, setCalcDays] = useState<number>(person.accrualDays || 372);
  const [showMathDetails, setShowMathDetails] = useState<boolean>(false);

  // Simple interest calculation: Principal * Rate/100 * Days/365
  const calculatedInterest = (person.principal * (calcRate / 100) * calcDays) / 365;
  const totalOutstanding = person.principal + calculatedInterest;

  // Filter transactions relevant to this person or fallback
  const personTxns = transactions.filter(
    (t) => t.personId === person.id || t.personName.toLowerCase().includes(person.name.toLowerCase().split(' ')[0])
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24">
      {/* Top Back Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[#620032] font-['JetBrains_Mono'] text-xs font-semibold hover:underline"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          BACK TO PEOPLE DIRECTORY
        </button>
        <span className="text-xs text-[#574147] font-['JetBrains_Mono'] bg-[#faf2ec] px-3 py-1 rounded border border-[#ddbfc6]">
          ID: {person.id}
        </span>
      </div>

      {/* Person Header & Balance Hero Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Profile & Outstanding Balance */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#efe7e0] border border-[#ddbfc6] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-xs">
              <img src={person.avatar} alt={person.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#620032] font-['Inter'] leading-tight">
                {person.name}
              </h1>
              <p className="text-xs text-[#574147] font-['JetBrains_Mono']">{person.company}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-3 py-0.5 bg-[#ffd9e2] text-[#8d034b] text-[11px] font-bold rounded-full font-['JetBrains_Mono'] uppercase tracking-wider">
                  {person.tier || 'Premium Client'}
                </span>
                <span className="px-3 py-0.5 bg-[#efe7e0] text-[#5f5e58] text-[11px] font-bold rounded-full font-['JetBrains_Mono'] uppercase tracking-wider">
                  Active Portfolio
                </span>
              </div>
            </div>
          </div>

          {/* Hero Balance Card */}
          <div className="p-7 bg-[#f4ece6] border border-[#ddbfc6] rounded-xl relative overflow-hidden shadow-xs">
            <div className="absolute top-2 right-2 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-9xl">account_balance_wallet</span>
            </div>

            <p className="font-['JetBrains_Mono'] text-xs text-[#65645e] uppercase tracking-widest font-semibold mb-1">
              Total Outstanding Balance
            </p>

            <div className="flex items-baseline gap-2">
              <span className="font-['JetBrains_Mono'] text-4xl font-bold text-[#620032] tracking-tight">
                ${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="mt-5 pt-4 border-t border-[#ddbfc6] flex flex-wrap items-center gap-4 text-xs font-['JetBrains_Mono']">
              <div className="flex items-center text-[#ba1a1a] font-bold gap-1">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>2.4% interest accrued this month</span>
              </div>
              <div className="h-3 w-px bg-[#ddbfc6] hidden sm:block"></div>
              <div className="text-[#574147]">
                Last payment: <span className="font-semibold">{person.lastPaymentDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: "Explain the Math" Calculation Box */}
        <div className="lg:col-span-5">
          <div className="bg-[#ffffff] p-6 rounded-xl border border-[#ddbfc6] shadow-2xs h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5 border-b border-[#ddbfc6] pb-3">
                <h3 className="font-bold text-lg text-[#1e1b17] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#620032]">calculate</span>
                  Explain the Math
                </h3>
                <button
                  onClick={() => setShowMathDetails(!showMathDetails)}
                  className="text-[#620032] hover:underline text-xs font-['JetBrains_Mono'] font-bold"
                >
                  {showMathDetails ? 'Simple View' : 'Adjust Math'}
                </button>
              </div>

              {/* Math breakdown details */}
              <div className="p-4 bg-[#faf2ec] rounded-lg border border-dashed border-[#ddbfc6] space-y-3 font-['JetBrains_Mono'] text-xs">
                <p className="text-[10px] text-[#574147] uppercase font-bold tracking-wider mb-2">
                  Calculation Logic (Simple Interest)
                </p>

                <div className="flex justify-between py-1 border-b border-[#ddbfc6]/40">
                  <span className="text-[#65645e]">Principal</span>
                  <span className="font-bold text-[#1e1b17]">
                    ${person.principal.toLocaleString('en-US')}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-[#ddbfc6]/40">
                  <span className="text-[#65645e]">Rate (p.a.)</span>
                  {showMathDetails ? (
                    <input
                      type="number"
                      step="0.1"
                      value={calcRate}
                      onChange={(e) => setCalcRate(parseFloat(e.target.value) || 0)}
                      className="w-20 bg-white border border-[#ddbfc6] rounded px-2 py-0.5 text-right font-bold text-[#620032]"
                    />
                  ) : (
                    <span className="font-bold text-[#1e1b17]">{calcRate.toFixed(2)}%</span>
                  )}
                </div>

                <div className="flex justify-between items-center py-1 border-b border-[#ddbfc6]/40">
                  <span className="text-[#65645e]">Accrual Days</span>
                  {showMathDetails ? (
                    <input
                      type="number"
                      value={calcDays}
                      onChange={(e) => setCalcDays(parseInt(e.target.value) || 0)}
                      className="w-20 bg-white border border-[#ddbfc6] rounded px-2 py-0.5 text-right font-bold text-[#620032]"
                    />
                  ) : (
                    <span className="font-bold text-[#1e1b17]">{calcDays} Days</span>
                  )}
                </div>

                <div className="flex justify-between py-2 text-[#620032] font-bold text-sm">
                  <span>Total Interest</span>
                  <span>
                    ${calculatedInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 text-[#574147] text-xs leading-relaxed">
                <span className="material-symbols-outlined text-base mt-0.5 flex-shrink-0">info</span>
                <p>
                  Interest is calculated daily based on a 365-day year convention. Adjustments for leap years & custom payment schedules follow standard financial protocols.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transaction History Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-[#1e1b17]">Transaction History</h3>
            <p className="text-xs text-[#574147]">Comprehensive ledger of all financial activities for {person.name}.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => alert('Filtering transactions...')}
              className="px-3.5 py-1.5 bg-[#efe7e0] border border-[#ddbfc6] rounded-lg text-xs font-['JetBrains_Mono'] text-[#1e1b17] hover:bg-[#e9e1db] transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">filter_list</span>
              Filter
            </button>
            <button
              onClick={() => alert('Exporting PDF audit statement...')}
              className="px-3.5 py-1.5 bg-[#efe7e0] border border-[#ddbfc6] rounded-lg text-xs font-['JetBrains_Mono'] text-[#1e1b17] hover:bg-[#e9e1db] transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Export PDF
            </button>
          </div>
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
                <th className="px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-wider text-right">
                  Debit (-)
                </th>
                <th className="px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-wider text-right">
                  Credit (+)
                </th>
                <th className="px-6 py-3 font-['JetBrains_Mono'] text-xs text-[#574147] uppercase tracking-wider text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ddbfc6] font-['Inter'] text-sm">
              {personTxns.length > 0 ? (
                personTxns.map((txn, idx) => (
                  <tr key={txn.id || idx} className="hover:bg-[#faf2ec] transition-colors">
                    <td className="px-6 py-4 font-['JetBrains_Mono'] text-xs text-[#1e1b17]">{txn.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            txn.type === 'Repayment'
                              ? 'bg-emerald-600'
                              : txn.type === 'Loan Disbursement'
                              ? 'bg-[#620032]'
                              : 'bg-[#5f5e58]'
                          }`}
                        />
                        <span>{txn.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-['JetBrains_Mono'] text-[#574147]">{txn.reference}</td>
                    <td className="px-6 py-4 text-right font-['JetBrains_Mono'] text-xs font-semibold text-[#1e1b17]">
                      {txn.debit ? `$${txn.debit.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-right font-['JetBrains_Mono'] text-xs font-semibold text-[#620032]">
                      {txn.credit ? `$${txn.credit.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold font-['JetBrains_Mono'] rounded uppercase">
                        {txn.status || 'CLEARED'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="hover:bg-[#faf2ec]">
                  <td className="px-6 py-4 font-['JetBrains_Mono'] text-xs">12 Oct 2023</td>
                  <td className="px-6 py-4">Repayment</td>
                  <td className="px-6 py-4 font-['JetBrains_Mono'] text-xs text-[#574147]">TXN-8849201</td>
                  <td className="px-6 py-4 text-right font-['JetBrains_Mono'] text-xs">—</td>
                  <td className="px-6 py-4 text-right font-['JetBrains_Mono'] text-xs text-[#620032] font-semibold">
                    $5,000.00
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold font-['JetBrains_Mono'] rounded uppercase">
                      CLEARED
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sticky Primary Actions Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-[#fff8f3]/90 backdrop-blur-md border-t border-[#ddbfc6] px-6 py-4 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ffd9e2] rounded-full text-[#8d034b]">
              <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
            </div>
            <div>
              <p className="text-[11px] font-['JetBrains_Mono'] text-[#574147] uppercase leading-none mb-1">
                {person.name}
              </p>
              <p className="font-['JetBrains_Mono'] text-[#620032] font-bold text-base">
                Outstanding: ${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => onRecordRepayment(person)}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-[#fff8f3] border border-[#620032] text-[#620032] font-bold text-xs font-['JetBrains_Mono'] rounded-lg hover:bg-[#ffd9e2] transition-all"
            >
              Record Repayment
            </button>
            <button
              onClick={() => onNewLoanForPerson(person)}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-[#8b004a] text-white font-bold text-xs font-['JetBrains_Mono'] rounded-lg shadow-sm hover:bg-[#620032] transition-all active:scale-95"
            >
              New Loan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
