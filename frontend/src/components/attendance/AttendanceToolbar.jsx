import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, Search, Filter, Plus, ShieldAlert } from 'lucide-react';

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
  isAdmin = false,
  totalRecordsCount = 0,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Title & Navigation Controls (<- Date ->) */}
        <div className="flex items-center flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onPreviousDate}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              title="Previous Day"
              aria-label="Previous Day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={onNextDate}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              title="Next Day"
              aria-label="Next Day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Month Picker / Display */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 font-semibold text-sm">
            <Calendar className="w-4 h-4 text-purple-600" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="bg-transparent border-none text-sm font-semibold text-gray-900 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Selected Date Tag */}
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
            {currentDate}
          </span>
        </div>

        {/* Right: Search, Filter, & Admin Override Punch Action */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[200px] sm:w-60">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search attendance..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="pl-3 pr-8 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">🟢 Present</option>
              <option value="ON_LEAVE">✈️ On Leave</option>
              <option value="ABSENT">🟡 Absent</option>
              <option value="HALF_DAY">🟠 Half Day</option>
            </select>
          </div>

          {/* Admin Punch Override Modal Trigger */}
          {isAdmin && (
            <button
              onClick={onOpenOverrideModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-sm font-semibold shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              <span>Override Punch</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
