import React, { useState, useEffect } from 'react';
import { calculateSalaryComponents } from '../../data/mockPayroll';
import { X, DollarSign, Calculator, CheckCircle2 } from 'lucide-react';

export default function SalaryConfigModal({ isOpen, employee, onClose, onSave, isAdmin }) {
  const [wage, setWage] = useState(50000);
  const [computed, setComputed] = useState(() => calculateSalaryComponents(50000));

  useEffect(() => {
    if (employee) {
      const currentWage = employee.salary_structure?.month_wage || 50000;
      setWage(currentWage);
      setComputed(calculateSalaryComponents(currentWage));
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const handleWageChange = (e) => {
    const val = Number(e.target.value) || 0;
    setWage(val);
    setComputed(calculateSalaryComponents(val));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(employee.id, computed);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#714B67] flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Configure Salary Structure</h2>
            <p className="text-xs text-slate-500">Update monthly base compensation for {employee.name}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-900">{employee.name}</p>
              <p className="text-[10px] text-slate-400 font-mono">{employee.employeeId} • {employee.designation}</p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 text-[#714B67]">
              {employee.department}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Monthly Base Wage (Gross ₹)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sm font-bold text-slate-400">₹</span>
              <input
                type="number"
                value={wage}
                onChange={handleWageChange}
                disabled={!isAdmin}
                className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-[#714B67] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/40"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Annualized Gross CTC: <strong className="text-slate-700 font-mono">₹{(wage * 12).toLocaleString('en-IN')}</strong>
            </p>
          </div>

          {/* Dynamic Component Summary */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs mb-2">
              <Calculator className="w-3.5 h-3.5 text-[#714B67]" />
              Calculated Breakdown
            </h4>

            <div className="flex items-center justify-between text-slate-600">
              <span>Basic Salary (50%):</span>
              <span className="font-mono font-bold text-slate-900">₹{computed.basic_salary.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>House Rent Allowance (50% of Basic):</span>
              <span className="font-mono font-bold text-slate-900">₹{computed.hra.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Standard Statutory Allowance:</span>
              <span className="font-mono font-bold text-slate-900">₹{computed.standard_allowance.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Performance Bonus (8.33%):</span>
              <span className="font-mono font-bold text-slate-900">₹{computed.performance_bonus.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Leave Travel Allowance (8.33%):</span>
              <span className="font-mono font-bold text-slate-900">₹{computed.lta.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Fixed Special Allowance:</span>
              <span className="font-mono font-bold text-slate-900">₹{computed.fixed_allowance.toLocaleString('en-IN')}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-rose-600 font-semibold">
              <span>Provident Fund (12% of Basic):</span>
              <span className="font-mono">- ₹{computed.pf.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-rose-600 font-semibold">
              <span>Professional Tax:</span>
              <span className="font-mono">- ₹{computed.professional_tax.toLocaleString('en-IN')}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-extrabold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg">
              <span>Net Monthly Disbursed Pay:</span>
              <span className="font-mono text-base">₹{computed.net_salary.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              {isAdmin ? 'Cancel' : 'Close'}
            </button>
            {isAdmin && (
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#714B67] hover:bg-[#5a3b52] text-white font-bold text-xs shadow-sm transition-all"
              >
                Save & Update Payroll
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
