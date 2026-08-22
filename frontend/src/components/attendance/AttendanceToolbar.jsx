import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, Search, SlidersHorizontal, Plus } from 'lucide-react';

export default function AttendanceToolbar({
  currentDate,
  onPreviousDate,
  onNextDate,
  selectedMonth,
  onMonthChange,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onOpenOverrideModal,
  isAdmin,
  totalRecordsCount,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 space-y-3 sm:space-y-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Date Stepper & Month Picker */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Day Stepper */}
          <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-xl p-0.5">
            <button
              onClick={onPreviousDate}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white transition-all"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 select-none">
              {currentDate}
            </span>
            <button
              onClick={onNextDate}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white transition-all"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Right: Search, Filter, & Admin Override Button */}
        <div className="flex items-center flex-wrap gap-2.5">
          {isAdmin && (
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search employee..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/40"
              />
            </div>
          )}

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/40 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="ABSENT">Absent</option>
            <option value="OVERRIDDEN">Overridden</option>
          </select>

          {isAdmin && (
            <button
              onClick={onOpenOverrideModal}
              className="px-3.5 py-1.5 rounded-xl bg-[#714B67] hover:bg-[#5a3b52] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Punch Override</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
