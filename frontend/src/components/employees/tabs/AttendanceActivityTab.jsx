import React, { useState, useEffect, useMemo } from 'react';
import { processActivityData } from '../../../utils/attendance';
import { attendanceService } from '../../../services/attendanceService';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Info,
  CalendarDays,
  FileText,
  TrendingUp,
  MapPin,
  Loader2
} from 'lucide-react';

export default function AttendanceActivityTab({ employee, isAdmin }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [hoveredDay, setHoveredDay] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'FULL_DAY' | 'HALF_DAY' | 'LEAVE'
  const [monthFilter, setMonthFilter] = useState('ALL'); // 'ALL' | 0..11
  const [logSearchQuery, setLogSearchQuery] = useState('');
  
  const [rawLogs, setRawLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      setIsLoading(true);
      try {
        let data = [];
        if (isAdmin) {
          // fetch all and filter for this employee, or API might need an endpoint by employee id
          const all = await attendanceService.getAllAttendance();
          data = all.filter(r => String(r.employee_id) === String(employee.id));
        } else {
          // Non-admins just get their own logs
          data = await attendanceService.getMyLogs();
        }
        setRawLogs(data || []);
      } catch (err) {
        console.warn('Failed to load attendance logs:', err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (employee?.id) {
      loadLogs();
    }
  }, [employee?.id, isAdmin]);

  const activityData = useMemo(() => {
    return processActivityData(rawLogs, selectedYear);
  }, [rawLogs, selectedYear]);

  // Group days into 53 weeks for the unified attendance grid
  const weekColumns = useMemo(() => {
    const weeks = [];
    let currentWeek = [];

    const firstDayOfWeek = activityData.days[0].dayOfWeek; // 0=Sun, 1=Mon...
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }

    activityData.days.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [activityData]);

  // Compute month label positions along the grid columns
  const monthHeaderPositions = useMemo(() => {
    const months = [];
    let lastMonth = -1;

    weekColumns.forEach((week, weekIdx) => {
      const firstValidDay = week.find((d) => d !== null);
      if (firstValidDay && firstValidDay.month !== lastMonth) {
        months.push({
          monthName: firstValidDay.monthName,
          weekIdx,
        });
        lastMonth = firstValidDay.month;
      }
    });

    return months;
  }, [weekColumns]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to determine tile color styling
  const getCellColorClass = (day) => {
    if (!day) return 'opacity-0 pointer-events-none';
    if (day.status === 'FUTURE') return 'bg-slate-100 border border-slate-200/60';
    if (day.status === 'HOLIDAY') return 'bg-purple-100 text-purple-700 border border-purple-200';
    if (day.status === 'WEEKEND') return 'bg-slate-200/80 text-slate-400';

    if (statusFilter !== 'ALL' && day.status !== statusFilter) {
      return 'bg-slate-100 opacity-20';
    }

    switch (day.status) {
      case 'FULL_DAY':
        return 'bg-emerald-500 hover:bg-emerald-600 shadow-xs';
      case 'HALF_DAY':
        return 'bg-amber-400 hover:bg-amber-500 shadow-xs';
      case 'LEAVE':
      case 'ABSENT':
        return 'bg-rose-500 hover:bg-rose-600 shadow-xs';
      default:
        return 'bg-slate-200';
    }
  };

  // Filtered Attendance Logs list for the table below the grid
  const filteredLogs = useMemo(() => {
    // Reverse to show latest logs first
    return [...activityData.days]
      .filter((day) => {
        // Exclude future days from logs table
        if (day.status === 'FUTURE') return false;

        // Month filter
        if (monthFilter !== 'ALL' && day.month !== Number(monthFilter)) {
          return false;
        }

        // Status filter
        if (statusFilter !== 'ALL' && day.status !== statusFilter) {
          return false;
        }

        // Search query
        if (logSearchQuery.trim()) {
          const q = logSearchQuery.toLowerCase().trim();
          const matchDate = day.date.toLowerCase().includes(q);
          const matchLabel = day.label.toLowerCase().includes(q);
          const matchNotes = day.notes.toLowerCase().includes(q);
          if (!matchDate && !matchLabel && !matchNotes) return false;
        }

        // Only show if there's actual activity or if it's an absence on a weekday
        if (day.status === 'WEEKEND' || day.status === 'HOLIDAY') {
          return false;
        }

        return true;
      })
      .reverse();
  }, [activityData, monthFilter, statusFilter, logSearchQuery]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-pulse">
        <Loader2 className="w-8 h-8 text-[#714B67] animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Syncing Attendance Records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Full Day Card (Green) */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Full Days</span>
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs inline-block" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-extrabold text-emerald-600 leading-tight">
              {activityData.summary.fullDays}
            </p>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              8+ hrs logged ({activityData.summary.totalWorkingDays > 0 ? Math.round((activityData.summary.fullDays / activityData.summary.totalWorkingDays) * 100) : 0}%)
            </p>
          </div>
        </div>

        {/* Half Day Card (Yellow) */}
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-between hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Half Days</span>
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-xs inline-block" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-extrabold text-amber-600 leading-tight">
              {activityData.summary.halfDays}
            </p>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              4-5 hrs partial shifts
            </p>
          </div>
        </div>

        {/* Leaves / Off Card (Red) */}
        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-between hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Leaves / Off</span>
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs inline-block" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-extrabold text-rose-600 leading-tight">
              {activityData.summary.leaves}
            </p>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Approved PTO & Absences
            </p>
          </div>
        </div>

        {/* Total Logged Hours */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-[#714B67]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Work Hours</span>
            <Clock className="w-4 h-4 text-[#714B67]" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-extrabold text-slate-900 leading-tight">
              {activityData.summary.totalHours} <span className="text-xs font-normal text-slate-400">hrs</span>
            </p>
            <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
              {activityData.summary.attendanceRate}% Attendance Rate
            </p>
          </div>
        </div>
      </div>

      {/* 2. Unified Attendance Grid Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
        {/* Header & Year Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#714B67] uppercase tracking-wider">
              <CalendarDays className="w-4 h-4" />
              <span>Attendance Grid</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mt-0.5">
              Annual Attendance Matrix ({selectedYear})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hover over any square to view the date, status, and shift timing.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#714B67]/40 cursor-pointer"
            >
              <option value={2025}>2025 Attendance</option>
              <option value={2024}>2024 Attendance</option>
            </select>
          </div>
        </div>

        {/* Color Legend Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          {/* Filter Pills */}
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">View:</span>
            {[
              { id: 'ALL', label: 'All Days' },
              { id: 'FULL_DAY', label: '🟩 Full Day' },
              { id: 'HALF_DAY', label: '🟨 Half Day' },
              { id: 'LEAVE', label: '🟥 Off / Leave' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === f.id
                    ? 'bg-[#714B67] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block shadow-xs" />
              <span>Full Day (8h+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-400 inline-block shadow-xs" />
              <span>Half Day</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500 inline-block shadow-xs" />
              <span>Leave / Off</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-200/80 inline-block" />
              <span>Weekend / Holiday</span>
            </div>
          </div>
        </div>

        {/* The Attendance Grid */}
        <div className="relative overflow-x-auto pb-4 pt-2">
          <div className="min-w-[820px]">
            {/* Month Label Headers */}
            <div className="flex text-[10px] font-bold text-slate-400 mb-2 pl-7">
              {monthHeaderPositions.map((m, idx) => (
                <div
                  key={idx}
                  style={{ width: `${(100 / 53) * 4.3}%` }}
                  className="text-left font-mono"
                >
                  {m.monthName}
                </div>
              ))}
            </div>

            {/* 7-Row Weekday Grid */}
            <div className="flex gap-1">
              {/* Day Labels (Sun, Tue, Thu, Sat) */}
              <div className="flex flex-col justify-between text-[9px] font-bold text-slate-400 pr-2 py-0.5 select-none w-6 text-right">
                <span>Sun</span>
                <span>Tue</span>
                <span>Thu</span>
                <span>Sat</span>
              </div>

              {/* 53 Columns */}
              <div className="flex-1 flex gap-[3.5px]">
                {weekColumns.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-[3.5px]">
                    {week.map((day, dayIdx) => {
                      if (!day) {
                        return <div key={dayIdx} className="w-3.5 h-3.5 opacity-0" />;
                      }

                      const isSelected = selectedDay?.date === day.date;
                      const isToday = day.isToday;

                      return (
                        <div key={dayIdx} className="relative group">
                          <button
                            type="button"
                            onClick={() => setSelectedDay(day)}
                            onMouseEnter={() => setHoveredDay(day)}
                            onMouseLeave={() => setHoveredDay(null)}
                            className={`w-3.5 h-3.5 rounded-[3px] transition-all transform hover:scale-150 hover:z-30 relative cursor-pointer ${getCellColorClass(
                              day
                            )} ${isSelected ? 'ring-2 ring-purple-900 scale-150 z-20' : ''} ${
                              isToday ? 'ring-2 ring-indigo-400' : ''
                            }`}
                          />

                          {/* Hover Tooltip showing Date & Details */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-50 animate-fadeIn">
                            <div className="bg-slate-900 text-white text-[11px] rounded-xl py-1.5 px-3 shadow-xl whitespace-nowrap border border-slate-700 space-y-0.5">
                              <div className="font-bold flex items-center gap-1.5">
                                <span>
                                  {new Date(day.date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                                {day.isToday && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500 text-white font-black">
                                    TODAY
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-300 flex items-center gap-1.5">
                                <span
                                  className={`w-2 h-2 rounded-full inline-block ${
                                    day.status === 'FULL_DAY'
                                      ? 'bg-emerald-400'
                                      : day.status === 'HALF_DAY'
                                      ? 'bg-amber-400'
                                      : day.status === 'LEAVE' || day.status === 'ABSENT'
                                      ? 'bg-rose-400'
                                      : 'bg-slate-400'
                                  }`}
                                />
                                <span className="font-semibold text-white">{day.label}</span>
                                {day.workHoursStr !== '00:00' && (
                                  <span className="text-slate-400">({day.workHoursStr} hrs)</span>
                                )}
                              </div>
                              {day.checkIn !== '-' && (
                                <div className="text-[9px] text-slate-400">
                                  In: {day.checkIn} • Out: {day.checkOut}
                                </div>
                              )}
                            </div>
                            <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hover / Selected Day Quick Inspector */}
        {(hoveredDay || selectedDay) && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn text-xs">
            <div className="flex items-center gap-3">
              <div
                className={`w-3.5 h-3.5 rounded-md ${
                  (hoveredDay || selectedDay).status === 'FULL_DAY'
                    ? 'bg-emerald-500'
                    : (hoveredDay || selectedDay).status === 'HALF_DAY'
                    ? 'bg-amber-400'
                    : (hoveredDay || selectedDay).status === 'LEAVE' || (hoveredDay || selectedDay).status === 'ABSENT'
                    ? 'bg-rose-500'
                    : 'bg-slate-300'
                }`}
              />
              <div>
                <span className="font-extrabold text-slate-900">
                  {new Date((hoveredDay || selectedDay).date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-slate-400 mx-1.5">•</span>
                <span className="font-bold text-[#714B67]">
                  {(hoveredDay || selectedDay).label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-slate-600 font-medium">
              {(hoveredDay || selectedDay).checkIn !== '-' && (
                <span>
                  Check In: <strong>{(hoveredDay || selectedDay).checkIn}</strong>
                </span>
              )}
              {(hoveredDay || selectedDay).checkOut !== '-' && (
                <span>
                  Check Out: <strong>{(hoveredDay || selectedDay).checkOut}</strong>
                </span>
              )}
              <span>
                Duration: <strong>{(hoveredDay || selectedDay).workHoursStr} hrs</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Daily Attendance Log Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        {/* Table Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#714B67] uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Daily Attendance Logs</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mt-0.5">
              Attendance Records & Shift History
            </h3>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Search Bar */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search date, notes..."
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/40"
              />
            </div>

            {/* Month Filter */}
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/40 cursor-pointer"
            >
              <option value="ALL">All Months</option>
              {monthNames.map((m, idx) => (
                <option key={idx} value={idx}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Date & Day</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Clock In</th>
                <th className="px-4 py-3">Clock Out</th>
                <th className="px-4 py-3">Work Hours</th>
                <th className="px-4 py-3">Shift Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredLogs.slice(0, 30).map((log) => {
                const isFull = log.status === 'FULL_DAY';
                const isHalf = log.status === 'HALF_DAY';
                const isLeave = log.status === 'LEAVE' || log.status === 'ABSENT';
                const isWeekend = log.status === 'WEEKEND';
                const isHoliday = log.status === 'HOLIDAY';

                return (
                  <tr key={log.date} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>
                          {new Date(log.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        {log.isToday && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                            TODAY
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isFull
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isHalf
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : isLeave
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isHoliday
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isFull
                              ? 'bg-emerald-500'
                              : isHalf
                              ? 'bg-amber-500'
                              : isLeave
                              ? 'bg-rose-500'
                              : isHoliday
                              ? 'bg-purple-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <span>
                          {isFull
                            ? 'Full Day'
                            : isHalf
                            ? 'Half Day'
                            : log.status === 'LEAVE'
                            ? 'Leave'
                            : log.status === 'ABSENT'
                            ? 'Absent'
                            : log.status === 'HOLIDAY'
                            ? 'Holiday'
                            : 'Weekend Off'}
                        </span>
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {log.checkIn}
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {log.checkOut}
                    </td>

                    <td className="px-4 py-3 font-mono font-extrabold text-[#714B67] whitespace-nowrap">
                      {log.workHoursStr !== '00:00' ? `${log.workHoursStr} hrs` : '-'}
                    </td>

                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {log.notes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length > 30 && (
          <div className="text-center pt-2">
            <span className="text-xs text-slate-400 font-medium">
              Showing latest 30 logs out of {filteredLogs.length} records.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
