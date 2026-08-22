import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storage, STORAGE_KEYS } from '../../data/storage';
import { X, Plane, Calendar, Paperclip, CheckCircle2, FileText } from 'lucide-react';

export default function LeaveRequestModal({ isOpen, onClose, onSuccess }) {
  const { activeUser } = useAuth();
  const [leaveType, setLeaveType] = useState('Paid Time Off');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Auto calculate duration in days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const totalDays = diffTime >= 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 : 1;

  const handleSimulateFile = () => {
    setAttachment({
      fileName: 'Medical_Consultation_Certificate.pdf',
      fileSize: '1.2 MB',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (end < start) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for the leave application.');
      return;
    }

    const newRequest = {
      id: `req-${Date.now()}`,
      employeeId: activeUser?.id || 'emp-2',
      employeeName: activeUser?.name || 'John Doe',
      employeeAvatar: activeUser?.avatar || '',
      department: activeUser?.department || 'Engineering',
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason: reason.trim(),
      status: 'PENDING',
      appliedAt: new Date().toISOString(),
      reviewedBy: null,
      reviewedByName: null,
      reviewedAt: null,
      adminRemarks: null,
      attachment,
    };

    storage.update(STORAGE_KEYS.LEAVE_REQUESTS, (records = []) => [newRequest, ...records]);

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#714B67] flex items-center justify-center">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">New Time Off Request</h2>
            <p className="text-xs text-slate-500">Submit leave dates for supervisor review</p>
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
              Applying Employee
            </label>
            <p className="text-xs font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              {activeUser?.name} ({activeUser?.employeeId})
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Time Off Type
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/40"
            >
              <option value="Paid Time Off">Paid Time Off (PTO)</option>
              <option value="Sick Time Off">Sick Time Off (Medical)</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/40"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/40"
                required
              />
            </div>
          </div>

          {/* Allocation badge */}
          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 flex items-center justify-between">
            <span className="text-xs font-bold text-[#714B67]">Requested Duration:</span>
            <span className="text-xs font-black text-[#714B67] bg-white px-2.5 py-0.5 rounded-lg border border-purple-200">
              {totalDays > 0 ? `${totalDays} ${totalDays === 1 ? 'Day' : 'Days'}` : '0 Days'}
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Reason / Remarks
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide reason for time-off..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/40"
              required
            />
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Medical / Supporting Document (Optional)
            </label>
            {attachment ? (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#714B67]" />
                  <span className="font-bold text-slate-800">{attachment.fileName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSimulateFile}
                className="w-full py-2 border border-dashed border-slate-300 rounded-xl text-xs font-bold text-[#714B67] hover:bg-purple-50 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Attach Certificate / Document</span>
              </button>
            )}
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
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
