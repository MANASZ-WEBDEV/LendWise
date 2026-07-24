import React, { useState } from 'react';
import { Person } from '../types';

interface RecordRepaymentViewProps {
  person: Person;
  onConfirmRepayment: (data: {
    personId: string;
    personName: string;
    amount: number;
    interestPaid: number;
    principalPaid: number;
    date: string;
    method: string;
    memo: string;
  }) => void;
  onBack: () => void;
}

export const RecordRepaymentView: React.FC<RecordRepaymentViewProps> = ({
  person,
  onConfirmRepayment,
  onBack,
}) => {
  const [repaymentAmount, setRepaymentAmount] = useState<string>('2400.00');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer (Wire)');
  const [memo, setMemo] = useState<string>('Quarterly interest & principal reduction settlement.');

  const accruedInterest = person.liveAccrual > 0 ? person.liveAccrual : 450.0;
  const principalBalance = person.principal;
  const totalDue = principalBalance + accruedInterest;

  const numAmount = parseFloat(repaymentAmount) || 0;

  // Interest first split logic
  let interestPaid = 0;
  let principalPaid = 0;

  if (numAmount <= accruedInterest) {
    interestPaid = numAmount;
    principalPaid = 0;
  } else {
    interestPaid = accruedInterest;
    principalPaid = numAmount - accruedInterest;
  }

  const newPrincipal = Math.max(0, principalBalance - principalPaid);
  const newInterest = Math.max(0, accruedInterest - interestPaid);
  const totalRemaining = newPrincipal + newInterest;

  const interestPct = numAmount > 0 ? (interestPaid / numAmount) * 100 : 0;
  const principalPct = numAmount > 0 ? (principalPaid / numAmount) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;
    onConfirmRepayment({
      personId: person.id,
      personName: person.name,
      amount: numAmount,
      interestPaid,
      principalPaid,
      date: paymentDate,
      method: paymentMethod,
      memo,
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center text-[#620032] gap-1.5 mb-3 hover:underline font-['JetBrains_Mono'] text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            BACK TO DEBTOR PROFILE
          </button>
          <h1 className="text-3xl font-bold text-[#8b004a] font-['Inter']">Record Repayment</h1>
          <p className="text-[#574147] text-sm mt-1 max-w-2xl font-['Inter']">
            Updating ledger for <span className="font-bold text-[#1e1b17]">{person.name}</span>. Payments are applied to interest first as per the private lending agreement.
          </p>
        </div>

        <div className="flex items-center bg-[#faf2ec] border border-[#ddbfc6] rounded-lg p-4 font-['JetBrains_Mono'] shadow-2xs">
          <div className="flex flex-col pr-6 border-r border-[#ddbfc6]">
            <span className="text-xs text-[#574147] mb-1 uppercase tracking-wider">Total Due</span>
            <span className="text-xl font-bold text-[#620032]">
              ${totalDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex flex-col pl-6">
            <span className="text-xs text-[#574147] mb-1 uppercase tracking-wider">Next Due</span>
            <span className="text-sm font-bold text-[#1e1b17]">Oct 12, 2023</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="bg-[#ffffff] border border-[#ddbfc6] rounded-xl overflow-hidden shadow-2xs">
            <div className="p-6 border-b border-[#ddbfc6] bg-[#fff8f3]">
              <h2 className="text-lg font-bold text-[#1e1b17] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#620032]">payments</span>
                Payment Details
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Repayment Amount */}
              <div className="space-y-1.5">
                <label className="block font-['JetBrains_Mono'] text-xs text-[#574147] uppercase font-bold">
                  Repayment Amount ($)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-['JetBrains_Mono'] text-[#574147] font-bold text-lg">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={repaymentAmount}
                    onChange={(e) => setRepaymentAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-14 pl-10 pr-4 bg-[#fff8f3] border border-[#ddbfc6] rounded-lg font-['JetBrains_Mono'] text-2xl font-bold text-[#620032] focus:ring-1 focus:ring-[#620032] focus:border-[#620032] outline-none"
                  />
                </div>
                <p className="text-[11px] text-[#574147] italic">
                  Enter the total sum received from the contact.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <div className="space-y-1.5">
                  <label className="block font-['JetBrains_Mono'] text-xs text-[#574147] uppercase font-bold">
                    Date Received
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full h-11 px-4 bg-[#fff8f3] border border-[#ddbfc6] rounded-lg text-sm font-['Inter'] focus:ring-1 focus:ring-[#620032] focus:border-[#620032] outline-none"
                  />
                </div>

                {/* Method */}
                <div className="space-y-1.5">
                  <label className="block font-['JetBrains_Mono'] text-xs text-[#574147] uppercase font-bold">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full h-11 px-4 bg-[#fff8f3] border border-[#ddbfc6] rounded-lg text-sm font-['Inter'] focus:ring-1 focus:ring-[#620032] focus:border-[#620032] outline-none cursor-pointer"
                  >
                    <option>Bank Transfer (Wire)</option>
                    <option>Zelle / P2P</option>
                    <option>Physical Check</option>
                    <option>Cash</option>
                    <option>Cryptocurrency</option>
                  </select>
                </div>
              </div>

              {/* Memo */}
              <div className="space-y-1.5">
                <label className="block font-['JetBrains_Mono'] text-xs text-[#574147] uppercase font-bold">
                  Memo / Reference
                </label>
                <textarea
                  rows={3}
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Reference ID or internal notes..."
                  className="w-full p-3 bg-[#fff8f3] border border-[#ddbfc6] rounded-lg text-sm font-['Inter'] focus:ring-1 focus:ring-[#620032] focus:border-[#620032] outline-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-[#faf2ec] border-t border-[#ddbfc6] flex justify-end gap-3">
              <button
                type="button"
                onClick={onBack}
                className="px-5 h-11 rounded-lg font-['JetBrains_Mono'] text-xs font-bold text-[#620032] border border-[#620032] hover:bg-[#ffd9e2] transition-all"
              >
                Save Draft
              </button>
              <button
                type="submit"
                className="px-6 h-11 rounded-lg font-['JetBrains_Mono'] text-xs font-bold bg-[#8b004a] text-white hover:bg-[#620032] transition-all shadow-sm active:scale-95"
              >
                Confirm Repayment
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Allocation & Status */}
        <div className="lg:col-span-5 space-y-6">
          {/* Allocation Visualizer */}
          <section className="bg-[#e9e1db] border border-[#ddbfc6] rounded-xl p-6 shadow-2xs relative overflow-hidden">
            <h2 className="text-lg font-bold text-[#8b004a] mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#620032]">analytics</span>
              Live Allocation
            </h2>

            {/* Visual Progress Bar */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-end font-['JetBrains_Mono'] text-xs">
                <span className="text-[#574147]">ALLOCATION SPLIT</span>
                <span className="text-[#620032] font-bold">
                  ${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
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

              <div className="flex gap-6 font-['JetBrains_Mono'] text-xs">
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

            {/* Allocation Breakdown */}
            <div className="space-y-3 font-['JetBrains_Mono'] text-xs">
              <div className="flex justify-between p-3.5 rounded-lg bg-[#fff8f3] border border-[#ddbfc6]">
                <div>
                  <span className="text-[#574147] font-bold block">COVERS INTEREST</span>
                  <span className="text-[11px] text-[#8a7077]">Accrued as of today</span>
                </div>
                <span className="font-bold text-[#1e1b17] text-sm">
                  ${interestPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between p-3.5 rounded-lg bg-[#fff8f3] border border-[#ddbfc6]">
                <div>
                  <span className="text-[#574147] font-bold block">REDUCES PRINCIPAL</span>
                  <span className="text-[11px] text-[#8a7077]">Net balance deduction</span>
                </div>
                <span className="font-bold text-[#1e1b17] text-sm">
                  ${principalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </section>

          {/* Current Balance Card */}
          <section className="bg-[#ffffff] border border-[#ddbfc6] rounded-xl overflow-hidden shadow-2xs">
            <div className="p-3.5 border-b border-[#ddbfc6] bg-[#faf2ec]">
              <span className="font-['JetBrains_Mono'] text-xs text-[#574147] font-bold uppercase tracking-widest">
                Post-Payment Remaining Balances
              </span>
            </div>
            <table className="w-full text-left font-['JetBrains_Mono'] text-xs">
              <tbody className="divide-y divide-[#ddbfc6]">
                <tr>
                  <td className="px-5 py-3.5 text-[#1e1b17]">Principal Balance</td>
                  <td className="px-5 py-3.5 text-right font-bold text-[#1e1b17]">
                    ${newPrincipal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-3.5 text-[#1e1b17]">Accrued Interest</td>
                  <td className="px-5 py-3.5 text-right font-bold text-[#620032]">
                    ${newInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr className="bg-[#efe7e0]">
                  <td className="px-5 py-3.5 font-bold text-[#1e1b17]">Total Remaining</td>
                  <td className="px-5 py-3.5 text-right text-base font-bold text-[#620032]">
                    ${totalRemaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Compliance Status */}
          <div className="p-4 rounded-xl border border-[#ddbfc6] bg-[#fff8f3] flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-full bg-[#ffd9e2] flex items-center justify-center flex-shrink-0 text-[#8d034b]">
              <span className="material-symbols-outlined text-xl">verified_user</span>
            </div>
            <div>
              <h4 className="font-['JetBrains_Mono'] text-xs font-bold text-[#1e1b17] mb-0.5">
                Contract Compliance
              </h4>
              <p className="text-xs text-[#574147] leading-relaxed">
                This payment will keep the contract in 'Active / Cleared' standing and generate an automated receipt for {person.name}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
