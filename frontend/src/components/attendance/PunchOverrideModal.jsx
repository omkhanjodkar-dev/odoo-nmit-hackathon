import React, { useState, useEffect } from 'react';
import { storage, STORAGE_KEYS } from '../../data/storage';
import { X, Clock, Edit2, ShieldAlert } from 'lucide-react';

export default function PunchOverrideModal({ isOpen, onClose, initialRecord, onSuccess }) {
  const [employees, setEmployees] = useState(() => storage.getEmployees());
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [date, setDate] = useState('');
  const [checkIn, setCheckIn] = useState('09:00 AM');
  const [checkOut, setCheckOut] = useState('06:00 PM');
  const [remarks, setRemarks] = useState('Missed punch adjusted per manager email confirmation.');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialRecord) {
      setSelectedEmpId(initialRecord.employeeId);
      setDate(initialRecord.date);
      setCheckIn(initialRecord.checkIn !== '-' ? initialRecord.checkIn : '09:00 AM');
      setCheckOut(initialRecord.checkOut !== '-' ? initialRecord.checkOut : '06:00 PM');
      setRemarks(initialRecord.notes || 'Missed punch adjusted per manager email confirmation.');
    } else {
      setSelectedEmpId(employees[0]?.id || '');
      setDate(new Date().toISOString().split('T')[0]);
      setCheckIn('09:00 AM');
      setCheckOut('06:00 PM');
    }
  }, [initialRecord, employees]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedEmpId || !date) {
      setError('Please select an employee and date.');
      return;
    }

    const emp = employees.find((e) => e.id === selectedEmpId);

    storage.update(STORAGE_KEYS.ATTENDANCE, (records = []) => {
      if (initialRecord) {
        return records.map((r) =>
          r.id === initialRecord.id
            ? {
                ...r,
                checkIn,
                checkOut,
                workHours: '08:00',
                status: 'OVERRIDDEN',
                notes: remarks,
              }
            : r
        );
      } else {
        const newRecord = {
          id: `att-override-${Date.now()}`,
          employeeId: emp?.id || 'emp-2',
          employeeName: emp?.name || 'Employee',
          employeeAvatar: emp?.avatar || '',
          department: emp?.department || 'Engineering',
          date,
          checkIn,
          checkOut,
          workHours: '08:00',
          extraHours: '00:00',
          status: 'OVERRIDDEN',
          notes: remarks,
        };
        return [newRecord, ...records];
      }
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-7 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#714B67] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Manual Punch Adjustment</h2>
            <p className="text-xs text-slate-500">Correct missing biometric logs or clock-in anomalies</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Select Employee
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              disabled={!!initialRecord}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/40"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.employeeId}) — {emp.department}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Attendance Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={!!initialRecord}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/40"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Adjusted Check In
              </label>
              <input
                type="text"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                placeholder="09:00 AM"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/40"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Adjusted Check Out
            </label>
            <input
              type="text"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              placeholder="06:00 PM"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/40"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Adjustment Audit Remarks
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Reason for override..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/40"
              required
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#714B67] hover:bg-[#5a3b52] text-white font-bold text-xs shadow-sm transition-all"
            >
              Save Override
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
