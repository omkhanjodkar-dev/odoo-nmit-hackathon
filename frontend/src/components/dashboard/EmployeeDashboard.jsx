import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage, STORAGE_KEYS } from '../../data/storage';
import SystrayAttendance from '../attendance/SystrayAttendance';
import {
  Calendar,
  Clock,
  Plane,
  CreditCard,
  User,
  AlertCircle,
  CheckCircle2,
  Bell,
  ArrowRight,
  TrendingUp,
  FileCheck2,
} from 'lucide-react';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => storage.getCurrentUser());
  const [leaveBalances, setLeaveBalances] = useState(() => storage.getLeaveBalances());
  const [attendance, setAttendance] = useState(() => storage.getAttendance());
  const [leaveRequests, setLeaveRequests] = useState(() => storage.getLeaveRequests());

  useEffect(() => {
    const unsubUser = storage.subscribe(STORAGE_KEYS.CURRENT_USER, (user) => {
      if (user) setCurrentUser(user);
    });
    const unsubBal = storage.subscribe(STORAGE_KEYS.LEAVE_BALANCES, (bal) => {
      if (bal) setLeaveBalances(bal);
    });
    const unsubAtt = storage.subscribe(STORAGE_KEYS.ATTENDANCE, (att) => {
      if (att) setAttendance(att);
    });
    const unsubReq = storage.subscribe(STORAGE_KEYS.LEAVE_REQUESTS, (req) => {
      if (req) setLeaveRequests(req);
    });

    return () => {
      unsubUser();
      unsubBal();
      unsubAtt();
      unsubReq();
    };
  }, []);

  const empBalances = leaveBalances[currentUser?.id] || {
    paidLeave: { total: 24, used: 4, available: 20 },
    sickLeave: { total: 12, used: 5, available: 7 },
  };

  const myRecentAttendance = attendance
    .filter((r) => r.employeeId === currentUser?.id)
    .slice(0, 4);

  const myRecentLeaves = leaveRequests
    .filter((r) => r.employeeId === currentUser?.id)
    .slice(0, 3);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/40 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                  {currentUser?.employeeId}
                </span>
                <span className="text-xs font-semibold text-purple-200">
                  {currentUser?.department}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
                Welcome back, {currentUser?.name}!
              </h1>
              <p className="text-sm text-purple-100 mt-1 max-w-lg">
                {currentUser?.designation} &bull; {currentUser?.company} ({currentUser?.location})
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-200">Today's Date</p>
            <p className="text-lg font-bold font-mono">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Ambient Decorative Background Circles */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-purple-500/20 pointer-events-none" />
      </div>

      {/* Grid: Live Attendance Systray Clock & Leave Balance Glance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Attendance Clock Card */}
        <div className="lg:col-span-2">
          <SystrayAttendance />
        </div>

        {/* Leave Balances Summary Tile */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Plane className="w-4 h-4 text-purple-600" />
                <span>Leave Balance Summary</span>
              </h3>
              <button
                onClick={() => navigate('/time-off')}
                className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-0.5"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 bg-purple-50/60 rounded-lg">
                <div>
                  <p className="text-xs font-bold text-purple-900">Paid Time Off</p>
                  <p className="text-[10px] text-gray-500">{empBalances.paidLeave.used} of {empBalances.paidLeave.total} used</p>
                </div>
                <span className="text-lg font-extrabold text-purple-700">
                  {empBalances.paidLeave.available} <span className="text-xs font-normal">days left</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-rose-50/60 rounded-lg">
                <div>
                  <p className="text-xs font-bold text-rose-900">Sick Time Off</p>
                  <p className="text-[10px] text-gray-500">{empBalances.sickLeave.used} of {empBalances.sickLeave.total} used</p>
                </div>
                <span className="text-lg font-extrabold text-rose-600">
                  {empBalances.sickLeave.available} <span className="text-xs font-normal">days left</span>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/time-off')}
            className="w-full mt-3 py-2 text-xs font-bold text-center text-purple-700 hover:bg-purple-50 rounded-lg border border-purple-200 transition-colors"
          >
            + Request Time Off
          </button>
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
          Quick Workflows
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/attendance')}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Attendance Logs</h3>
            <p className="text-xs text-gray-500 mt-0.5">View hours & calendar</p>
          </button>

          <button
            onClick={() => navigate('/time-off')}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Plane className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Time Off Requests</h3>
            <p className="text-xs text-gray-500 mt-0.5">Apply & track leave status</p>
          </button>

          <button
            onClick={() => navigate('/payroll')}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Salary Breakdown</h3>
            <p className="text-xs text-gray-500 mt-0.5">Gross, PF & net wage</p>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">My Profile</h3>
            <p className="text-xs text-gray-500 mt-0.5">Resume, skills & statutory</p>
          </button>
        </div>
      </div>

      {/* Feeds: Recent Attendance & Leave Status Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-700" />
              <span>Recent Attendance Punches</span>
            </h3>
            <button
              onClick={() => navigate('/attendance')}
              className="text-xs font-semibold text-purple-700 hover:underline"
            >
              Full Log
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {myRecentAttendance.map((rec) => (
              <div key={rec.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-gray-900">{rec.date}</p>
                  <p className="text-gray-500 font-mono mt-0.5">
                    In: {rec.checkIn} &bull; Out: {rec.checkOut}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-gray-900 block">{rec.workHours} hrs</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                      rec.status === 'PRESENT'
                        ? 'bg-emerald-50 text-emerald-700'
                        : rec.status === 'HALF_DAY'
                        ? 'bg-orange-50 text-orange-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {rec.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leave Requests Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Plane className="w-4 h-4 text-purple-700" />
              <span>Recent Time Off Applications</span>
            </h3>
            <button
              onClick={() => navigate('/time-off')}
              className="text-xs font-semibold text-purple-700 hover:underline"
            >
              All Requests
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {myRecentLeaves.map((lreq) => (
              <div key={lreq.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-gray-900">{lreq.leaveType}</p>
                  <p className="text-gray-500 mt-0.5">
                    {lreq.startDate} to {lreq.endDate} ({lreq.totalDays} Days)
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      lreq.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : lreq.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {lreq.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
