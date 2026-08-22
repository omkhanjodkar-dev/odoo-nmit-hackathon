import React from 'react';
import { UserCheck, AlertCircle, Plane, Clock, Zap } from 'lucide-react';

export default function AttendanceMetrics({
  totalWorkingDays = 22,
  presentDays = 20,
  absentDays = 1,
  leaveDays = 1,
  totalWorkHours = '170:00',
  totalExtraHours = '04:30',
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Days Present */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Days Present</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{presentDays}</span>
          <span className="text-xs font-bold text-slate-400">/ {totalWorkingDays} Scheduled</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">Payable attendance days</p>
      </div>

      {/* 2. Total Leaves Taken */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Approved Leaves</span>
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Plane className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-sky-600">{leaveDays}</span>
          <span className="text-xs font-bold text-slate-400">Days</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">Paid & sick approved time-off</p>
      </div>

      {/* 3. Unapplied Absences */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Absent Days</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">{absentDays}</span>
          <span className="text-xs font-bold text-slate-400">Days</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">Subject to unpaid deduction</p>
      </div>

      {/* 4. Total Logged Work Hours */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Work Hours</span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#714B67] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{totalWorkHours}</span>
          <span className="text-xs font-bold text-emerald-600">+{totalExtraHours} OT</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">Monthly cumulative clocked time</p>
      </div>
    </div>
  );
}
