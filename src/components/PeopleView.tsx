import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPeople, fetchArchivedPeople, fetchPersonSummary, archivePerson, unarchivePerson } from '../lib/supabase-queries';
import { PersonSummary } from '../types';
import { formatINR } from '../lib/currency';
import { AddPersonModal } from './AddPersonModal';
import { toast } from 'sonner';

export const PeopleView: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<PersonSummary[]>([]);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'OWES_ME' | 'I_OWE_THEM' | 'ARCHIVED'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [filterTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const people = filterTab === 'ARCHIVED' ? await fetchArchivedPeople() : await fetchPeople();
      const loaded: PersonSummary[] = [];

      for (const p of people) {
        const s = await fetchPersonSummary(p);
        loaded.push(s);
      }

      setSummaries(loaded);
    } catch (err: any) {
      toast.error('Failed to load contacts: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (e: React.MouseEvent, personId: string, name: string) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to archive ${name}?`)) return;

    try {
      await archivePerson(personId);
      toast.success(`Archived ${name}`);
      loadData();
    } catch (err: any) {
      toast.error('Failed to archive: ' + (err.message || 'Unknown error'));
    }
  };

  const handleUnarchive = async (e: React.MouseEvent, personId: string, name: string) => {
    e.stopPropagation();

    try {
      await unarchivePerson(personId);
      toast.success(`Restored ${name} to active contacts`);
      loadData();
    } catch (err: any) {
      toast.error('Failed to restore: ' + (err.message || 'Unknown error'));
    }
  };

  const filteredSummaries = summaries.filter(s => {
    const nameMatch = s.person.name.toLowerCase().includes(search.toLowerCase());
    const notesMatch = (s.person.notes || '').toLowerCase().includes(search.toLowerCase());
    if (!nameMatch && !notesMatch) return false;

    if (filterTab === 'OWES_ME' && s.totalLentTotal <= 0) return false;
    if (filterTab === 'I_OWE_THEM' && s.totalBorrowedTotal <= 0) return false;

    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-['Inter']">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-[#620032] tracking-tight">
            People Directory
          </h1>
          <p className="text-[#574147] text-xs sm:text-sm mt-1">
            Manage contacts and track lending relationships across your private ledger.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#8b004a] text-white px-5 py-2.5 sm:py-3 rounded-lg font-['JetBrains_Mono'] text-xs sm:text-sm font-bold hover:bg-[#620032] transition-all active:scale-95 shadow-md"
        >
          <span className="material-symbols-outlined text-base sm:text-lg">person_add</span>
          Add Person
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 sm:p-4 bg-[#f4ece6] rounded-xl border border-[#ddbfc6]">
        <div className="flex bg-white/70 p-1 rounded-lg border border-[#ddbfc6]/60 shadow-2xs overflow-x-auto max-w-full flex-nowrap shrink-0 no-scrollbar">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3.5 py-1.5 rounded-md font-['JetBrains_Mono'] text-xs font-semibold whitespace-nowrap transition-all ${
              filterTab === 'ALL'
                ? 'bg-[#620032] text-white shadow-xs'
                : 'text-[#574147] hover:bg-[#efe7e0]'
            }`}
          >
            All Contacts
          </button>
          <button
            onClick={() => setFilterTab('OWES_ME')}
            className={`px-3.5 py-1.5 rounded-md font-['JetBrains_Mono'] text-xs font-semibold whitespace-nowrap transition-all ${
              filterTab === 'OWES_ME'
                ? 'bg-[#620032] text-white shadow-xs'
                : 'text-[#574147] hover:bg-[#efe7e0]'
            }`}
          >
            Owes Me
          </button>
          <button
            onClick={() => setFilterTab('I_OWE_THEM')}
            className={`px-3.5 py-1.5 rounded-md font-['JetBrains_Mono'] text-xs font-semibold whitespace-nowrap transition-all ${
              filterTab === 'I_OWE_THEM'
                ? 'bg-[#620032] text-white shadow-xs'
                : 'text-[#574147] hover:bg-[#efe7e0]'
            }`}
          >
            I Owe Them
          </button>
          <button
            onClick={() => setFilterTab('ARCHIVED')}
            className={`px-3.5 py-1.5 rounded-md font-['JetBrains_Mono'] text-xs font-semibold whitespace-nowrap transition-all ${
              filterTab === 'ARCHIVED'
                ? 'bg-[#620032] text-white shadow-xs'
                : 'text-[#574147] hover:bg-[#efe7e0]'
            }`}
          >
            Archived
          </button>
        </div>

        <div className="relative w-full lg:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#574147] text-lg">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or notes..."
            className="w-full bg-white border border-[#ddbfc6] rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-[#620032] outline-none font-['Inter']"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#620032] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-xs font-['JetBrains_Mono'] text-[#574147]">Loading contacts...</p>
        </div>
      ) : (
        /* Bento Grid of People Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSummaries.map((s) => {
            const lentBal = s.balances.find(b => b.balance.direction === 'lent');
            const borrowedBal = s.balances.find(b => b.balance.direction === 'borrowed');

            return (
              <div
                key={s.person.id}
                onClick={() => navigate(`/person/${s.person.id}`)}
                className="bg-[#ffffff] border border-[#ddbfc6] p-6 rounded-xl hover:border-[#620032]/60 transition-all cursor-pointer group flex flex-col justify-between shadow-2xs hover:shadow-md relative"
              >
                <div>
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#620032] text-white flex items-center justify-center font-['JetBrains_Mono'] text-base font-bold shadow-xs">
                        {s.person.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-[#1e1b17] group-hover:text-[#620032] transition-colors leading-tight">
                          {s.person.name}
                          {s.person.is_wm && (
                            <sup className="ml-1 text-[10px] font-['JetBrains_Mono'] font-bold text-[#8b004a] bg-[#ffd9e2] px-1 py-0.5 rounded">WM</sup>
                          )}
                        </h3>
                        {s.person.phone && (
                          <p className="text-xs text-[#574147] mt-0.5 font-['JetBrains_Mono'] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">call</span>
                            {s.person.phone}
                          </p>
                        )}
                        {s.person.notes && (
                          <p className="text-xs text-[#574147] line-clamp-1 mt-0.5 font-['Inter']">
                            {s.person.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {filterTab === 'ARCHIVED' ? (
                      <button
                        onClick={(e) => handleUnarchive(e, s.person.id, s.person.name)}
                        className="text-[#620032] hover:bg-[#ffd9e2] p-1.5 rounded transition-colors flex items-center gap-1 font-['JetBrains_Mono'] text-xs font-bold"
                        title="Restore person"
                      >
                        <span className="material-symbols-outlined text-lg">unarchive</span>
                        Restore
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleArchive(e, s.person.id, s.person.name)}
                        className="text-[#8a7077] hover:text-[#ba1a1a] p-1 rounded hover:bg-[#faf2ec] transition-colors"
                        title="Archive person"
                      >
                        <span className="material-symbols-outlined text-lg">archive</span>
                      </button>
                    )}
                  </div>

                  {/* Balance Stat Boxes */}
                  <div className="space-y-2 mt-4 font-['JetBrains_Mono'] text-xs">
                    {lentBal && (
                      <div className="p-3 bg-[#faf2ec] rounded-lg border border-[#ddbfc6]/40 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] font-bold text-[#620032] uppercase block">
                            THEY OWE YOU
                          </span>
                          <span className="text-xs text-[#574147]">
                            Rate: {lentBal.balance.current_rate}%/mo
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-sm text-[#1e1b17] block">
                            {formatINR(lentBal.totalOwed)}
                          </span>
                          <span className="text-[11px] text-[#620032]">
                            (Accrued: {formatINR(lentBal.liveAccruedInterest)})
                          </span>
                        </div>
                      </div>
                    )}

                    {borrowedBal && (
                      <div className="p-3 bg-[#e5e2da] rounded-lg border border-[#ddbfc6]/40 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] font-bold text-[#5f5e58] uppercase block">
                            YOU OWE THEM
                          </span>
                          <span className="text-xs text-[#574147]">
                            Rate: {borrowedBal.balance.current_rate}%/mo
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-sm text-[#1e1b17] block">
                            {formatINR(borrowedBal.totalOwed)}
                          </span>
                          <span className="text-[11px] text-[#5f5e58]">
                            (Accrued: {formatINR(borrowedBal.liveAccruedInterest)})
                          </span>
                        </div>
                      </div>
                    )}

                    {!lentBal && !borrowedBal && (
                      <div className="p-3 bg-[#faf2ec] rounded-lg border border-dashed border-[#ddbfc6] text-center text-[#574147]">
                        No active loan balance
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between border-t border-[#ddbfc6]/50 pt-4 mt-4">
                  <span className="text-[11px] font-['JetBrains_Mono'] text-[#574147]">
                    Click to view history & details
                  </span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center border border-[#ddbfc6] text-[#574147] group-hover:bg-[#620032] group-hover:text-white group-hover:border-[#620032] transition-all">
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add New Entity Card */}
          <div
            onClick={() => setIsModalOpen(true)}
            className="bg-[#faf2ec]/50 border-2 border-dashed border-[#ddbfc6] p-6 rounded-xl flex flex-col items-center justify-center text-center hover:bg-[#faf2ec] hover:border-[#620032] transition-all cursor-pointer group py-12 min-h-[220px]"
          >
            <div className="w-12 h-12 rounded-full bg-[#fff8f3] border border-[#ddbfc6] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-2xs">
              <span className="material-symbols-outlined text-[#620032] text-2xl">add</span>
            </div>
            <h3 className="font-bold text-[#1e1b17] text-base mb-1">Add New Person</h3>
            <p className="text-xs text-[#574147] max-w-[200px] font-['JetBrains_Mono']">
              Register a contact to track loans and interest.
            </p>
          </div>
        </div>
      )}

      {/* Add Person Modal */}
      <AddPersonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPersonAdded={loadData}
      />
    </div>
  );
};
