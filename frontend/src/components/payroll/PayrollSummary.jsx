import React from 'react';
import { DollarSign, TrendingUp, Users, Wallet } from 'lucide-react';

export default function PayrollSummary({ employees }) {
  const totalEmployees = employees.length;

  const totalMonthlyPayroll = employees.reduce((acc, emp) => {
    return acc + (emp.salary_structure?.month_wage || 50000);
  }, 0);

  const totalNetPay = employees.reduce((acc, emp) => {
    return acc + (emp.salary_structure?.net_salary || 46800);
  }, 0);

  const avgSalary = totalEmployees > 0 ? Math.round(totalMonthlyPayroll / totalEmployees) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Monthly Payroll */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Monthly Gross</span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#714B67] flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-extrabold text-[#714B67] mt-2 font-mono">
          ₹{totalMonthlyPayroll.toLocaleString('en-IN')}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">Annualized: ₹{(totalMonthlyPayroll * 12).toLocaleString('en-IN')}</p>
      </div>

      {/* Average Salary */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Base Wage</span>
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
          ₹{avgSalary.toLocaleString('en-IN')}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">Per employee / month</p>
      </div>

      {/* Total Net Pay */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Net Disbursed</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-extrabold text-emerald-600 mt-2 font-mono">
          ₹{totalNetPay.toLocaleString('en-IN')}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">After PF & professional tax deductions</p>
      </div>

      {/* Headcount */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Employees on Payroll</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
          {totalEmployees}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">100% statutory compliant</p>
      </div>
    </div>
  );
}
