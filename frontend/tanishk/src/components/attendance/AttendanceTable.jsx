import React from 'react';
import { Clock, AlertCircle, CheckCircle, Plane, UserX, HelpCircle, Edit3 } from 'lucide-react';

export default function AttendanceTable({
  records = [],
  showEmployeeColumn = true,
  onEditRecord,
  isAdmin = false,
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Present
          </span>
        );
      case 'ON_LEAVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Plane className="w-3 h-3" />
            On Leave
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Absent
          </span>
        );
      case 'HALF_DAY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            Half Day
          </span>
        );
      case 'OVERRIDDEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Edit3 className="w-3 h-3 text-purple-600" />
            Adjusted
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
              <th className="py-3.5 px-4">Date</th>
              {showEmployeeColumn && <th className="py-3.5 px-4">Employee</th>}
              <th className="py-3.5 px-4">Check In</th>
              <th className="py-3.5 px-4">Check Out</th>
              <th className="py-3.5 px-4">Work Hours</th>
              <th className="py-3.5 px-4">Extra Hours</th>
              <th className="py-3.5 px-4">Break Hours</th>
              <th className="py-3.5 px-4">Status</th>
              {isAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan={showEmployeeColumn ? (isAdmin ? 9 : 8) : isAdmin ? 8 : 7}
                  className="py-12 text-center text-gray-400"
                >
                  <Clock className="w-10 h-10 mx-auto mb-2 text-gray-300 stroke-1" />
                  <p className="font-semibold text-gray-500">No attendance logs found for this period.</p>
                  <p className="text-xs text-gray-400 mt-1">Check the selected date/month filter or mark your attendance.</p>
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-purple-50/30 transition-colors"
                >
                  {/* Date Column */}
                  <td className="py-3.5 px-4 font-semibold text-gray-900 whitespace-nowrap">
                    {formatDateDisplay(record.date)}
                    {record.isCurrentDay && (
                      <span className="ml-2 inline-block px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-800 rounded-full">
                        Today
                      </span>
                    )}
                  </td>

                  {/* Employee Column (for Admin / Org View) */}
                  {showEmployeeColumn && (
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={record.employeeAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                          alt={record.employeeName}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 leading-none">{record.employeeName}</p>
                          <p className="text-xs text-gray-500 mt-1">{record.department}</p>
                        </div>
                      </div>
                    </td>
                  )}

                  {/* Check In */}
                  <td className="py-3.5 px-4 font-mono text-gray-900 whitespace-nowrap">
                    {record.checkIn || '-'}
                  </td>

                  {/* Check Out */}
                  <td className="py-3.5 px-4 font-mono text-gray-900 whitespace-nowrap">
                    {record.checkOut || '-'}
                  </td>

                  {/* Work Hours */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-gray-900 whitespace-nowrap">
                    {record.workHours || '00:00'}
                  </td>

                  {/* Extra Hours */}
                  <td className="py-3.5 px-4 font-mono text-purple-700 whitespace-nowrap">
                    {record.extraHours && record.extraHours !== '00:00' ? (
                      <span className="font-semibold text-emerald-600">+{record.extraHours}</span>
                    ) : (
                      <span className="text-gray-400">00:00</span>
                    )}
                  </td>

                  {/* Break Hours */}
                  <td className="py-3.5 px-4 font-mono text-gray-500 whitespace-nowrap">
                    {record.breakHours || '00:00'}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(record.status)}
                    {record.notes && (
                      <span className="block text-[11px] text-gray-400 mt-0.5 max-w-xs truncate" title={record.notes}>
                        {record.notes}
                      </span>
                    )}
                  </td>

                  {/* Actions for Admin */}
                  {isAdmin && (
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onEditRecord && onEditRecord(record)}
                        className="text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Adjust
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
