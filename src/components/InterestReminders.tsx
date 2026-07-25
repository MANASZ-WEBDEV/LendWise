import React from 'react';
import { Link } from 'react-router-dom';
import { PersonSummary } from '../types';
import { getQuarterlyStatus } from '../lib/quarterly-utils';
import { formatINR } from '../lib/currency';

interface InterestRemindersProps {
  summaries: PersonSummary[];
}

export interface ReminderItem {
  person: PersonSummary['person'];
  balanceId: string;
  daysSince: number;
  daysUntil: number;
  isOverdue: boolean;
  isDueSoon: boolean; // 88 or 89 days
  accruedInterest: number;
  principal: number;
}

export const getQuarterlyReminders = (summaries: PersonSummary[]): ReminderItem[] => {
  const reminders: ReminderItem[] = [];

  for (const s of summaries) {
    const lentBal = s.balances.find(b => b.balance.direction === 'lent' && b.balance.principal > 0);
    if (!lentBal) continue;

    const initialTxn = lentBal.transactions.find(t => t.type === 'loan');
    const initialDate = initialTxn ? initialTxn.date : lentBal.balance.created_at.split('T')[0];

    const status = getQuarterlyStatus(lentBal.transactions, initialDate);

    // Alert if 88 or more days have elapsed (2 days before 90 days, or past 90 days)
    if (status.daysSinceLastCollection >= 88) {
      reminders.push({
        person: s.person,
        balanceId: lentBal.balance.id,
        daysSince: status.daysSinceLastCollection,
        daysUntil: status.daysUntilAvailable,
        isOverdue: status.daysSinceLastCollection >= 90,
        isDueSoon: status.daysSinceLastCollection >= 88 && status.daysSinceLastCollection < 90,
        accruedInterest: lentBal.liveAccruedInterest,
        principal: lentBal.balance.principal,
      });
    }
  }

  return reminders.sort((a, b) => b.daysSince - a.daysSince);
};

export const InterestReminders: React.FC<InterestRemindersProps> = ({ summaries }) => {
  const reminders = getQuarterlyReminders(summaries);

  if (reminders.length === 0) return null;

  const overdueCount = reminders.filter(r => r.isOverdue).length;

  return (
    <div className="bg-[#fff8f3] border-2 border-[#8b004a]/40 rounded-xl p-4 sm:p-5 shadow-md space-y-4 font-['Inter']">
      <div className="flex items-center justify-between border-b border-[#ddbfc6] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#8b004a] text-white flex items-center justify-center font-['JetBrains_Mono']">
            <span className="material-symbols-outlined text-xl">notifications_active</span>
          </div>
          <div>
            <h3 className="font-bold text-base text-[#1e1b17] flex items-center gap-2">
              Quarterly Interest Reminders
              <span className="bg-[#8b004a] text-white text-xs px-2 py-0.5 rounded-full font-['JetBrains_Mono'] font-bold">
                {reminders.length}
              </span>
            </h3>
            <p className="text-xs text-[#574147] font-['JetBrains_Mono']">
              {overdueCount > 0
                ? `${overdueCount} contact(s) reached 3-month interest payment threshold!`
                : 'Upcoming 3-month interest payments due in 1-2 days.'}
            </p>
          </div>
        </div>
      </div>

      {/* Reminder Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {reminders.map((item) => (
          <div
            key={item.person.id}
            className={`p-3.5 rounded-lg border flex flex-col justify-between gap-3 ${
              item.isOverdue
                ? 'bg-[#ffd9e2]/40 border-[#ba1a1a]/30'
                : 'bg-[#fff8f3] border-[#ddbfc6]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-sm text-[#1e1b17]">
                    {item.person.name}
                  </span>
                  {item.person.is_wm && (
                    <sup className="text-[10px] font-['JetBrains_Mono'] font-bold text-[#8b004a] bg-[#ffd9e2] px-1 py-0.5 rounded">
                      WM
                    </sup>
                  )}
                </div>

                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`inline-block text-[11px] font-['JetBrains_Mono'] font-bold px-2 py-0.5 rounded ${
                      item.isOverdue
                        ? 'bg-[#ba1a1a] text-white'
                        : 'bg-[#8b004a] text-white'
                    }`}
                  >
                    {item.isOverdue
                      ? `Overdue (${item.daysSince} days)`
                      : `Due in ${item.daysUntil} day${item.daysUntil === 1 ? '' : 's'}`}
                  </span>
                  <span className="text-xs font-['JetBrains_Mono'] text-[#620032] font-bold">
                    {formatINR(item.accruedInterest)}
                  </span>
                </div>
              </div>

              {/* Call button if phone exists */}
              {item.person.phone && (
                <a
                  href={`tel:${item.person.phone}`}
                  className="px-2.5 py-1 bg-[#8b004a] text-white text-xs font-['JetBrains_Mono'] font-bold rounded hover:bg-[#620032] transition-colors flex items-center gap-1 shrink-0"
                  title={`Call ${item.person.name}`}
                >
                  <span className="material-symbols-outlined text-sm">phone_in_talk</span>
                  Call
                </a>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#ddbfc6]/40 text-xs">
              <span className="text-[#574147] font-['JetBrains_Mono'] text-[11px]">
                Principal: {formatINR(item.principal)}
              </span>
              <Link
                to={`/person/${item.person.id}`}
                className="text-[#620032] font-['JetBrains_Mono'] font-bold hover:underline flex items-center gap-0.5 text-xs"
              >
                Swipe & Collect <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
