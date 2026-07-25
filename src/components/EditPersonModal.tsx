import React, { useState, useEffect } from 'react';
import { updatePerson } from '../lib/supabase-queries';
import { DbPerson } from '../types';
import { toast } from 'sonner';

interface EditPersonModalProps {
  isOpen: boolean;
  person: DbPerson | null;
  onClose: () => void;
  onPersonUpdated: () => void;
}

export const EditPersonModal: React.FC<EditPersonModalProps> = ({
  isOpen,
  person,
  onClose,
  onPersonUpdated,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isWm, setIsWm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sync form state when person changes or modal opens
  useEffect(() => {
    if (person && isOpen) {
      setName(person.name);
      setPhone(person.phone || '');
      setNotes(person.notes || '');
      setIsWm(person.is_wm);
    }
  }, [person, isOpen]);

  if (!isOpen || !person) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setSubmitting(true);
    try {
      await updatePerson(person.id, {
        name: name.trim(),
        phone: phone.trim(),
        notes: notes.trim(),
        is_wm: isWm,
      });
      toast.success(`Contact ${name.trim()} updated successfully!`);
      onPersonUpdated();
      onClose();
    } catch (err: any) {
      toast.error('Failed to update contact: ' + (err.message || 'Unknown error'));
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
              <span className="material-symbols-outlined text-xl">edit</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1e1b17]">Edit Details</h2>
              <p className="text-xs text-[#574147]">Update contact information</p>
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
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
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
              placeholder="e.g. Friend from college, etc."
              className="w-full p-3 bg-white border border-[#ddbfc6] rounded-lg text-sm focus:border-[#620032] focus:ring-1 focus:ring-[#620032] outline-none"
            />
          </div>

          {/* WM Toggle */}
          <div className="flex items-center gap-3 p-3 bg-[#faf2ec] rounded-lg border border-[#ddbfc6]/50">
            <button
              type="button"
              onClick={() => setIsWm(!isWm)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                isWm ? 'bg-[#8b004a]' : 'bg-[#ddbfc6]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  isWm ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <div>
              <span className="text-sm font-semibold text-[#1e1b17] block">
                Mark as WM
              </span>
              <span className="text-[11px] text-[#574147]">
                Displays as Name<sup className="text-[#8b004a] font-bold">WM</sup> badge
              </span>
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
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-[#8b004a] text-white font-['JetBrains_Mono'] text-xs font-bold hover:bg-[#620032] transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Update Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
