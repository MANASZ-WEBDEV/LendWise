import React, { useState } from 'react';
import { Person, ViewMode } from '../types';

interface DisburseLoanViewProps {
  people: Person[];
  selectedPerson?: Person | null;
  onFinishDisbursement: (data: {
    personId: string;
    personName: string;
    principal: number;
    rate: number;
    termMonths: number;
    disbursementDate: string;
  }) => void;
  onCancel: () => void;
}

export const DisburseLoanView: React.FC<DisburseLoanViewProps> = ({
  people,
  selectedPerson,
  onFinishDisbursement,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [chosenPersonId, setChosenPersonId] = useState<string>(
    selectedPerson ? selectedPerson.id : people[0]?.id || ''
  );
  const [searchName, setSearchName] = useState<string>('');
  const [principal, setPrincipal] = useState<number>(250000);
  const [rate, setRate] = useState<number>(8.5);
  const [termMonths, setTermMonths] = useState<number>(24);
  const [disbursementDate, setDisbursementDate] = useState<string>('2023-11-20');

  const chosenPerson = people.find((p) => p.id === chosenPersonId) || people[0];

  // Live Projection Calculations
  const years = termMonths / 12;
  const totalInterest = principal * (rate / 100) * years;
  const totalRepayment = principal + totalInterest;
  const monthlyCashflow = totalRepayment / termMonths;

  const filteredPeople = people.filter((p) =>
    p.name.toLowerCase().includes(searchName.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chosenPerson) return;
    onFinishDisbursement({
      personId: chosenPerson.id,
      personName: chosenPerson.name,
      principal,
      rate,
      termMonths,
      disbursementDate,
    });
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 py-4">
      {/* Left Column: Stepper Form */}
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1e1b17] font-['Inter']">Disburse Loan</h1>
          <p className="text-sm text-[#574147] mt-1 font-['Inter']">
            Establish a new private ledger entry for a borrower.
          </p>
        </div>

        {/* Stepper Indicators */}
        <nav className="flex items-center gap-3 overflow-x-auto pb-2 border-b border-[#ddbfc6]">
          {/* Step 1 */}
          <div
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 cursor-pointer ${
              currentStep === 1 ? 'text-[#620032] font-bold' : 'text-[#8a7077]'
            }`}
          >
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center font-['JetBrains_Mono'] text-xs border ${
                currentStep === 1
                  ? 'bg-[#620032] text-white border-[#620032]'
                  : currentStep > 1
                  ? 'bg-[#ffd9e2] text-[#8d034b] border-[#620032]'
                  : 'bg-transparent border-[#8a7077]'
              }`}
            >
              {currentStep > 1 ? '✓' : '1'}
            </span>
            <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider">
              Borrower
            </span>
          </div>

          <div className="h-px w-6 bg-[#ddbfc6]"></div>

          {/* Step 2 */}
          <div
            onClick={() => setCurrentStep(2)}
            className={`flex items-center gap-2 cursor-pointer ${
              currentStep === 2 ? 'text-[#620032] font-bold' : 'text-[#8a7077]'
            }`}
          >
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center font-['JetBrains_Mono'] text-xs border ${
                currentStep === 2
                  ? 'bg-[#620032] text-white border-[#620032]'
                  : currentStep > 2
                  ? 'bg-[#ffd9e2] text-[#8d034b] border-[#620032]'
                  : 'bg-transparent border-[#8a7077]'
              }`}
            >
              {currentStep > 2 ? '✓' : '2'}
            </span>
            <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider">
              Financials
            </span>
          </div>

          <div className="h-px w-6 bg-[#ddbfc6]"></div>

          {/* Step 3 */}
          <div
            onClick={() => setCurrentStep(3)}
            className={`flex items-center gap-2 cursor-pointer ${
              currentStep === 3 ? 'text-[#620032] font-bold' : 'text-[#8a7077]'
            }`}
          >
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center font-['JetBrains_Mono'] text-xs border ${
                currentStep === 3
                  ? 'bg-[#620032] text-white border-[#620032]'
                  : 'bg-transparent border-[#8a7077]'
              }`}
            >
              3
            </span>
            <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider">
              Review
            </span>
          </div>
        </nav>

        {/* Step Content */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: BORROWER */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-2">
                <label className="font-['JetBrains_Mono'] text-xs uppercase text-[#574147] font-semibold block">
                  Search Existing Borrower
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Start typing name..."
                    className="w-full h-11 bg-white border border-[#ddbfc6] rounded-lg px-4 text-sm focus:border-[#620032] focus:ring-1 focus:ring-[#620032] outline-none"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-[#574147]">
                    search
                  </span>
                </div>
              </div>

              {/* List of borrowers */}
              <div className="max-h-56 overflow-y-auto border border-[#ddbfc6] rounded-xl p-2 space-y-1 bg-[#faf2ec]">
                {filteredPeople.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setChosenPersonId(p.id)}
                    className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                      chosenPersonId === p.id
                        ? 'bg-[#fff8f3] border-[#620032] shadow-2xs'
                        : 'border-transparent hover:bg-[#efe7e0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#ddbfc6]"
                      />
                      <div>
                        <p className="font-bold text-sm text-[#1e1b17]">{p.name}</p>
                        <p className="text-xs text-[#574147] font-['JetBrains_Mono']">
                          {p.company} • Score: {p.creditScore}
                        </p>
                      </div>
                    </div>
                    {chosenPersonId === p.id && (
                      <span className="material-symbols-outlined text-[#620032]">check_circle</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Selected Borrower Details Preview Card */}
              {chosenPerson && (
                <div className="border border-[#ddbfc6] rounded-xl p-5 bg-[#faf2ec] shadow-2xs">
                  <div className="flex items-start gap-4">
                    <img
                      src={chosenPerson.avatar}
                      alt={chosenPerson.name}
                      className="w-14 h-14 rounded-xl object-cover border border-[#ddbfc6]"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-[#620032]">{chosenPerson.name}</h3>
                      <p className="text-xs text-[#574147] font-['JetBrains_Mono'] uppercase">
                        {chosenPerson.company}
                      </p>
                      <div className="mt-3 flex gap-6 font-['JetBrains_Mono']">
                        <div>
                          <p className="text-[10px] text-[#574147] uppercase font-bold">Credit Score</p>
                          <p className="text-sm font-bold text-[#1e1b17]">{chosenPerson.creditScore}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#574147] uppercase font-bold">Active Loans</p>
                          <p className="text-sm font-bold text-[#1e1b17]">{chosenPerson.activeLoans}</p>
                        </div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[#620032] text-2xl">check_circle</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: FINANCIALS */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
              <div className="space-y-1.5">
                <label className="font-['JetBrains_Mono'] text-xs uppercase text-[#574147] font-semibold block">
                  Principal Amount ($)
                </label>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
                  className="font-['JetBrains_Mono'] w-full h-11 bg-white border border-[#ddbfc6] rounded-lg px-4 font-semibold text-[#1e1b17] focus:border-[#620032] focus:ring-1 focus:ring-[#620032] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-['JetBrains_Mono'] text-xs uppercase text-[#574147] font-semibold block">
                  Interest Rate (% p.a.)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                  className="font-['JetBrains_Mono'] w-full h-11 bg-white border border-[#ddbfc6] rounded-lg px-4 font-semibold text-[#1e1b17] focus:border-[#620032] focus:ring-1 focus:ring-[#620032] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-['JetBrains_Mono'] text-xs uppercase text-[#574147] font-semibold block">
                  Disbursement Date
                </label>
                <input
                  type="date"
                  value={disbursementDate}
                  onChange={(e) => setDisbursementDate(e.target.value)}
                  className="w-full h-11 bg-white border border-[#ddbfc6] rounded-lg px-4 text-sm focus:border-[#620032] focus:ring-1 focus:ring-[#620032] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-['JetBrains_Mono'] text-xs uppercase text-[#574147] font-semibold block">
                  Term Duration (Months)
                </label>
                <select
                  value={termMonths}
                  onChange={(e) => setTermMonths(parseInt(e.target.value) || 12)}
                  className="w-full h-11 bg-white border border-[#ddbfc6] rounded-lg px-4 text-sm focus:border-[#620032] focus:ring-1 focus:ring-[#620032] outline-none"
                >
                  <option value={12}>12 Months</option>
                  <option value={24}>24 Months</option>
                  <option value={36}>36 Months</option>
                  <option value={48}>48 Months</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW */}
          {currentStep === 3 && (
            <div className="border border-[#ddbfc6] rounded-xl divide-y divide-[#ddbfc6] bg-[#faf2ec] shadow-2xs animate-fade-in">
              <div className="p-5 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-[#574147] font-['JetBrains_Mono'] uppercase font-bold">
                    Borrower
                  </p>
                  <p className="font-bold text-lg text-[#1e1b17]">{chosenPerson?.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-[#620032] font-['JetBrains_Mono'] font-bold hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="p-5 grid grid-cols-3 gap-4 font-['JetBrains_Mono']">
                <div>
                  <p className="text-[10px] text-[#574147] uppercase font-bold">Principal</p>
                  <p className="text-base font-bold text-[#620032]">${principal.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#574147] uppercase font-bold">Rate</p>
                  <p className="text-base font-bold text-[#620032]">{rate}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#574147] uppercase font-bold">Term</p>
                  <p className="text-base font-bold text-[#620032]">{termMonths} Mos</p>
                </div>
              </div>

              <div className="p-5 bg-[#efe7e0]">
                <p className="text-[10px] text-[#574147] font-['JetBrains_Mono'] uppercase font-bold mb-1">
                  Total Repayment Estimate
                </p>
                <p className="font-['JetBrains_Mono'] text-3xl font-bold text-[#620032]">
                  ${totalRepayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}

          {/* Wizard Actions */}
          <div className="flex justify-between items-center pt-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="h-11 px-6 border border-[#ddbfc6] text-[#1e1b17] font-bold text-xs font-['JetBrains_Mono'] rounded-lg hover:bg-[#efe7e0] transition-colors"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="h-11 px-6 border border-[#ddbfc6] text-[#574147] font-bold text-xs font-['JetBrains_Mono'] rounded-lg hover:bg-[#efe7e0] transition-colors"
              >
                Cancel
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="h-11 px-8 bg-[#8b004a] text-white font-bold text-xs font-['JetBrains_Mono'] rounded-lg hover:bg-[#620032] transition-all active:scale-95 shadow-sm"
              >
                Next: {currentStep === 1 ? 'Financials' : 'Review'}
              </button>
            ) : (
              <button
                type="submit"
                className="h-11 px-8 bg-[#8b004a] text-white font-bold text-xs font-['JetBrains_Mono'] rounded-lg hover:bg-[#620032] transition-all active:scale-95 shadow-md"
              >
                Finalize Disbursement
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Right Column: Live Projection Sidebar */}
      <aside className="w-full lg:w-[380px] space-y-5">
        <div className="bg-[#fff8f3] border border-[#ddbfc6] rounded-2xl p-6 shadow-2xs sticky top-20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg text-[#1e1b17]">Live Projection</h2>
            <span className="material-symbols-outlined text-[#620032]">trending_up</span>
          </div>

          {/* Projection Graph Placeholder Bars */}
          <div className="h-40 w-full bg-[#faf2ec] border border-[#ddbfc6] rounded-lg p-3 flex items-end gap-1.5 overflow-hidden">
            {[20, 28, 38, 50, 68, 85, 100].map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-xs transition-all ${
                  i === 6 ? 'bg-[#8b004a]' : 'bg-[#ffd9e2] hover:bg-[#620032]'
                }`}
                style={{ height: `${h}%` }}
                title={`Period ${i + 1}`}
              />
            ))}
          </div>

          <div className="mt-6 space-y-3 font-['JetBrains_Mono'] text-xs">
            <div className="flex justify-between items-center border-b border-[#ddbfc6] pb-2">
              <span className="text-[#574147]">Accrued Interest</span>
              <span className="text-[#1e1b17] font-bold text-sm">
                ${totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-[#ddbfc6] pb-2">
              <span className="text-[#574147]">Annual Yield</span>
              <span className="text-[#1e1b17] font-bold text-sm">{rate}%</span>
            </div>

            <div className="flex justify-between items-center border-b border-[#ddbfc6] pb-2">
              <span className="text-[#574147]">Monthly Cashflow</span>
              <span className="text-[#1e1b17] font-bold text-sm">
                ${monthlyCashflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="mt-6 p-3.5 rounded-lg bg-[#efe7e0] border border-[#ddbfc6]">
            <div className="flex gap-2.5">
              <span className="material-symbols-outlined text-[#620032] text-lg">info</span>
              <p className="text-xs leading-relaxed text-[#574147]">
                Calculations are based on <strong>Simple Interest</strong> applied monthly across the full term.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Check Widget */}
        <div className="p-5 rounded-2xl border border-dashed border-[#ddbfc6] bg-[#faf2ec]/60">
          <h4 className="font-['JetBrains_Mono'] text-xs uppercase font-bold text-[#574147] mb-1">
            Policy Check
          </h4>
          <p className="text-xs text-[#574147] leading-relaxed">
            Loans exceeding $200,000 threshold require partner sign-off prior to wire disbursement.
          </p>
        </div>
      </aside>
    </div>
  );
};
