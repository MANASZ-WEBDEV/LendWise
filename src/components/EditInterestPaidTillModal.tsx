import React, { useState, useEffect } from 'react';
import { updateBalanceInterestPaidTill } from '../lib/supabase-queries';
import { toast } from 'sonner';

interface EditInterestPaidTillModalProps {
  isOpen: boolean;
  balanceId: string | null;
  currentDate: string;
  onClose: () => void;
  onUpdated: () => void;
}

export const EditInterestPaidTillModal: React.FC<EditInterestPaidTillModalProps> = ({
  isOpen,
  balanceId,
  currentDate,
  onClose,
  onUpdated,
}) => {
  const [date, setDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDate(currentDate || new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, currentDate]);

  if (!isOpen || !balanceId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error('Please select a date');
      return;
    }

    setSubmitting(true);
    try {
      await updateBalanceInterestPaidTill(balanceId, date);
      toast.success(`Interest Paid Till date updated to ${date}`);
      onUpdated();
      onClose();
    } catch (err: any) {
      toast.error('Failed to update date: ' + (err.message || 'Unknown error'));
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
              <span className="material-symbols-outlined text-xl">event</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1e1b17]">Edit Interest Paid Till Date</h2>
              <p className="text-xs text-[#574147]">Set the date up to which interest is settled</p>
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
              Interest Paid Up To Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-11 px-4 bg-white border border-[#ddbfc6] rounded-lg text-sm focus:border-[#620032] focus:ring-1 focus:ring-[#620032] outline-none font-['JetBrains_Mono']"
            />
          </div>

          <p className="text-xs text-[#574147] font-['JetBrains_Mono'] bg-[#faf2ec] p-3 rounded-lg border border-[#ddbfc6]/40">
            ℹ️ Updating this date will reset the 90-day quarterly interest counter from this date forward.
          </p>

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
              {submitting ? 'Saving...' : 'Update Date'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
