import React from 'react';
import { Plane, AlertCircle, Plus, Calendar } from 'lucide-react';

export default function LeaveBalanceCards({ balances, onApplyClick }) {
  const paid = balances?.paidLeave || { total: 24, used: 4, available: 20 };
  const sick = balances?.sickLeave || { total: 12, used: 5, available: 7 };
  const unpaid = balances?.unpaidLeave || { total: 0, used: 1, available: 0 };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Paid Time Off */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Paid Time Off</span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#714B67] flex items-center justify-center">
            <Plane className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#714B67]">{paid.available}</span>
            <span className="text-xs font-bold text-slate-400">/ {paid.total} Days Total</span>
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Available leave balance</p>
        </div>
      </div>

      {/* Sick Time Off */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sick Time Off</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">{sick.available}</span>
            <span className="text-xs font-bold text-slate-400">/ {sick.total} Days Total</span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">{sick.used} days taken this year</p>
        </div>
      </div>

      {/* Unpaid Leave Taken */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Unpaid Leaves</span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600">{unpaid.used}</span>
            <span className="text-xs font-bold text-slate-400">Days</span>
          </div>
          <p className="text-xs text-rose-600 font-medium mt-1">Loss of pay deductible</p>
        </div>
      </div>
    </div>
  );
}
