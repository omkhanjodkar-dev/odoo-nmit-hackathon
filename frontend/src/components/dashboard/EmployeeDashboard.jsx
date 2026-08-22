import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { storage, STORAGE_KEYS } from '../../data/storage';
import SystrayAttendance from '../attendance/SystrayAttendance';
import {
  Plane,
  Calendar,
  DollarSign,
  Plus,
  CheckCircle2,
  AlertCircle,
  Gift
} from 'lucide-react';

export default function EmployeeDashboard() {
  const { activeUser } = useAuth();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState(() => storage.getAttendance());
  const [leaveBalances, setLeaveBalances] = useState(() => storage.getLeaveBalances());

  useEffect(() => {
    const unsubAtt = storage.subscribe(STORAGE_KEYS.ATTENDANCE, (a) => a && setAttendance(a));
    const unsubLeaves = storage.subscribe(STORAGE_KEYS.LEAVE_BALANCES, (l) => l && setLeaveBalances(l));

    return () => {
      unsubAtt();
      unsubLeaves();
    };
  }, []);

  const userBalances = useMemo(() => {
    return (
      leaveBalances[activeUser?.id] || {
        paidLeave: { total: 24, used: 4, available: 20 },
        sickLeave: { total: 12, used: 5, available: 7 },
        unpaidLeave: { total: 0, used: 1, available: 0 },
      }
    );
  }, [leaveBalances, activeUser?.id]);

  const userRecentAttendance = useMemo(() => {
    return attendance
      .filter((r) => r.employeeId === activeUser?.id)
      .slice(0, 5);
  }, [attendance, activeUser?.id]);

  const upcomingHolidays = [
    { name: 'Diwali / Deepawali', date: '01 Nov 2025', day: 'Saturday' },
    { name: 'Guru Nanak Jayanti', date: '15 Nov 2025', day: 'Saturday' },
    { name: 'Christmas Day', date: '25 Dec 2025', day: 'Thursday' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={activeUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={activeUser?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-inner"
          />
          <div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
              {activeUser?.department || 'Engineering'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
              Welcome back, {activeUser?.firstName || activeUser?.name}!
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
              {activeUser?.designation} • Emp ID: <span className="font-mono font-bold text-white">{activeUser?.employeeId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/time-off')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Apply Time Off</span>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 transition-all"
          >
            <span>My Profile</span>
          </button>
        </div>
      </div>

      {/* Live Punch Clock Widget */}
      <SystrayAttendance />

      {/* Leave Quotas & Attendance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Paid Leave Balance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Paid Time Off</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Plane className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-600">{userBalances.paidLeave.available}</span>
            <span className="text-xs font-bold text-slate-400">/ {userBalances.paidLeave.total} Days Total</span>
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Available for vacation</p>
        </div>

        {/* Sick Leave Balance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sick Time Off</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">{userBalances.sickLeave.available}</span>
            <span className="text-xs font-bold text-slate-400">/ {userBalances.sickLeave.total} Days</span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">{userBalances.sickLeave.used} days taken this year</p>
        </div>

        {/* Days Present this Month */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Days Present</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">20</span>
            <span className="text-xs font-bold text-slate-400">/ 22 Days</span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">October 2025 cycle</p>
        </div>

        {/* Base Monthly Salary */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Base Salary</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              ₹{(activeUser?.salary_structure?.month_wage || 50000).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs text-indigo-600 font-semibold mt-1">View breakdown in Profile</p>
        </div>
      </div>

      {/* Lower Row: Recent Attendance & Upcoming Holidays */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Attendance Logs */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Recent Daily Clockings
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Your past work session duration and punch logs</p>
            </div>
            <button
              onClick={() => navigate('/attendance')}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Full Attendance Logs &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Check In</th>
                  <th className="py-2.5 px-3">Check Out</th>
                  <th className="py-2.5 px-3">Work Hours</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {userRecentAttendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">{rec.date}</td>
                    <td className="py-3 px-3 text-slate-600">{rec.checkIn || '-'}</td>
                    <td className="py-3 px-3 text-slate-600">{rec.checkOut || '-'}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{rec.workHours}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Gift className="w-5 h-5 text-indigo-600" />
              Upcoming Holidays
            </h2>
            <span className="text-[11px] font-bold text-slate-400">2025</span>
          </div>

          <div className="space-y-3">
            {upcomingHolidays.map((holiday, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800">{holiday.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{holiday.day}</p>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  {holiday.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
