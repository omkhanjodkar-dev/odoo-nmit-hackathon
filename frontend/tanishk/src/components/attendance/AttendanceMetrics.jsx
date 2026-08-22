import React from 'react';
import { CalendarDays, CheckCircle2, UserX, Clock, Plane, TrendingUp } from 'lucide-react';

export default function AttendanceMetrics({
  totalWorkingDays = 22,
  presentDays = 19,
  absentDays = 1,
  leaveDays = 2,
  totalWorkHours = '168:00',
  totalExtraHours = '06:30',
  className = '',
}) {
  const attendanceRate = totalWorkingDays > 0 ? Math.round((presentDays / totalWorkingDays) * 100) : 0;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ${className}`}>
      {/* Total Working Days */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Total Working Days
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900">{totalWorkingDays}</span>
            <span className="text-xs text-gray-500">Scheduled Days</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
          <CalendarDays className="w-5 h-5" />
        </div>
      </div>

      {/* Present Days */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Days Present
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-600">{presentDays}</span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {attendanceRate}%
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* Leave & Absent Days */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Leave & Absent
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900">{leaveDays + absentDays}</span>
            <span className="text-xs text-gray-500">
              ({leaveDays} Leave, {absentDays} Absent)
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
          <Plane className="w-5 h-5" />
        </div>
      </div>

      {/* Total Logged Work & Extra Hours */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Total Work Hours
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900">{totalWorkHours}</span>
            <span className="text-xs font-medium text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
              +{totalExtraHours} Overtime
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
          <Clock className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
