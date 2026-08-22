import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

import { attendanceService } from '../services/attendanceService';
import AttendanceMetrics from '../components/attendance/AttendanceMetrics';
import AttendanceToolbar from '../components/attendance/AttendanceToolbar';
import AttendanceTable from '../components/attendance/AttendanceTable';
import PunchOverrideModal from '../components/attendance/PunchOverrideModal';
import SystrayAttendance from '../components/attendance/SystrayAttendance';
import { Calendar } from 'lucide-react';

export default function AttendancePage() {
  const { activeUser, isAdmin } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('2025-10');
  const [currentDateIndex, setCurrentDateIndex] = useState(22);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [selectedRecordToEdit, setSelectedRecordToEdit] = useState(null);

  const fetchLiveAttendance = React.useCallback(async () => {
    try {
      if (isAdmin) {
        const rows = await attendanceService.getAllAttendance();
        if (Array.isArray(rows) && rows.length > 0) {
          const mapped = rows.map((r, idx) => ({
            id: r.attendance_id || `att-srv-${idx}`,
            employeeId: r.user_id,
            employeeName: r.employee_name || 'Employee',
            employeeAvatar: r.avatar_url || '',
            department: r.department || 'Engineering',
            date: r.date,
            checkIn: r.check_in_time ? new Date(r.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
            checkOut: r.check_out_time ? new Date(r.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
            workHours: `${Math.floor(r.hours_worked || 0)}h ${Math.floor(((r.hours_worked || 0) % 1) * 60)}m`,
            extraHours: '00:00',
            status: (r.status || 'PRESENT').toUpperCase(),
          }));
          setAttendanceRecords(mapped);
        }
      } else {
        const myLogs = await attendanceService.getMyLogs();
        if (myLogs?.records && myLogs.records.length > 0) {
          const mapped = myLogs.records.map((r, idx) => ({
            id: r.id || `att-srv-${idx}`,
            employeeId: activeUser?.id,
            employeeName: activeUser?.name || 'Me',
            employeeAvatar: activeUser?.avatar || '',
            department: activeUser?.department || 'Engineering',
            date: r.date,
            checkIn: r.check_in ? new Date(r.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
            checkOut: r.check_out ? new Date(r.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
            workHours: `${Math.floor(r.work_hours || 0)}h`,
            extraHours: '00:00',
            status: (r.status || 'PRESENT').toUpperCase(),
          }));
          setAttendanceRecords(mapped);
        }
      }
    } catch (err) {
      console.warn('Backend attendance fetch warning:', err.message);
    }
  }, [isAdmin, activeUser?.id]);

  useEffect(() => {
    fetchLiveAttendance();
  }, [fetchLiveAttendance]);

  const currentDateStr = useMemo(() => {
    const year = selectedMonth.split('-')[0] || '2025';
    const month = selectedMonth.split('-')[1] || '10';
    const day = currentDateIndex.toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [selectedMonth, currentDateIndex]);

  const currentDateDisplay = useMemo(() => {
    const date = new Date(currentDateStr);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
  }, [currentDateStr]);

  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((record) => {
      if (!isAdmin && record.employeeId !== activeUser?.id) {
        return false;
      }

      if (statusFilter !== 'ALL' && record.status !== statusFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = record.employeeName?.toLowerCase().includes(q);
        const matchDept = record.department?.toLowerCase().includes(q);
        if (!matchName && !matchDept) return false;
      }

      return true;
    });
  }, [attendanceRecords, isAdmin, activeUser?.id, statusFilter, searchQuery]);

  const metrics = useMemo(() => {
    const userRecords = isAdmin
      ? attendanceRecords
      : attendanceRecords.filter((r) => r.employeeId === activeUser?.id);

    const presentCount = userRecords.filter((r) => r.status === 'PRESENT' || r.status === 'OVERRIDDEN').length;
    const absentCount = userRecords.filter((r) => r.status === 'ABSENT').length;
    const leaveCount = userRecords.filter((r) => r.status === 'ON_LEAVE').length;

    return {
      totalWorkingDays: 22,
      presentDays: presentCount,
      absentDays: absentCount,
      leaveDays: leaveCount,
      totalWorkHours: `${(presentCount * 8.5).toFixed(0)}:00`,
      totalExtraHours: '04:30',
    };
  }, [attendanceRecords, isAdmin, activeUser?.id]);

  const handleOpenOverride = (record = null) => {
    setSelectedRecordToEdit(record);
    setIsOverrideModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-indigo-600 font-semibold mb-0.5">
            <Calendar className="w-4 h-4" />
            <span>Time & Attendance Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isAdmin ? 'Organization Attendance' : 'My Attendance Logs'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin
              ? 'Real-time clock-in audits, working hours matrix, and missing punch adjustments.'
              : 'Track your daily check-in, check-out, working hours, and computed monthly payable days.'}
          </p>
        </div>

        {/* Live Attendance Clock in Header */}
        <div className="w-full md:w-auto">
          <SystrayAttendance />
        </div>
      </div>

      {/* Metrics Cards */}
      <AttendanceMetrics
        totalWorkingDays={metrics.totalWorkingDays}
        presentDays={metrics.presentDays}
        absentDays={metrics.absentDays}
        leaveDays={metrics.leaveDays}
        totalWorkHours={metrics.totalWorkHours}
        totalExtraHours={metrics.totalExtraHours}
      />

      {/* Interactive Toolbar */}
      <AttendanceToolbar
        currentDate={currentDateDisplay}
        onPreviousDate={() => setCurrentDateIndex((p) => Math.max(1, p - 1))}
        onNextDate={() => setCurrentDateIndex((p) => Math.min(31, p + 1))}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onOpenOverrideModal={() => handleOpenOverride(null)}
        isAdmin={isAdmin}
        totalRecordsCount={filteredRecords.length}
      />

      {/* Attendance Records Table */}
      <AttendanceTable
        records={filteredRecords}
        showEmployeeColumn={isAdmin}
        onEditRecord={handleOpenOverride}
        isAdmin={isAdmin}
      />

      {/* Punch Override Modal */}
      <PunchOverrideModal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        initialRecord={selectedRecordToEdit}
        onSuccess={fetchLiveAttendance}
      />
    </div>
  );
}
