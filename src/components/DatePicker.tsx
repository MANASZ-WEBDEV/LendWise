import React, { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  value: string; // 'YYYY-MM-DD'
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

type View = 'calendar' | 'months' | 'years';

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getDate();
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  required,
  className = '',
  placeholder = 'Select date',
}) => {
  const today = new Date();
  const parsedValue = value ? new Date(value + 'T00:00:00') : null;

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>('calendar');
  const [viewYear, setViewYear] = useState(parsedValue?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedValue?.getMonth() ?? today.getMonth());
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null);
  const [yearRangeStart, setYearRangeStart] = useState(Math.floor((parsedValue?.getFullYear() ?? today.getFullYear()) / 12) * 12);

  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Sync internal state when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
        setYearRangeStart(Math.floor(d.getFullYear() / 12) * 12);
      }
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setView('calendar');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Clear slide animation
  useEffect(() => {
    if (slideDir) {
      const timer = setTimeout(() => setSlideDir(null), 250);
      return () => clearTimeout(timer);
    }
  }, [slideDir, viewMonth, viewYear]);

  const selectedYear = parsedValue?.getFullYear();
  const selectedMonth = parsedValue?.getMonth();
  const selectedDay = parsedValue?.getDate();

  const goToPrevMonth = () => {
    setSlideDir('right');
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    setSlideDir('left');
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const selectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${viewYear}-${mm}-${dd}`);
    setIsOpen(false);
    setView('calendar');
  };

  const selectMonth = (month: number) => {
    setViewMonth(month);
    setView('calendar');
  };

  const selectYear = (year: number) => {
    setViewYear(year);
    setView('months');
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  // Build calendar grid
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const isSelected = (day: number) =>
    day === selectedDay && viewMonth === selectedMonth && viewYear === selectedYear;

  const slideClass = slideDir === 'left'
    ? 'animate-slideLeft'
    : slideDir === 'right'
      ? 'animate-slideRight'
      : '';

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setView('calendar'); }}
        className={`w-full h-11 px-4 bg-[#fff8f3] border border-[#ddbfc6] rounded-lg text-sm font-['Inter'] focus:border-[#620032] outline-none text-left flex items-center justify-between transition-colors hover:border-[#b8879a] ${className}`}
      >
        <span className={value ? 'text-[#1e1b17]' : 'text-[#8a7077]'}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <span className="material-symbols-outlined text-lg text-[#8a7077]">calendar_month</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={calendarRef}
          className="absolute z-50 mt-1.5 bg-white border border-[#ddbfc6] rounded-xl shadow-lg w-[300px] overflow-hidden"
          style={{
            animation: 'fadeScaleIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#efe7e0] bg-[#faf2ec]">
            <button
              type="button"
              onClick={() => {
                if (view === 'calendar') goToPrevMonth();
                else if (view === 'years') setYearRangeStart(s => s - 12);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#ffd9e2] text-[#620032] transition-colors active:scale-90"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (view === 'calendar') setView('months');
                else if (view === 'months') setView('years');
                else setView('calendar');
              }}
              className="px-3 py-1 rounded-lg hover:bg-[#ffd9e2] transition-colors font-['JetBrains_Mono'] text-xs font-bold text-[#620032]"
            >
              {view === 'calendar' && `${MONTH_FULL[viewMonth]} ${viewYear}`}
              {view === 'months' && `${viewYear}`}
              {view === 'years' && `${yearRangeStart} — ${yearRangeStart + 11}`}
            </button>

            <button
              type="button"
              onClick={() => {
                if (view === 'calendar') goToNextMonth();
                else if (view === 'years') setYearRangeStart(s => s + 12);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#ffd9e2] text-[#620032] transition-colors active:scale-90"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>

          {/* Calendar View */}
          {view === 'calendar' && (
            <div className={`p-3 ${slideClass}`}>
              {/* Day Labels */}
              <div className="grid grid-cols-7 mb-1">
                {DAY_LABELS.map(d => (
                  <div key={d} className="text-center text-[10px] font-['JetBrains_Mono'] font-bold text-[#8a7077] py-1">{d}</div>
                ))}
              </div>
              {/* Day Grid */}
              <div className="grid grid-cols-7 gap-0.5">
                {calendarDays.map((day, idx) => (
                  <div key={idx} className="flex items-center justify-center">
                    {day ? (
                      <button
                        type="button"
                        onClick={() => selectDay(day)}
                        className={`w-9 h-9 rounded-lg text-xs font-['JetBrains_Mono'] font-semibold transition-all duration-150 active:scale-90 ${
                          isSelected(day)
                            ? 'bg-[#8b004a] text-white shadow-md scale-105'
                            : isToday(day)
                              ? 'bg-[#ffd9e2] text-[#8b004a] font-bold ring-1 ring-[#8b004a]/30'
                              : 'text-[#1e1b17] hover:bg-[#faf2ec]'
                        }`}
                      >
                        {day}
                      </button>
                    ) : (
                      <div className="w-9 h-9" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Months View */}
          {view === 'months' && (
            <div className="p-3 grid grid-cols-3 gap-2" style={{ animation: 'fadeScaleIn 0.15s ease-out' }}>
              {MONTH_NAMES.map((m, idx) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => selectMonth(idx)}
                  className={`py-2.5 rounded-lg text-xs font-['JetBrains_Mono'] font-bold transition-all duration-150 active:scale-90 ${
                    idx === viewMonth && viewYear === selectedYear
                      ? 'bg-[#8b004a] text-white shadow-md'
                      : idx === today.getMonth() && viewYear === today.getFullYear()
                        ? 'bg-[#ffd9e2] text-[#8b004a] ring-1 ring-[#8b004a]/30'
                        : 'text-[#574147] hover:bg-[#faf2ec]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          {/* Years View */}
          {view === 'years' && (
            <div className="p-3 grid grid-cols-3 gap-2" style={{ animation: 'fadeScaleIn 0.15s ease-out' }}>
              {Array.from({ length: 12 }, (_, i) => yearRangeStart + i).map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => selectYear(y)}
                  className={`py-2.5 rounded-lg text-xs font-['JetBrains_Mono'] font-bold transition-all duration-150 active:scale-90 ${
                    y === viewYear
                      ? 'bg-[#8b004a] text-white shadow-md'
                      : y === today.getFullYear()
                        ? 'bg-[#ffd9e2] text-[#8b004a] ring-1 ring-[#8b004a]/30'
                        : 'text-[#574147] hover:bg-[#faf2ec]'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-[#efe7e0] bg-[#faf2ec]">
            <button
              type="button"
              onClick={() => {
                const t = new Date();
                const mm = String(t.getMonth() + 1).padStart(2, '0');
                const dd = String(t.getDate()).padStart(2, '0');
                onChange(`${t.getFullYear()}-${mm}-${dd}`);
                setViewYear(t.getFullYear());
                setViewMonth(t.getMonth());
                setIsOpen(false);
                setView('calendar');
              }}
              className="text-[11px] font-['JetBrains_Mono'] font-bold text-[#8b004a] hover:underline"
            >
              Today
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                  setView('calendar');
                }}
                className="text-[11px] font-['JetBrains_Mono'] font-bold text-[#8a7077] hover:text-red-600 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
