import React from 'react';
import { calculateSalaryComponents } from '../../../utils/salary';
import { DollarSign, ShieldAlert, Lock, CheckCircle2, Calculator } from 'lucide-react';

export default function SalaryInfoTab({ employee, isEditing, onChangeField, canEditSalary }) {
  const currentStructure = employee.salary_structure || calculateSalaryComponents(50000);

  const handleMonthWageChange = (e) => {
    const val = Number(e.target.value) || 0;
    const recomputed = calculateSalaryComponents(val);
    onChangeField('salary_structure', recomputed);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* RBAC Notice */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
        canEditSalary
          ? 'bg-purple-50/60 border-purple-200 text-[#714B67]'
          : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        <div className="flex items-center gap-2.5">
          {canEditSalary ? (
            <ShieldAlert className="w-5 h-5 text-[#714B67] shrink-0" />
          ) : (
            <Lock className="w-5 h-5 text-slate-400 shrink-0" />
          )}
          <div>
            <p className="text-xs font-bold text-slate-900">
              {canEditSalary
                ? '👑 Administrator Mode: You have full permissions to update compensation structures.'
                : '🔒 Confidential Record: Compensation structure is managed by HR Administration.'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Formulas are statutory compliant with Indian Income Tax & PF guidelines.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
          {canEditSalary ? 'Admin Editable' : 'Read Only'}
        </span>
      </div>

      {/* 1. Base Wage Configuration */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#714B67]" />
          Base Wage & Working Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Monthly Gross Wage
            </label>
            {isEditing && canEditSalary ? (
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={currentStructure.month_wage || ''}
                  onChange={handleMonthWageChange}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#714B67] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>
            ) : (
              <p className="text-lg font-extrabold text-[#714B67]">
                ₹{(currentStructure.month_wage || 50000).toLocaleString('en-IN')}{' '}
                <span className="text-xs font-semibold text-slate-400">/ Month</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Annualized Gross CTC
            </label>
            <p className="text-lg font-extrabold text-slate-800">
              ₹{(currentStructure.yearly_wage || (currentStructure.month_wage * 12)).toLocaleString('en-IN')}{' '}
              <span className="text-xs font-semibold text-slate-400">/ Year</span>
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Working Days / Week
            </label>
            <p className="text-sm font-bold text-slate-800">5 Days (Mon - Fri)</p>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Standard Daily Break
            </label>
            <p className="text-sm font-bold text-slate-800">01:00 hr / day</p>
          </div>
        </div>
      </div>

      {/* 2. Statutory Components Breakdown Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#714B67]" />
              Salary Components Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Computed dynamically from base monthly gross wage</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Estimated Net Monthly Pay:</span>
            <p className="text-lg font-black text-emerald-600">
              ₹{(currentStructure.net_salary || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Component Name</th>
                <th className="py-3 px-4">Computation Basis / Formula</th>
                <th className="py-3 px-4 text-right">Monthly (₹)</th>
                <th className="py-3 px-4 text-right">Annual (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {/* Earnings */}
              <tr className="bg-purple-50/30">
                <td colSpan={4} className="py-2 px-4 text-[11px] font-bold text-[#714B67] uppercase tracking-wider">
                  Earnings & Allowances
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Basic Salary</td>
                <td className="py-3 px-4 text-slate-500">50.00% of Month Wage</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                  ₹{(currentStructure.basic_salary || 0).toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-500">
                  ₹{((currentStructure.basic_salary || 0) * 12).toLocaleString('en-IN')}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">House Rent Allowance (HRA)</td>
                <td className="py-3 px-4 text-slate-500">50.00% of Basic Salary</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                  ₹{(currentStructure.hra || 0).toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-500">
                  ₹{((currentStructure.hra || 0) * 12).toLocaleString('en-IN')}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Standard Allowance</td>
                <td className="py-3 px-4 text-slate-500">Fixed Statutory Allowance</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                  ₹{(currentStructure.standard_allowance || 4167).toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-500">
                  ₹{((currentStructure.standard_allowance || 4167) * 12).toLocaleString('en-IN')}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Performance Bonus</td>
                <td className="py-3 px-4 text-slate-500">8.33% of Basic Salary</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                  ₹{(currentStructure.performance_bonus || 0).toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-500">
                  ₹{((currentStructure.performance_bonus || 0) * 12).toLocaleString('en-IN')}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Leave Travel Allowance (LTA)</td>
                <td className="py-3 px-4 text-slate-500">8.33% of Basic Salary</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                  ₹{(currentStructure.lta || 0).toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-500">
                  ₹{((currentStructure.lta || 0) * 12).toLocaleString('en-IN')}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Fixed Special Allowance</td>
                <td className="py-3 px-4 text-slate-500">Balancing Wage Remainder</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                  ₹{(currentStructure.fixed_allowance || 0).toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-500">
                  ₹{((currentStructure.fixed_allowance || 0) * 12).toLocaleString('en-IN')}
                </td>
              </tr>

              {/* Deductions */}
              <tr className="bg-rose-50/30">
                <td colSpan={4} className="py-2 px-4 text-[11px] font-bold text-rose-700 uppercase tracking-wider">
                  Statutory Deductions
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Provident Fund (PF)</td>
                <td className="py-3 px-4 text-slate-500">12.00% of Basic Salary</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                  - ₹{(currentStructure.pf || 0).toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-500">
                  - ₹{((currentStructure.pf || 0) * 12).toLocaleString('en-IN')}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Professional Tax</td>
                <td className="py-3 px-4 text-slate-500">State Statutory Standard</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                  - ₹{(currentStructure.professional_tax || 200).toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-500">
                  - ₹{((currentStructure.professional_tax || 200) * 12).toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
