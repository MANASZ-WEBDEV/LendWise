import React, { useState } from 'react';
import { Person, ViewMode } from '../types';

interface PeopleViewProps {
  people: Person[];
  onSelectPerson: (person: Person) => void;
  onOpenAddModal: () => void;
  searchQuery: string;
}

export const PeopleView: React.FC<PeopleViewProps> = ({
  people,
  onSelectPerson,
  onOpenAddModal,
  searchQuery: initialSearch,
}) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'OWES_ME' | 'I_OWE_THEM'>('ALL');
  const [localSearch, setLocalSearch] = useState(initialSearch);

  const filteredPeople = people.filter((p) => {
    // Relationship tab filter
    if (filterTab === 'OWES_ME' && p.relationship !== 'OWES_ME') return false;
    if (filterTab === 'I_OWE_THEM' && p.relationship !== 'I_OWE_THEM') return false;

    // Search query filter
    const query = localSearch.toLowerCase();
    if (!query) return true;
    return (
      p.name.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query) ||
      p.company.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#620032] font-['Inter'] tracking-tight">
            People Directory
          </h1>
          <p className="text-[#574147] text-base mt-1">
            Manage and track all private lending relationships across your ledger.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-2 bg-[#8b004a] text-white px-6 py-3 rounded-lg font-['JetBrains_Mono'] text-sm font-bold hover:bg-[#620032] transition-all active:scale-95 shadow-md self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          Add Person
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-[#f4ece6] rounded-xl border border-[#ddbfc6]">
        <div className="flex bg-white/70 p-1 rounded-lg border border-[#ddbfc6]/60 shadow-2xs">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-4 py-1.5 rounded-md font-['JetBrains_Mono'] text-xs font-semibold transition-all ${
              filterTab === 'ALL'
                ? 'bg-[#620032] text-white shadow-xs'
                : 'text-[#574147] hover:bg-[#efe7e0]'
            }`}
          >
            All Contacts
          </button>
          <button
            onClick={() => setFilterTab('OWES_ME')}
            className={`px-4 py-1.5 rounded-md font-['JetBrains_Mono'] text-xs font-semibold transition-all ${
              filterTab === 'OWES_ME'
                ? 'bg-[#620032] text-white shadow-xs'
                : 'text-[#574147] hover:bg-[#efe7e0]'
            }`}
          >
            Owes Me
          </button>
          <button
            onClick={() => setFilterTab('I_OWE_THEM')}
            className={`px-4 py-1.5 rounded-md font-['JetBrains_Mono'] text-xs font-semibold transition-all ${
              filterTab === 'I_OWE_THEM'
                ? 'bg-[#620032] text-white shadow-xs'
                : 'text-[#574147] hover:bg-[#efe7e0]'
            }`}
          >
            I Owe Them
          </button>
        </div>

        <div className="h-6 w-px bg-[#ddbfc6] hidden md:block mx-1"></div>

        <div className="relative flex-1 min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#574147] text-lg">
            search
          </span>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by name, company, category, or ID..."
            className="w-full bg-white border border-[#ddbfc6] rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-[#620032]/20 focus:border-[#620032] outline-none transition-all text-sm font-['Inter']"
          />
        </div>
      </div>

      {/* Bento Grid of People */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPeople.map((person) => (
          <div
            key={person.id}
            onClick={() => onSelectPerson(person)}
            className="bg-[#ffffff] border border-[#ddbfc6] p-6 rounded-xl hover:border-[#620032]/60 transition-all cursor-pointer group flex flex-col justify-between shadow-2xs hover:shadow-md"
          >
            <div>
              {/* Card Top Header */}
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-full border border-[#ddbfc6] overflow-hidden flex-shrink-0">
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#1e1b17] group-hover:text-[#620032] transition-colors leading-tight">
                      {person.name}
                    </h3>
                    <p className="text-xs text-[#574147] font-['JetBrains_Mono'] mt-0.5">
                      ID: {person.id}
                    </p>
                    <p className="text-[11px] text-[#8a7077] truncate max-w-[150px]">{person.company}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold font-['JetBrains_Mono'] px-2 py-0.5 rounded uppercase tracking-wider ${
                    person.relationship === 'OWES_ME'
                      ? 'bg-[#ffd9e2] text-[#620032]'
                      : 'bg-[#e5e2da] text-[#5f5e58]'
                  }`}
                >
                  {person.relationship === 'OWES_ME' ? 'Owes Me' : 'I Owe'}
                </span>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3 bg-[#faf2ec] rounded-lg border border-[#ddbfc6]/40">
                  <span className="text-[10px] font-bold font-['JetBrains_Mono'] text-[#574147] uppercase block mb-0.5">
                    Principal
                  </span>
                  <span className="font-['JetBrains_Mono'] text-base font-bold text-[#1e1b17]">
                    ${person.principal.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-[#faf2ec] rounded-lg border border-[#ddbfc6]/40">
                  <span className="text-[10px] font-bold font-['JetBrains_Mono'] text-[#574147] uppercase block mb-0.5">
                    Interest
                  </span>
                  <span className="font-['JetBrains_Mono'] text-base font-bold text-[#620032]">
                    ${person.liveAccrual.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Repayment History Sparkline Bar Footer */}
            <div className="flex items-end justify-between border-t border-[#ddbfc6]/50 pt-4 mt-2">
              <div>
                <span className="text-[10px] font-bold font-['JetBrains_Mono'] text-[#574147] uppercase block mb-1.5">
                  Repayment History
                </span>
                <div className="h-8 flex items-end gap-1">
                  {person.repaymentHistory.map((h, i) => (
                    <div
                      key={i}
                      className={`w-2 rounded-t-xs transition-all ${
                        person.relationship === 'OWES_ME'
                          ? i === person.repaymentHistory.length - 1
                            ? 'bg-[#620032]'
                            : 'bg-[#ffb0c9]'
                          : i === person.repaymentHistory.length - 1
                          ? 'bg-[#5f5e58]'
                          : 'bg-[#c9c6bf]'
                      }`}
                      style={{ height: `${Math.max(15, h)}%` }}
                      title={`Period ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              <button className="w-9 h-9 rounded-full flex items-center justify-center border border-[#ddbfc6] text-[#574147] group-hover:bg-[#620032] group-hover:text-white group-hover:border-[#620032] transition-all">
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        ))}

        {/* Add New Entity Card */}
        <div
          onClick={onOpenAddModal}
          className="bg-[#faf2ec]/50 border-2 border-dashed border-[#ddbfc6] p-6 rounded-xl flex flex-col items-center justify-center text-center hover:bg-[#faf2ec] hover:border-[#620032] transition-all cursor-pointer group py-12 min-h-[260px]"
        >
          <div className="w-14 h-14 rounded-full bg-[#fff8f3] border border-[#ddbfc6] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-2xs">
            <span className="material-symbols-outlined text-[#620032] text-2xl">add</span>
          </div>
          <h3 className="font-bold text-[#1e1b17] text-lg mb-1">Add New Entity</h3>
          <p className="text-xs text-[#574147] max-w-[200px] font-['JetBrains_Mono']">
            Register a new borrower or lender to your private ledger.
          </p>
        </div>
      </div>
    </div>
  );
};
