import React, { useState, useEffect } from 'react';
import { X, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { storage, STORAGE_KEYS } from '../../data/storage';

export default function PunchOverrideModal({
  isOpen,
  onClose,
  initialRecord = null,
  onSuccess,
}) {
  const [employees, setEmployees] = useState(() => storage.getEmployees());
  const [employeeId, setEmployeeId] = useState(initialRecord?.employeeId || '');
  const [date, setDate] = useState(initialRecord?.date || new Date().toISOString().split('T')[0]);
  const [checkIn, setCheckIn] = useState(initialRecord?.checkIn !== '-' ? initialRecord?.checkIn || '09:00' : '09:00');
  const [checkOut, setCheckOut] = useState(initialRecord?.checkOut !== '-' ? initialRecord?.checkOut || '18:00' : '18:00');
  const [breakHours, setBreakHours] = useState(initialRecord?.breakHours || '01:00');
  const [status, setStatus] = useState(initialRecord?.status || 'PRESENT');
  const [overrideReason, setOverrideReason] = useState(initialRecord?.notes || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialRecord) {
      setEmployeeId(initialRecord.employeeId || '');
      setDate(initialRecord.date || new Date().toISOString().split('T')[0]);
      setCheckIn(initialRecord.checkIn !== '-' ? initialRecord.checkIn || '09:00' : '09:00');
      setCheckOut(initialRecord.checkOut !== '-' ? initialRecord.checkOut || '18:00' : '18:00');
      setBreakHours(initialRecord.breakHours || '01:00');
      setStatus(initialRecord.status || 'PRESENT');
      setOverrideReason(initialRecord.notes || '');
    } else {
      const emps = storage.getEmployees();
      if (emps.length > 0 && !employeeId) {
        setEmployeeId(emps[0].id);
      }
    }
  }, [initialRecord, isOpen]);

  if (!isOpen) return null;

  // Calculate work hours based on times
  const calculateWorkHours = () => {
    if (!checkIn || !checkOut || checkIn === '-' || checkOut === '-') return '00:00';
    try {
      const [inH, inM] = checkIn.split(':').map(Number);
      const [outH, outM] = checkOut.split(':').map(Number);
      const inMinutes = inH * 60 + inM;
      const outMinutes = outH * 60 + outM;
      const [brkH, brkM] = (breakHours || '01:00').split(':').map(Number);
      const breakMinutes = (brkH || 0) * 60 + (brkM || 0);

      const netMinutes = Math.max(0, outMinutes - inMinutes - breakMinutes);
      const hrs = Math.floor(netMinutes / 60).toString().padStart(2, '0');
      const mins = (netMinutes % 60).toString().padStart(2, '0');
      return `${hrs}:${mins}`;
    } catch {
      return '08:00';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!employeeId) {
      setError('Please select an employee.');
      return;
    }
    if (!date) {
      setError('Please select a valid date.');
      return;
    }
    if (!overrideReason.trim()) {
      setError('A reason for the punch adjustment is required for audit logs.');
      return;
    }

    setError('');
    const targetEmp = employees.find((emp) => emp.id === employeeId);
    const workHoursStr = calculateWorkHours();

    const [wHrs] = workHoursStr.split(':').map(Number);
    const extraHrsStr = wHrs > 8 ? `${(wHrs - 8).toString().padStart(2, '0')}:00` : '00:00';

    storage.update(STORAGE_KEYS.ATTENDANCE, (records = []) => {
      if (initialRecord) {
        // Update existing record
        return records.map((r) =>
          r.id === initialRecord.id
            ? {
                ...r,
                employeeId,
                employeeName: targetEmp?.name || r.employeeName,
                employeeAvatar: targetEmp?.avatar || r.employeeAvatar,
                department: targetEmp?.department || r.department,
                date,
                checkIn,
                checkOut,
                workHours: workHoursStr,
                extraHours: extraHrsStr,
                breakHours,
                status: status || 'OVERRIDDEN',
                notes: `[Adjusted by Admin]: ${overrideReason}`,
                overriddenAt: new Date().toISOString(),
              }
            : r
        );
      } else {
        // Create new adjusted punch record
        const newRecord = {
          id: `att-override-${Date.now()}`,
          employeeId,
          employeeName: targetEmp?.name || 'Employee',
          employeeAvatar: targetEmp?.avatar || '',
          department: targetEmp?.department || 'General',
          date,
          checkIn,
          checkOut,
          workHours: workHoursStr,
          extraHours: extraHrsStr,
          breakHours,
          status: status || 'OVERRIDDEN',
          notes: `[Manual Punch]: ${overrideReason}`,
          overriddenAt: new Date().toISOString(),
        };
        return [newRecord, ...records];
      }
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-200 overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 leading-none">
                {initialRecord ? 'Adjust Attendance Punch' : 'Manual Punch Override'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Audit-tracked administrative punch override</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Employee Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Select Employee <span className="text-rose-500">*</span>
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
              required
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.employeeId} - {emp.department})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Work Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
              required
            />
          </div>

          {/* Time Fields (Check In & Check Out) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Check In Time
              </label>
              <input
                type="time"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Check Out Time
              </label>
              <input
                type="time"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>
          </div>

          {/* Break Duration & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Break Duration
              </label>
              <select
                value={breakHours}
                onChange={(e) => setBreakHours(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              >
                <option value="00:00">No Break (00:00)</option>
                <option value="00:30">30 mins (00:30)</option>
                <option value="01:00">1 hour (01:00)</option>
                <option value="01:30">1.5 hours (01:30)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Calculated Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              >
                <option value="PRESENT">🟢 Present</option>
                <option value="HALF_DAY">🟠 Half Day</option>
                <option value="ON_LEAVE">✈️ On Leave</option>
                <option value="ABSENT">🟡 Absent</option>
                <option value="OVERRIDDEN">🔵 Adjusted (Audit)</option>
              </select>
            </div>
          </div>

          {/* Calculated Work Duration Preview */}
          <div className="p-3 bg-purple-50/60 rounded-lg flex items-center justify-between border border-purple-100">
            <span className="text-xs font-semibold text-purple-900">Computed Work Hours:</span>
            <span className="font-mono text-sm font-bold text-purple-700">
              {calculateWorkHours()} hrs
            </span>
          </div>

          {/* Mandatory Reason */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Override Reason / Remarks <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows="3"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="E.g. Biometric reader offline, client meeting on-site, forgot morning punch..."
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Save Override
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
