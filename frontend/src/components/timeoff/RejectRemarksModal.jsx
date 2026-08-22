import React, { useState } from 'react';
import { X, AlertTriangle, MessageSquare } from 'lucide-react';

export default function RejectRemarksModal({
  isOpen,
  onClose,
  request = null,
  onConfirmReject,
}) {
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !request) return null;

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!remarks.trim()) {
      setError('Please provide a mandatory rejection remark explaining the decision.');
      return;
    }
    setError('');
    onConfirmReject(request.id, remarks.trim());
    setRemarks('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-rose-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 leading-none">Reject Time Off Request</h3>
              <p className="text-xs text-gray-500 mt-1">Provide required rejection reason</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirm} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
              {error}
            </div>
          )}

          {/* Target Request Summary */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-1">
            <p className="font-bold text-gray-900">{request.employeeName} ({request.department})</p>
            <p className="text-gray-600">
              <span className="font-semibold">{request.leaveType}</span> &bull; {request.totalDays} Days ({request.startDate} to {request.endDate})
            </p>
            {request.reason && (
              <p className="text-gray-500 italic mt-1">&ldquo;{request.reason}&rdquo;</p>
            )}
          </div>

          {/* Mandatory Remarks Textarea */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-rose-600" />
              <span>Administrative Rejection Remarks <span className="text-rose-500">*</span></span>
            </label>
            <textarea
              rows="3"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="E.g. Conflict with critical project sprint launch, insufficient notice..."
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent font-medium"
              required
            />
          </div>

          {/* Actions */}
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
              className="px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
