import React from 'react';
import { Settings2, ChevronRight } from 'lucide-react';

export default function SalaryStructureTable({ employees, onConfigureEmployee, isAdmin }) {
  if (employees.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80">
        <p className="text-xs font-semibold text-slate-500">No salary records found for this query.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">Employee</th>
              <th className="py-3.5 px-4">Designation</th>
              <th className="py-3.5 px-4 text-right">Monthly Gross (₹)</th>
              <th className="py-3.5 px-4 text-right">Basic (50%)</th>
              <th className="py-3.5 px-4 text-right">HRA (50%)</th>
              <th className="py-3.5 px-4 text-right">PF (12%)</th>
              <th className="py-3.5 px-4 text-right">Net Take-Home</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {employees.map((emp) => {
              const sal = emp.salary_structure || {};
              const monthWage = sal.month_wage || 50000;
              const basic = sal.basic_salary || monthWage * 0.5;
              const hra = sal.hra || basic * 0.5;
              const pf = sal.pf || basic * 0.12;
              const net = sal.net_salary || monthWage - pf - 200;

              return (
                <tr key={emp.id} className="hover:bg-purple-50/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900 leading-none">{emp.name}</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{emp.employeeId}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">{emp.designation}</td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    ₹{monthWage.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                    ₹{basic.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                    ₹{hra.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-rose-600 font-semibold">
                    - ₹{pf.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-extrabold text-emerald-600">
                    ₹{net.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onConfigureEmployee(emp)}
                      className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#714B67] text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      <span>{isAdmin ? 'Configure' : 'View'}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
