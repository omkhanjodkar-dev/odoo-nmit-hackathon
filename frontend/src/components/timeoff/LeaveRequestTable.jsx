import React from 'react';
import { CheckCircle2, XCircle, FileText, Clock, AlertCircle } from 'lucide-react';

export default function LeaveRequestTable({
  requests,
  isAdmin,
  onApprove,
  onOpenRejectModal,
  onViewAttachment,
}) {
  if (requests.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80">
        <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-500">No leave applications found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              {isAdmin && <th className="py-3 px-4">Applicant</th>}
              <th className="py-3 px-4">Leave Type</th>
              <th className="py-3 px-4">Validity Period</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">Reason / Notes</th>
              <th className="py-3 px-4">Attachment</th>
              <th className="py-3 px-4">Status</th>
              {isAdmin && <th className="py-3 px-4 text-right">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-purple-50/30 transition-colors">
                {isAdmin && (
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={req.employeeAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={req.employeeName}
                        className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900 leading-none">{req.employeeName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{req.department || 'Engineering'}</p>
                      </div>
                    </div>
                  </td>
                )}

                <td className="py-3 px-4">
                  <span className="font-bold text-[#714B67]">{req.leaveType}</span>
                </td>

                <td className="py-3 px-4 text-slate-600">
                  {req.startDate} <span className="text-slate-400">&rarr;</span> {req.endDate}
                </td>

                <td className="py-3 px-4 font-bold text-slate-800">
                  {req.totalDays} {req.totalDays === 1 ? 'Day' : 'Days'}
                </td>

                <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                  {req.reason || '-'}
                </td>

                <td className="py-3 px-4">
                  {req.attachment ? (
                    <button
                      onClick={() => onViewAttachment(req.attachment)}
                      className="text-xs font-bold text-[#714B67] hover:underline flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-md"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View File</span>
                    </button>
                  ) : (
                    <span className="text-slate-400 text-[11px]">-</span>
                  )}
                </td>

                <td className="py-3 px-4">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      req.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : req.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-purple-50 text-[#714B67] border border-purple-200'
                    }`}
                  >
                    {req.status}
                  </span>
                </td>

                {isAdmin && (
                  <td className="py-3 px-4 text-right">
                    {req.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onApprove(req.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1"
                          title="Approve Request"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => onOpenRejectModal(req)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition-colors flex items-center gap-1"
                          title="Reject with Remarks"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Actioned</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
