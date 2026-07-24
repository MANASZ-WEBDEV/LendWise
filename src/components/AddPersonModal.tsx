import React, { useState } from 'react';
import { Person } from '../types';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPerson: (newPerson: Person) => void;
}

export const AddPersonModal: React.FC<AddPersonModalProps> = ({
  isOpen,
  onClose,
  onAddPerson,
}) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [relationship, setRelationship] = useState<'OWES_ME' | 'I_OWE_THEM'>('OWES_ME');
  const [category, setCategory] = useState<'Personal' | 'Venture Debt' | 'Bridge Financing' | 'Corporate'>('Personal');
  const [principal, setPrincipal] = useState<string>('50000');
  const [interestRate, setInterestRate] = useState<string>('5.5');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const idNum = Math.floor(1000 + Math.random() * 9000);
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

    const created: Person = {
      id: `LW-${idNum}-${initials || 'XX'}`,
      name: name.trim(),
      company: company.trim() || 'Private Ledger Account',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80`,
      relationship,
      creditScore: 780 + Math.floor(Math.random() * 50),
      activeLoans: 1,
      principal: parseFloat(principal) || 0,
      interestRate: parseFloat(interestRate) || 0,
      liveAccrual: 0,
      accrualDays: 0,
      repaymentHistory: [20, 30, 40, 50, 60],
      status: 'Active',
      category,
      lastPaymentDate: 'Just now',
      tier: 'Standard Client',
    };

    onAddPerson(created);
    onClose();

    // Reset fields
    setName('');
    setCompany('');
    setPrincipal('50000');
    setInterestRate('5.5');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-[#fff8f3] border border-[#ddbfc6] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex justify-between items-center mb-5 border-b border-[#ddbfc6] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#ffd9e2] rounded-lg text-[#8d034b]">
              <span className="material-symbols-outlined text-xl">person_add</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1e1b17] font-['Inter']">Register New Entity</h2>
              <p className="text-xs text-[#574147]">Add a new debtor or creditor to LendWise ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#574147] hover:bg-[#faf2ec] rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="font-['JetBrains_Mono'] text-xs uppercase font-bold text-[#574147]">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marcus Vance"
              className="w-full h-11 px-4 bg-white border border-[#ddbfc6] rounded-lg text-sm focus:border-[#620032] focus:ring-1 focus:ring-[#620032] outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-['JetBrains_Mono'] text-xs uppercase font-bold text-[#574147]">
              Company / Entity Name
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Vance Capital LLC"
              className="w-full h-11 px-4 bg-white border border-[#ddbfc6] rounded-lg text-sm focus:border-[#620032] focus:ring-1 focus:ring-[#620032] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-['JetBrains_Mono'] text-xs uppercase font-bold text-[#574147]">
                Relationship
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as 'OWES_ME' | 'I_OWE_THEM')}
                className="w-full h-11 px-3 bg-white border border-[#ddbfc6] rounded-lg text-sm focus:border-[#620032] focus:ring-1 focus:ring-[#620032] outline-none cursor-pointer"
              >
                <option value="OWES_ME">Owes Me (Borrower)</option>
                <option value="I_OWE_THEM">I Owe Them (Lender)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-['JetBrains_Mono'] text-xs uppercase font-bold text-[#574147]">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-11 px-3 bg-white border border-[#ddbfc6] rounded-lg text-sm focus:border-[#620032] focus:ring-1 focus:ring-[#620032] outline-none cursor-pointer"
              >
                <option value="Personal">Personal</option>
                <option value="Corporate">Corporate</option>
                <option value="Venture Debt">Venture Debt</option>
                <option value="Bridge Financing">Bridge Financing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-['JetBrains_Mono'] text-xs uppercase font-bold text-[#574147]">
                Initial Principal ($)
              </label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="w-full h-11 px-4 bg-white border border-[#ddbfc6] rounded-lg text-sm font-['JetBrains_Mono'] focus:border-[#620032] focus:ring-1 focus:ring-[#620032] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-['JetBrains_Mono'] text-xs uppercase font-bold text-[#574147]">
                Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full h-11 px-4 bg-white border border-[#ddbfc6] rounded-lg text-sm font-['JetBrains_Mono'] focus:border-[#620032] focus:ring-1 focus:ring-[#620032] outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#ddbfc6]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-[#ddbfc6] font-['JetBrains_Mono'] text-xs font-bold text-[#574147] hover:bg-[#faf2ec]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#8b004a] text-white font-['JetBrains_Mono'] text-xs font-bold hover:bg-[#620032] transition-all shadow-sm active:scale-95"
            >
              Create Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
