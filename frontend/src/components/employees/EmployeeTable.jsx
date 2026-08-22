import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ChevronRight } from 'lucide-react';

export default function EmployeeTable({ employees }) {
  const navigate = useNavigate();

  if (employees.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80">
        <p className="text-sm font-semibold text-slate-500">No employees found matching criteria.</p>
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
              <th className="py-3.5 px-4">Employee Code</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4">Designation</th>
              <th className="py-3.5 px-4">Work Email</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {employees.map((emp) => {
              const isPresent = emp.status === 'present' || emp.attendance_status === 'PRESENT';
              const isOnLeave = emp.status === 'on_leave' || emp.attendance_status === 'LEAVE';

              return (
                <tr
                  key={emp.id}
                  onClick={() => navigate(`/employees/${emp.id}`)}
                  className="hover:bg-purple-50/40 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                      />
                      <span className="font-bold text-slate-900 text-sm">{emp.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                    {emp.employeeId}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{emp.department}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#714B67]">{emp.designation}</td>
                  <td className="py-3.5 px-4 text-slate-500">{emp.email}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isPresent
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isOnLeave
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isPresent ? '🟢 Present' : isOnLeave ? '✈️ On Leave' : '🟡 Absent'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-xs font-bold text-[#714B67] hover:underline inline-flex items-center gap-1">
                      <span>View Form</span>
                      <ChevronRight className="w-3.5 h-3.5" />
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
