import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeesService } from '../../services/employeesService';
import { leavesService } from '../../services/leavesService';
import {
  Users,
  UserCheck,
  Plane,
  AlertCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Shield,
  TrendingUp,
  FileCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);

  const fetchData = React.useCallback(async () => {
    try {
      const [empsRes, leavesRes] = await Promise.all([
        employeesService.getEmployees(),
        leavesService.getPendingLeaves()
      ]);
      
      if (Array.isArray(empsRes)) {
        setEmployees(empsRes);
      }
      
      if (Array.isArray(leavesRes)) {
        const mappedLeaves = leavesRes.map(l => ({
          id: l.leave_id,
          employeeId: l.user_id,
          employeeName: l.employee_name || 'Employee',
          employeeAvatar: l.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          department: l.department || 'Engineering',
          leaveType: l.leave_type === 'SICK_LEAVE' ? 'Sick Time Off' : l.leave_type === 'PAID_LEAVE' ? 'Paid Time Off' : 'Unpaid Leave',
          startDate: l.start_date,
          endDate: l.end_date,
          totalDays: l.duration || 1,
          reason: l.reason || '',
          status: 'PENDING',
        }));
        setLeaveRequests(mappedLeaves);
      }
    } catch (err) {
      console.warn('Admin Dashboard fetch error:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalEmployees = employees.length;
  const presentToday = employees.filter((e) => e.status === 'present' || e.attendance_status === 'PRESENT').length;
  const onLeaveToday = employees.filter((e) => e.status === 'on_leave' || e.attendance_status === 'LEAVE').length;
  const absentToday = Math.max(0, totalEmployees - (presentToday + onLeaveToday));

  const pendingRequests = useMemo(() => {
    return leaveRequests.filter((r) => r.status === 'PENDING');
  }, [leaveRequests]);

  const handleApprove = async (requestId) => {
    try {
      await leavesService.approveLeave(requestId);
      fetchData();
    } catch (e) {
      console.warn(e);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await leavesService.rejectLeave(requestId);
      fetchData();
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 backdrop-blur-sm text-xs font-bold text-indigo-300 mb-2 border border-indigo-500/30">
            <Shield className="w-3.5 h-3.5" />
            <span>HR Administration Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Organization Workplace Overview
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Real-time workforce attendance, leave approvals queue, and company-wide compensation metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/employees')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>Employees Directory</span>
          </button>
          <button
            onClick={() => navigate('/payroll')}
            className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 transition-all flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Payroll Structure</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Workforce</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{totalEmployees}</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <span className="font-semibold text-emerald-600">100%</span> active headcount
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Present Today</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">{presentToday}</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <span>🟢 In office / Active clock</span>
          </div>
        </div>

        {/* On Approved Leave */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">On Leave</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Plane className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-sky-600 mt-2">{onLeaveToday}</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <span>✈️ Approved time-off</span>
          </div>
        </div>

        {/* Absent */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Absent Today</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-600 mt-2">{absentToday}</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <span>🟡 No punch logged</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Pending Approvals & Live Punch Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Pending Time Off Requests */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-600" />
                Pending Leave Applications
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Require administrator review and balance allocation</p>
            </div>
            <button
              onClick={() => navigate('/time-off')}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-slate-600">All leave requests reviewed!</p>
              <p className="text-slate-400 mt-0.5">No pending applications awaiting action.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={req.employeeAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={req.employeeName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{req.employeeName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                          {req.leaveType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {req.startDate} to {req.endDate} ({req.totalDays} {req.totalDays === 1 ? 'day' : 'days'})
                      </p>
                      {req.reason && (
                        <p className="text-xs text-slate-600 italic mt-1 line-clamp-1">"{req.reason}"</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Today's Punch Feed */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Today's Punch Feed
            </h2>
            <button
              onClick={() => navigate('/attendance')}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Manage Logs
            </button>
          </div>

          <div className="space-y-2.5">
            {employees.map((emp) => {
              const isPresent = emp.status === 'present' || emp.attendance_status === 'PRESENT';
              const isOnLeave = emp.status === 'on_leave' || emp.attendance_status === 'LEAVE';

              return (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative">
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          isPresent ? 'bg-emerald-500' : isOnLeave ? 'bg-sky-500' : 'bg-amber-500'
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{emp.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{emp.department}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isPresent
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isOnLeave
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {isPresent ? 'Present (09:00)' : isOnLeave ? 'On Leave' : 'Absent'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
