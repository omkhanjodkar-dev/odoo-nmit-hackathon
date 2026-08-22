import React from 'react';
import { Clock, Edit3, CheckCircle2, AlertCircle, Plane } from 'lucide-react';

export default function AttendanceTable({
  records,
  showEmployeeColumn = true,
  onEditRecord,
  isAdmin,
}) {
  if (records.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80">
        <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-500">No attendance records found for this date/filter selection.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              {showEmployeeColumn && <th className="py-3 px-4">Employee</th>}
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Check In</th>
              <th className="py-3 px-4">Check Out</th>
              <th className="py-3 px-4">Work Hours</th>
              <th className="py-3 px-4">Extra Hours</th>
              <th className="py-3 px-4">Status</th>
              {isAdmin && <th className="py-3 px-4 text-right">Adjustment</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {records.map((rec) => {
              const isPresent = rec.status === 'PRESENT' || rec.status === 'OVERRIDDEN';
              const isOnLeave = rec.status === 'ON_LEAVE';
              const isAbsent = rec.status === 'ABSENT';

              return (
                <tr key={rec.id} className="hover:bg-purple-50/30 transition-colors">
                  {showEmployeeColumn && (
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rec.employeeAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={rec.employeeName}
                          className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 leading-none">{rec.employeeName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{rec.department || 'Engineering'}</p>
                        </div>
                      </div>
                    </td>
                  )}

                  <td className="py-3 px-4 font-semibold text-slate-700">{rec.date}</td>
                  <td className="py-3 px-4 text-slate-600">{rec.checkIn || '-'}</td>
                  <td className="py-3 px-4 text-slate-600">{rec.checkOut || '-'}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{rec.workHours || '00:00'}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{rec.extraHours || '00:00'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        rec.status === 'OVERRIDDEN'
                          ? 'bg-purple-50 text-[#714B67] border border-purple-200'
                          : isPresent
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isOnLeave
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {rec.status === 'OVERRIDDEN' ? 'Adjusted' : rec.status}
                    </span>
                  </td>

                  {isAdmin && (
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onEditRecord(rec)}
                        className="text-slate-400 hover:text-[#714B67] p-1 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Adjust Punch Record"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
