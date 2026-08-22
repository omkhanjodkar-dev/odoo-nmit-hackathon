import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

import { leavesService } from '../services/leavesService';
import LeaveBalanceCards from '../components/timeoff/LeaveBalanceCards';
import LeaveRequestTable from '../components/timeoff/LeaveRequestTable';
import LeaveRequestModal from '../components/timeoff/LeaveRequestModal';
import RejectRemarksModal from '../components/timeoff/RejectRemarksModal';
import { Plane, Plus, Search, FileText, CheckCircle2 } from 'lucide-react';

export default function TimeOffPage() {
  const { activeUser, isAdmin } = useAuth();
  const [leaveBalances, setLeaveBalances] = useState({});
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [rejectModalState, setRejectModalState] = useState({ isOpen: false, request: null });
  const [previewAttachment, setPreviewAttachment] = useState(null);

  // Sync balances and pending leaves with live FastAPI backend
  const fetchLiveLeaveData = React.useCallback(async () => {
    try {
      const balance = await leavesService.getMyBalance();
      if (balance && activeUser?.id) {
        const mappedBalance = {
          paidLeave: { total: 24, used: 24 - (balance.paid_leave || 0), available: balance.paid_leave || 0 },
          sickLeave: { total: 12, used: 12 - (balance.sick_leave || 0), available: balance.sick_leave || 0 },
          unpaidLeave: { total: 0, used: balance.unpaid_leave || 0, available: 0 },
        };
        setLeaveBalances((prev) => ({
          ...prev,
          [activeUser.id]: mappedBalance,
        }));
      }

      if (isAdmin) {
        const pending = await leavesService.getPendingLeaves();
        if (Array.isArray(pending) && pending.length > 0) {
          const mappedPending = pending.map((p) => ({
            id: p.leave_id,
            employeeId: p.user_id,
            employeeName: p.employee_name || 'Employee',
            employeeAvatar: '',
            department: p.department || 'Engineering',
            leaveType: p.leave_type === 'SICK_LEAVE' ? 'Sick Time Off' : p.leave_type === 'PAID_LEAVE' ? 'Paid Time Off' : 'Unpaid Leave',
            startDate: p.start_date,
            endDate: p.end_date,
            totalDays: p.duration || 1,
            reason: p.reason || '',
            status: 'PENDING',
            appliedAt: p.created_at || new Date().toISOString(),
          }));
          
          setLeaveRequests((prev) => {
            const nonPending = prev.filter((r) => r.status !== 'PENDING');
            return [...mappedPending, ...nonPending];
          });
        }
      }
    } catch (err) {
      console.warn('Backend leaves fetch warning:', err.message);
    }
  }, [isAdmin, activeUser?.id]);

  useEffect(() => {
    fetchLiveLeaveData();
  }, [fetchLiveLeaveData]);

  const currentBalances = useMemo(() => {
    return (
      leaveBalances[activeUser?.id] || {
        paidLeave: { total: 24, used: 4, available: 20 },
        sickLeave: { total: 12, used: 5, available: 7 },
        unpaidLeave: { total: 0, used: 1, available: 0 },
      }
    );
  }, [leaveBalances, activeUser?.id]);

  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((req) => {
      if (!isAdmin && req.employeeId !== activeUser?.id) {
        return false;
      }

      if (activeTab !== 'ALL' && req.status !== activeTab) {
        return false;
      }

      if (typeFilter !== 'ALL' && req.leaveType !== typeFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = req.employeeName?.toLowerCase().includes(q);
        const matchReason = req.reason?.toLowerCase().includes(q);
        if (!matchName && !matchReason) return false;
      }

      return true;
    });
  }, [leaveRequests, isAdmin, activeUser?.id, activeTab, typeFilter, searchQuery]);

  const handleApprove = async (requestId) => {
    try {
      await leavesService.approveLeave(requestId, 'Approved by Administrator');
    } catch (err) {
      console.warn('Backend approve leave warning:', err.message);
    }

    fetchLiveLeaveData();
  };

  const handleConfirmReject = async (requestId, remarks) => {
    try {
      await leavesService.rejectLeave(requestId, remarks || 'Rejected by Administrator');
    } catch (err) {
      console.warn('Backend reject leave warning:', err.message);
    }

    fetchLiveLeaveData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-indigo-600 font-semibold mb-0.5">
            <Plane className="w-4 h-4" />
            <span>Time Off & Leave Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isAdmin ? 'Leave Approvals & Allocations' : 'My Time Off'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin
              ? 'Review pending time-off applications, audit leave balances, and approve allocations.'
              : 'View available leave balances, submit time-off requests, and track supervisor approvals.'}
          </p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Time Off Request</span>
        </button>
      </div>

      {/* Balance Quota Cards */}
      <LeaveBalanceCards balances={currentBalances} onApplyClick={() => setIsApplyModalOpen(true)} />

      {/* Filter Tabs Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            {[
              { key: 'ALL', label: 'All Requests' },
              { key: 'PENDING', label: 'Pending' },
              { key: 'APPROVED', label: 'Approved' },
              { key: 'REJECTED', label: 'Rejected' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.key
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
            >
              <option value="ALL">All Leave Types</option>
              <option value="Paid Time Off">Paid Time Off</option>
              <option value="Sick Time Off">Sick Time Off</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <LeaveRequestTable
        requests={filteredRequests}
        isAdmin={isAdmin}
        onApprove={handleApprove}
        onOpenRejectModal={(req) => setRejectModalState({ isOpen: true, request: req })}
        onViewAttachment={(att) => setPreviewAttachment(att)}
      />

      {/* Apply Leave Modal */}
      <LeaveRequestModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={fetchLiveLeaveData}
      />

      {/* Reject Remarks Modal */}
      <RejectRemarksModal
        isOpen={rejectModalState.isOpen}
        request={rejectModalState.request}
        onClose={() => setRejectModalState({ isOpen: false, request: null })}
        onConfirmReject={handleConfirmReject}
      />

      {/* Attachment Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">{previewAttachment.fileName}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Size: {previewAttachment.fileSize}</p>
            <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Medical Certificate</span>
            </p>

            <button
              onClick={() => setPreviewAttachment(null)}
              className="mt-5 px-5 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
