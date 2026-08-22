import React from 'react';
import { Check, X, FileText, Clock, AlertCircle, CheckCircle2, XCircle, Paperclip } from 'lucide-react';

export default function LeaveRequestTable({
  requests = [],
  isAdmin = false,
  onApprove,
  onOpenRejectModal,
  onViewAttachment,
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pending Approval
          </span>
        );
    }
  };

  const getLeaveTypeBadge = (type) => {
    switch (type) {
      case 'Paid Time Off':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-100 text-purple-800">
            Paid Time Off
          </span>
        );
      case 'Sick Time Off':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-100 text-rose-800">
            Sick Time Off
          </span>
        );
      case 'Unpaid Leave':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-800">
            Unpaid Leave
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-800">
            {type}
          </span>
        );
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
              <th className="py-3.5 px-4">Employee</th>
              <th className="py-3.5 px-4">Time Off Type</th>
              <th className="py-3.5 px-4">Start Date</th>
              <th className="py-3.5 px-4">End Date</th>
              <th className="py-3.5 px-4">Duration</th>
              <th className="py-3.5 px-4">Attachment</th>
              <th className="py-3.5 px-4">Status</th>
              {isAdmin && <th className="py-3.5 px-4 text-right">Approval Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} className="py-12 text-center text-gray-400">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300 stroke-1" />
                  <p className="font-semibold text-gray-500">No time-off requests found.</p>
                  <p className="text-xs text-gray-400 mt-1">Submit a new request to apply for leave.</p>
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="hover:bg-purple-50/30 transition-colors">
                  {/* Employee Name & Avatar */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={req.employeeAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={req.employeeName}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 leading-none">{req.employeeName}</p>
                        <p className="text-xs text-gray-500 mt-1">{req.department}</p>
                      </div>
                    </div>
                  </td>

                  {/* Time Off Type */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getLeaveTypeBadge(req.leaveType)}
                  </td>

                  {/* Start Date */}
                  <td className="py-3.5 px-4 font-mono text-gray-900 whitespace-nowrap">
                    {formatDate(req.startDate)}
                  </td>

                  {/* End Date */}
                  <td className="py-3.5 px-4 font-mono text-gray-900 whitespace-nowrap">
                    {formatDate(req.endDate)}
                  </td>

                  {/* Duration */}
                  <td className="py-3.5 px-4 font-semibold text-gray-900 whitespace-nowrap">
                    {req.totalDays} {req.totalDays === 1 ? 'Day' : 'Days'}
                  </td>

                  {/* Attachment */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {req.attachment ? (
                      <button
                        onClick={() => onViewAttachment && onViewAttachment(req.attachment)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors"
                        title={req.attachment.fileName}
                      >
                        <Paperclip className="w-3.5 h-3.5 text-purple-600" />
                        <span className="max-w-[120px] truncate">{req.attachment.fileName}</span>
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </td>

                  {/* Status & Remarks */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(req.status)}
                    {req.adminRemarks && (
                      <p className="text-[11px] text-gray-500 mt-1 max-w-xs truncate" title={req.adminRemarks}>
                        <span className="font-medium text-gray-700">Remarks:</span> {req.adminRemarks}
                      </p>
                    )}
                  </td>

                  {/* Action Buttons for Admin (Wireframe lines 18830-18863: Reject & Approve buttons) */}
                  {isAdmin && (
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {req.status === 'PENDING' ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => onApprove(req.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            title="Approve Request"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => onOpenRejectModal(req)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                            title="Reject Request with Comments"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Completed</span>
                      )}
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
