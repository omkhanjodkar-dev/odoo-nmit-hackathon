import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function RejectRemarksModal({ isOpen, request, onClose, onConfirmReject }) {
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !request) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!remarks.trim()) {
      setError('Please enter a rejection reason.');
      return;
    }
    onConfirmReject(request.id, remarks.trim());
    setRemarks('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Reject Leave Request</h2>
            <p className="text-xs text-slate-500">Provide rejection remarks for {request.employeeName}</p>
          </div>
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-600 mb-3">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
            <p><strong className="text-slate-700">Type:</strong> {request.leaveType}</p>
            <p><strong className="text-slate-700">Dates:</strong> {request.startDate} to {request.endDate} ({request.totalDays} Days)</p>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Rejection Remarks (Required)
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Critical deployment window scheduled; please reschedule."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/40"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
