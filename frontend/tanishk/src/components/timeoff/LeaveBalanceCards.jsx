import React from 'react';
import { Calendar, HeartPulse, DollarSign, ArrowUpRight } from 'lucide-react';

export default function LeaveBalanceCards({
  balances = {
    paidLeave: { total: 24, used: 4, available: 20 },
    sickLeave: { total: 12, used: 5, available: 7 },
    unpaidLeave: { total: 0, used: 1, available: 0 },
  },
  onApplyClick,
  className = '',
}) {
  const paidPct = Math.round((balances.paidLeave.available / balances.paidLeave.total) * 100) || 0;
  const sickPct = Math.round((balances.sickLeave.available / balances.sickLeave.total) * 100) || 0;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 ${className}`}>
      {/* Paid Time Off Card (Wireframe: Paid time Off - 24 Days Available) */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-all relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Paid Time Off</h3>
              <p className="text-xs text-gray-500">Annual Vacation & Casual Leaves</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-purple-700 tracking-tight">
              {balances.paidLeave.available} <span className="text-sm font-semibold text-gray-500">Days Available</span>
            </span>
            <span className="text-xs font-semibold text-gray-500">
              {balances.paidLeave.used} / {balances.paidLeave.total} Used
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2.5 overflow-hidden">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${paidPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sick Time Off Card (Wireframe: Sick time off - 07 Days Available) */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-all relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Sick Time Off</h3>
              <p className="text-xs text-gray-500">Medical Rest & Recovery</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-rose-600 tracking-tight">
              {balances.sickLeave.available.toString().padStart(2, '0')}{' '}
              <span className="text-sm font-semibold text-gray-500">Days Available</span>
            </span>
            <span className="text-xs font-semibold text-gray-500">
              {balances.sickLeave.used} / {balances.sickLeave.total} Used
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2.5 overflow-hidden">
            <div
              className="bg-rose-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${sickPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Unpaid Leaves Card */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-all relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Unpaid Leaves</h3>
              <p className="text-xs text-gray-500">Loss of Pay (Deducted from Payroll)</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-600 tracking-tight">
              {balances.unpaidLeave.used}{' '}
              <span className="text-sm font-semibold text-gray-500">Days Taken</span>
            </span>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              Salary impact
            </span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-2 mt-2.5 overflow-hidden">
            <div
              className="bg-amber-500 h-2 rounded-full"
              style={{ width: balances.unpaidLeave.used > 0 ? '100%' : '0%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
