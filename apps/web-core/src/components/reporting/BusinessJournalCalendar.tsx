'use client';

import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Lock,
  RefreshCw,
} from 'lucide-react';

interface CalendarDayData {
  date: string;
  hasData: boolean;
  revenue: number;
  dealsWon: number;
  ticketsResolved: number;
  tasksCompleted: number;
  healthScore: number;
  status: string;
}

interface BusinessJournalCalendarProps {
  onSelectDate: (date: string) => void;
  selectedDate?: string;
}

export function BusinessJournalCalendar({
  onSelectDate,
  selectedDate,
}: BusinessJournalCalendarProps) {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 1-indexed (September = 9)
  const [calendarData, setCalendarData] = useState<CalendarDayData[]>([]);
  const [loading, setLoading] = useState(false);

  const monthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  const monthName = new Date(Date.UTC(currentYear, currentMonth - 1, 1)).toLocaleString('en-US', {
    month: 'long',
    timeZone: 'UTC',
  });

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bi/journal/calendar?month=${monthKey}`);
      if (res.ok) {
        const data = await res.json();
        setCalendarData(data);
      }
    } catch (err) {
      console.error('Failed to load calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [monthKey]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Calculate starting empty padding days (Monday = 0 ... Sunday = 6)
  const firstDayOfMonth = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
  const dayOfWeek = (firstDayOfMonth.getUTCDay() + 6) % 7; // Convert to Mon=0 .. Sun=6

  const totalMonthlyRevenue = calendarData.reduce((acc, d) => acc + (d.revenue || 0), 0);
  const totalMonthlyDeals = calendarData.reduce((acc, d) => acc + (d.dealsWon || 0), 0);
  const activeDaysCount = calendarData.filter((d) => d.hasData && (d.revenue > 0 || d.dealsWon > 0 || d.tasksCompleted > 0)).length;

  return (
    <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-6">
      {/* Calendar Header & Month Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>{monthName} {currentYear}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-slate-400 font-mono">
                {calendarData.length} Days
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive Business Journal • Click any day to inspect full hourly activity & drill down
            </p>
          </div>
        </div>

        {/* Month Summary Pills & Navigation */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="hidden md:flex items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center gap-1.5">
              <DollarSign size={13} />
              <span>${totalMonthlyRevenue.toLocaleString()}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 font-mono text-[11px]">
              {totalMonthlyDeals} Deals Won
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 font-mono text-[11px]">
              {activeDaysCount} Active Days
            </div>
          </div>

          <div className="flex items-center gap-1 bg-black/40 border border-white/[0.08] rounded-2xl p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={fetchCalendar}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-400' : ''} />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Column Headers */}
      <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
        <div className="py-1">Mon</div>
        <div className="py-1">Tue</div>
        <div className="py-1">Wed</div>
        <div className="py-1">Thu</div>
        <div className="py-1">Fri</div>
        <div className="py-1 text-slate-500">Sat</div>
        <div className="py-1 text-slate-500">Sun</div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty padding for month start */}
        {Array.from({ length: dayOfWeek }).map((_, idx) => (
          <div
            key={`pad-${idx}`}
            className="h-28 rounded-2xl bg-white/[0.01] border border-white/[0.02] opacity-20 pointer-events-none"
          />
        ))}

        {/* Days of Month */}
        {calendarData.map((day) => {
          const dayNum = parseInt(day.date.split('-')[2], 10);
          const isSelected = selectedDate === day.date;
          const isToday = day.date === new Date().toISOString().split('T')[0];
          const isLocked = day.status === 'LOCKED';
          const isFinalized = day.status === 'FINALIZED';

          return (
            <button
              key={day.date}
              onClick={() => onSelectDate(day.date)}
              className={`h-28 rounded-2xl p-2.5 text-left flex flex-col justify-between transition-all relative group cursor-pointer border ${
                isSelected
                  ? 'bg-emerald-500/15 border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400'
                  : isToday
                  ? 'bg-white/[0.07] border-white/20 hover:border-emerald-400/50'
                  : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.15]'
              }`}
            >
              {/* Day Number and Status Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-mono font-bold ${
                    isSelected
                      ? 'text-emerald-300 font-extrabold'
                      : isToday
                      ? 'text-white'
                      : 'text-slate-400 group-hover:text-white'
                  }`}
                >
                  {dayNum}
                </span>

                <div className="flex items-center gap-1">
                  {isLocked && (
                    <span title="Period Locked">
                      <Lock size={11} className="text-amber-400" />
                    </span>
                  )}
                  {isFinalized && !isLocked && (
                    <span title="Period Finalized">
                      <CheckCircle2 size={11} className="text-blue-400" />
                    </span>
                  )}
                  {day.healthScore < 85 && day.hasData && (
                    <span title={`Health score: ${day.healthScore}%`}>
                      <AlertTriangle size={11} className="text-rose-400" />
                    </span>
                  )}
                </div>
              </div>

              {/* Day Content / Metrics */}
              <div className="space-y-1">
                {day.revenue > 0 ? (
                  <div className="text-[11px] font-mono font-bold text-emerald-400 truncate">
                    +${day.revenue.toLocaleString()}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-600 font-mono">
                    {day.hasData ? '$0' : '—'}
                  </div>
                )}

                {/* Sub-metrics indicator pills */}
                <div className="flex items-center gap-1 flex-wrap">
                  {day.dealsWon > 0 && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 font-bold border border-amber-500/20">
                      {day.dealsWon}w
                    </span>
                  )}
                  {day.ticketsResolved > 0 && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-300 font-bold border border-blue-500/20">
                      {day.ticketsResolved}t
                    </span>
                  )}
                  {day.tasksCompleted > 0 && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 font-bold border border-purple-500/20">
                      {day.tasksCompleted}k
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Health Bar */}
              {day.hasData && (
                <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      day.healthScore >= 90
                        ? 'bg-emerald-400'
                        : day.healthScore >= 70
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                    }`}
                    style={{ width: `${Math.max(15, day.healthScore)}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
