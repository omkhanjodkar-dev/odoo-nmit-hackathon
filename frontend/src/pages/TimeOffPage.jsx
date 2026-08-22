import React, { useState, useEffect, useMemo } from 'react';
import { storage, STORAGE_KEYS } from '../data/storage';
import LeaveBalanceCards from '../components/timeoff/LeaveBalanceCards';
import LeaveRequestTable from '../components/timeoff/LeaveRequestTable';
import LeaveRequestModal from '../components/timeoff/LeaveRequestModal';
import RejectRemarksModal from '../components/timeoff/RejectRemarksModal';
import { Plus, Plane, Search, Filter, ShieldCheck, CheckCircle2, FileText } from 'lucide-react';

export default function TimeOffPage() {
  const [currentUser, setCurrentUser] = useState(() => storage.getCurrentUser());
  const [leaveBalances, setLeaveBalances] = useState(() => storage.getLeaveBalances());
  const [leaveRequests, setLeaveRequests] = useState(() => storage.getLeaveRequests());
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [rejectModalState, setRejectModalState] = useState({ isOpen: false, request: null });
  const [previewAttachment, setPreviewAttachment] = useState(null);

  const isAdmin = currentUser?.role === 'ADMIN_HR';

  useEffect(() => {
    const unsubBalances = storage.subscribe(STORAGE_KEYS.LEAVE_BALANCES, (newBalances) => {
      if (newBalances) setLeaveBalances(newBalances);
    });

    const unsubRequests = storage.subscribe(STORAGE_KEYS.LEAVE_REQUESTS, (newRequests) => {
      if (newRequests) setLeaveRequests(newRequests);
    });

    const unsubUser = storage.subscribe(STORAGE_KEYS.CURRENT_USER, (newUser) => {
      if (newUser) setCurrentUser(newUser);
    });

    return () => {
      unsubBalances();
      unsubRequests();
      unsubUser();
    };
  }, []);

  // Filter requests based on role, tab, search query, and type
  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((req) => {
      // Role filtering: Employee sees only their own, Admin sees all
      if (!isAdmin && req.employeeId !== currentUser?.id) {
        return false;
      }

      // Tab filter (ALL, PENDING, APPROVED, REJECTED)
      if (activeTab !== 'ALL' && req.status !== activeTab) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'ALL' && req.leaveType !== typeFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = req.employeeName?.toLowerCase().includes(query);
        const matchReason = req.reason?.toLowerCase().includes(query);
        const matchDept = req.department?.toLowerCase().includes(query);
        if (!matchName && !matchReason && !matchDept) return false;
      }

      return true;
    });
  }, [leaveRequests, isAdmin, currentUser?.id, activeTab, typeFilter, searchQuery]);

  // Current user's leave balances
  const currentBalances = useMemo(() => {
    return (
      leaveBalances[currentUser?.id] || {
        paidLeave: { total: 24, used: 4, available: 20 },
        sickLeave: { total: 12, used: 5, available: 7 },
        unpaidLeave: { total: 0, used: 1, available: 0 },
      }
    );
  }, [leaveBalances, currentUser?.id]);

  // Admin Approve Action
  const handleApprove = (requestId) => {
    storage.update(STORAGE_KEYS.LEAVE_REQUESTS, (requests = []) => {
      const targetReq = requests.find((r) => r.id === requestId);
      if (!targetReq) return requests;

      // Deduct balance from employee
      storage.update(STORAGE_KEYS.LEAVE_BALANCES, (balances = {}) => {
        const empBal = balances[targetReq.employeeId];
        if (!empBal) return balances;

        const updated = { ...balances };
        if (targetReq.leaveType === 'Paid Time Off') {
          updated[targetReq.employeeId].paidLeave.used += targetReq.totalDays;
          updated[targetReq.employeeId].paidLeave.available = Math.max(
            0,
            updated[targetReq.employeeId].paidLeave.available - targetReq.totalDays
          );
        } else if (targetReq.leaveType === 'Sick Time Off') {
          updated[targetReq.employeeId].sickLeave.used += targetReq.totalDays;
          updated[targetReq.employeeId].sickLeave.available = Math.max(
            0,
            updated[targetReq.employeeId].sickLeave.available - targetReq.totalDays
          );
        } else if (targetReq.leaveType === 'Unpaid Leave') {
          updated[targetReq.employeeId].unpaidLeave.used += targetReq.totalDays;
        }
        return updated;
      });

      return requests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'APPROVED',
              reviewedBy: currentUser?.id,
              reviewedByName: currentUser?.name,
              reviewedAt: new Date().toISOString(),
              adminRemarks: 'Approved by Administrator.',
            }
          : r
      );
    });
  };

  // Admin Reject Action (Triggers Remarks Modal)
  const handleOpenRejectModal = (request) => {
    setRejectModalState({ isOpen: true, request });
  };

  const handleConfirmReject = (requestId, remarks) => {
    storage.update(STORAGE_KEYS.LEAVE_REQUESTS, (requests = []) =>
      requests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'REJECTED',
              reviewedBy: currentUser?.id,
              reviewedByName: currentUser?.name,
              reviewedAt: new Date().toISOString(),
              adminRemarks: remarks,
            }
          : r
      )
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-purple-700 font-semibold mb-1">
            <Plane className="w-4 h-4" />
            <span>Time Off & Leave Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {isAdmin ? 'Leave Approvals & Allocations' : 'Time Off'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin
              ? 'Review pending time-off applications, audit leave balances, and approve requests.'
              : 'View available leave balances, submit time-off requests, and track approval status.'}
          </p>
        </div>

        {/* Action Button: Apply Leave */}
        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-sm font-bold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Time Off Request</span>
        </button>
      </div>

      {/* Leave Quota Cards */}
      <LeaveBalanceCards balances={currentBalances} onApplyClick={() => setIsApplyModalOpen(true)} />

      {/* Toolbar & Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-lg max-w-fit">
            {[
              { key: 'ALL', label: 'All Requests' },
              { key: 'PENDING', label: 'Pending' },
              { key: 'APPROVED', label: 'Approved' },
              { key: 'REJECTED', label: 'Rejected' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === tab.key
                    ? 'bg-white text-purple-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Type Select */}
          <div className="flex items-center flex-wrap gap-2.5">
            <div className="relative min-w-[200px] sm:w-60">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-3 pr-8 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="ALL">All Leave Types</option>
              <option value="Paid Time Off">Paid Time Off</option>
              <option value="Sick Time Off">Sick Time Off</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <LeaveRequestTable
        requests={filteredRequests}
        isAdmin={isAdmin}
        onApprove={handleApprove}
        onOpenRejectModal={handleOpenRejectModal}
        onViewAttachment={(att) => setPreviewAttachment(att)}
      />

      {/* Apply Leave Modal */}
      <LeaveRequestModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => {
          setLeaveRequests(storage.getLeaveRequests());
          setLeaveBalances(storage.getLeaveBalances());
        }}
      />

      {/* Admin Rejection Remarks Modal */}
      <RejectRemarksModal
        isOpen={rejectModalState.isOpen}
        request={rejectModalState.request}
        onClose={() => setRejectModalState({ isOpen: false, request: null })}
        onConfirmReject={handleConfirmReject}
      />

      {/* Attachment Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 border border-gray-200 text-center">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">{previewAttachment.fileName}</h3>
            <p className="text-xs text-gray-500 mt-1">Size: {previewAttachment.fileSize}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-2">
              Verified Medical Document / Certificate
            </p>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setPreviewAttachment(null)}
                className="px-5 py-2 text-sm font-semibold bg-purple-700 hover:bg-purple-800 text-white rounded-lg transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
