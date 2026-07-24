import React, { useState } from 'react';
import { createPerson } from '../lib/supabase-queries';
import { toast } from 'sonner';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPersonAdded: () => void;
}

export const AddPersonModal: React.FC<AddPersonModalProps> = ({
  isOpen,
  onClose,
  onPersonAdded,
}) => {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    setSubmitting(true);
    try {
      await createPerson(name, notes);
      toast.success(`Contact ${name.trim()} added successfully!`);
      setName('');
      setNotes('');
      onPersonAdded();
      onClose();
    } catch (err: any) {
      toast.error('Failed to add contact: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-['Inter']">
      <div className="bg-[#fff8f3] border border-[#ddbfc6] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex justify-between items-center mb-5 border-b border-[#ddbfc6] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#ffd9e2] rounded-lg text-[#8d034b]">
              <span className="material-symbols-outlined text-xl">person_add</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1e1b17]">Add Person</h2>
              <p className="text-xs text-[#574147]">Add a contact to your private ledger</p>
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
              placeholder="e.g. Ramesh Kumar"
              className="w-full h-11 px-4 bg-white border border-[#ddbfc6] rounded-lg text-sm focus:border-[#620032] focus:ring-1 focus:ring-[#620032] outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-['JetBrains_Mono'] text-xs uppercase font-bold text-[#574147]">
              Notes / Context (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Friend from college, phone number, etc."
              className="w-full p-3 bg-white border border-[#ddbfc6] rounded-lg text-sm focus:border-[#620032] focus:ring-1 focus:ring-[#620032] outline-none"
            />
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
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-[#8b004a] text-white font-['JetBrains_Mono'] text-xs font-bold hover:bg-[#620032] transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Person'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
