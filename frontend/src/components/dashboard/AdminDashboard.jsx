import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage, STORAGE_KEYS } from '../../data/storage';
import RejectRemarksModal from '../timeoff/RejectRemarksModal';
import {
  Users,
  CheckCircle2,
  UserX,
  Plane,
  Clock,
  Check,
  X,
  ArrowRight,
  TrendingUp,
  Building,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser] = useState(() => storage.getCurrentUser());
  const [employees, setEmployees] = useState(() => storage.getEmployees());
  const [attendance, setAttendance] = useState(() => storage.getAttendance());
  const [leaveRequests, setLeaveRequests] = useState(() => storage.getLeaveRequests());
  const [rejectModalState, setRejectModalState] = useState({ isOpen: false, request: null });

  useEffect(() => {
    const unsubEmp = storage.subscribe(STORAGE_KEYS.EMPLOYEES, (e) => e && setEmployees(e));
    const unsubAtt = storage.subscribe(STORAGE_KEYS.ATTENDANCE, (a) => a && setAttendance(a));
    const unsubReq = storage.subscribe(STORAGE_KEYS.LEAVE_REQUESTS, (r) => r && setLeaveRequests(r));

    return () => {
      unsubEmp();
      unsubAtt();
      unsubReq();
    };
  }, []);

  // Compute Metrics for Today
  const totalEmployeesCount = employees.length;
  const presentTodayCount = employees.filter((e) => e.status === 'present').length;
  const onLeaveTodayCount = employees.filter((e) => e.status === 'on_leave').length;
  const absentTodayCount = employees.filter((e) => e.status === 'absent').length;
  const pendingLeaves = leaveRequests.filter((r) => r.status === 'PENDING');

  // Approve Handler
  const handleApprove = (requestId) => {
    storage.update(STORAGE_KEYS.LEAVE_REQUESTS, (requests = []) => {
      const targetReq = requests.find((r) => r.id === requestId);
      if (!targetReq) return requests;

      // Update Leave Balances
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

  // Reject Handler
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
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-purple-950 to-purple-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30">
              HR Administration & Executive Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Organization Overview
          </h1>
          <p className="text-sm text-gray-300 mt-1 max-w-xl">
            Real-time workforce attendance tracking, pending leave approval queues, and staff directory status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/attendance')}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
          >
            Attendance Grid
          </button>
          <button
            onClick={() => navigate('/time-off')}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-colors"
          >
            Leave Queue ({pendingLeaves.length})
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Employees */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Total Staff</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalEmployeesCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Present Today</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{presentTodayCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* On Leave */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">On Leave</p>
            <p className="text-2xl font-bold text-sky-600 mt-1">{onLeaveTodayCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
            <Plane className="w-5 h-5" />
          </div>
        </div>

        {/* Absent */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Absent</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{absentTodayCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <UserX className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Approvals</p>
            <p className="text-2xl font-bold text-purple-700 mt-1">{pendingLeaves.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-800">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid: Pending Approvals Queue & Real-time Attendance Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals Queue (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>
              <h3 className="font-bold text-gray-900 text-base">Pending Leave Approvals Queue</h3>
            </div>
            <button
              onClick={() => navigate('/time-off')}
              className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
            >
              <span>Manage All ({pendingLeaves.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingLeaves.length === 0 ? (
            <div className="py-10 text-center text-gray-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400 stroke-1" />
              <p className="font-semibold text-gray-600">All caught up!</p>
              <p className="text-xs text-gray-400 mt-0.5">No pending time-off requests require your review.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingLeaves.map((req) => (
                <div key={req.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={req.employeeAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={req.employeeName}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 text-sm">{req.employeeName}</p>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                          {req.leaveType}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {req.startDate} to {req.endDate} &bull;{' '}
                        <span className="font-semibold text-purple-700">{req.totalDays} Days</span>
                      </p>
                      {req.reason && (
                        <p className="text-xs text-gray-600 mt-1 italic">&ldquo;{req.reason}&rdquo;</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                      title="Approve"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => setRejectModalState({ isOpen: true, request: req })}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors"
                      title="Reject"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Employee Status Feed (1 col) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-700" />
              <span>Today's Staff Status</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              {presentTodayCount}/{totalEmployeesCount} Present
            </span>
          </div>

          <div className="divide-y divide-gray-100 max-h-[380px] overflow-y-auto pr-1">
            {employees.map((emp) => (
              <div key={emp.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        emp.status === 'present'
                          ? 'bg-emerald-500'
                          : emp.status === 'on_leave'
                          ? 'bg-sky-500'
                          : 'bg-amber-500'
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 leading-none">{emp.name}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{emp.department}</p>
                  </div>
                </div>

                <div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      emp.status === 'present'
                        ? 'bg-emerald-50 text-emerald-700'
                        : emp.status === 'on_leave'
                        ? 'bg-sky-50 text-sky-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {emp.status === 'present'
                      ? '🟢 Present'
                      : emp.status === 'on_leave'
                      ? '✈️ On Leave'
                      : '🟡 Absent'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reject Remarks Modal */}
      <RejectRemarksModal
        isOpen={rejectModalState.isOpen}
        request={rejectModalState.request}
        onClose={() => setRejectModalState({ isOpen: false, request: null })}
        onConfirmReject={handleConfirmReject}
      />
    </div>
  );
}
