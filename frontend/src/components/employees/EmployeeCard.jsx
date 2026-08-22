import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Building2, ChevronRight, UserCheck, Plane, AlertCircle } from 'lucide-react';

export default function EmployeeCard({ employee }) {
  const navigate = useNavigate();

  const isPresent = employee.status === 'present' || employee.attendance_status === 'PRESENT';
  const isOnLeave = employee.status === 'on_leave' || employee.attendance_status === 'LEAVE';

  return (
    <div
      onClick={() => navigate(`/employees/${employee.id}`)}
      className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#714B67]/30 transition-all cursor-pointer relative flex flex-col justify-between"
    >
      {/* Top Status & Avatar */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="relative">
            <img
              src={employee.avatar}
              alt={employee.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 group-hover:scale-105 transition-transform"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                isPresent ? 'bg-emerald-500' : isOnLeave ? 'bg-sky-500' : 'bg-amber-500'
              }`}
              title={isPresent ? 'Present in Office' : isOnLeave ? 'On Leave' : 'Absent'}
            />
          </div>

          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              isPresent
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : isOnLeave
                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {isPresent ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Present</span>
              </>
            ) : isOnLeave ? (
              <>
                <span>✈️</span>
                <span>On Leave</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Absent</span>
              </>
            )}
          </span>
        </div>

        {/* Identity Details */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#714B67] transition-colors truncate">
              {employee.name}
            </h3>
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              {employee.employeeId}
            </span>
          </div>
          <p className="text-xs font-semibold text-[#714B67] mt-0.5 truncate">{employee.designation}</p>
          <p className="text-xs text-slate-400 truncate">{employee.department}</p>
        </div>
      </div>

      {/* Footer Contact Details */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
        <div className="flex items-center gap-2 truncate">
          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{employee.email}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{employee.location || 'Odoo India'}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#714B67] group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
}
