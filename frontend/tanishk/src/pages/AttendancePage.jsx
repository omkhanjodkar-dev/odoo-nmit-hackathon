import React, { useState, useEffect, useMemo } from 'react';
import { storage, STORAGE_KEYS } from '../data/storage';
import AttendanceToolbar from '../components/attendance/AttendanceToolbar';
import AttendanceMetrics from '../components/attendance/AttendanceMetrics';
import AttendanceTable from '../components/attendance/AttendanceTable';
import PunchOverrideModal from '../components/attendance/PunchOverrideModal';
import SystrayAttendance from '../components/attendance/SystrayAttendance';
import { Calendar, UserCheck } from 'lucide-react';

export default function AttendancePage() {
  const [currentUser, setCurrentUser] = useState(() => storage.getCurrentUser());
  const [attendanceRecords, setAttendanceRecords] = useState(() => storage.getAttendance());
  const [selectedMonth, setSelectedMonth] = useState('2025-10');
  const [currentDateIndex, setCurrentDateIndex] = useState(22); // Day 22 for demo
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [selectedRecordToEdit, setSelectedRecordToEdit] = useState(null);

  const isAdmin = currentUser?.role === 'ADMIN_HR';

  // Listen to storage changes
  useEffect(() => {
    const unsubAttendance = storage.subscribe(STORAGE_KEYS.ATTENDANCE, (newRecords) => {
      if (newRecords) setAttendanceRecords(newRecords);
    });

    const unsubUser = storage.subscribe(STORAGE_KEYS.CURRENT_USER, (newUser) => {
      if (newUser) setCurrentUser(newUser);
    });

    return () => {
      unsubAttendance();
      unsubUser();
    };
  }, []);

  // Format the current active navigation date label
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

  const handlePreviousDate = () => {
    setCurrentDateIndex((prev) => Math.max(1, prev - 1));
  };

  const handleNextDate = () => {
    setCurrentDateIndex((prev) => Math.min(31, prev + 1));
  };

  // Filter records based on role, search, month, and status
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((record) => {
      // Role filtering: Employee sees only their own records, Admin sees all
      if (!isAdmin && record.employeeId !== currentUser?.id) {
        return false;
      }

      // Month filtering
      if (selectedMonth && record.date && !record.date.startsWith(selectedMonth)) {
        return false;
      }

      // Status filtering
      if (statusFilter !== 'ALL' && record.status !== statusFilter) {
        return false;
      }

      // Search query filtering
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = record.employeeName?.toLowerCase().includes(query);
        const matchDept = record.department?.toLowerCase().includes(query);
        const matchDate = record.date?.includes(query);
        if (!matchName && !matchDept && !matchDate) return false;
      }

      return true;
    });
  }, [attendanceRecords, isAdmin, currentUser?.id, selectedMonth, statusFilter, searchQuery]);

  // Compute Metrics
  const metrics = useMemo(() => {
    const userRecords = isAdmin
      ? attendanceRecords
      : attendanceRecords.filter((r) => r.employeeId === currentUser?.id);

    const totalScheduled = 22;
    const presentCount = userRecords.filter((r) => r.status === 'PRESENT' || r.status === 'OVERRIDDEN').length;
    const absentCount = userRecords.filter((r) => r.status === 'ABSENT').length;
    const leaveCount = userRecords.filter((r) => r.status === 'ON_LEAVE' || r.status === 'HALF_DAY').length;

    return {
      totalWorkingDays: totalScheduled,
      presentDays: presentCount,
      absentDays: absentCount,
      leaveDays: leaveCount,
      totalWorkHours: `${(presentCount * 8.5).toFixed(0)}:00`,
      totalExtraHours: '04:30',
    };
  }, [attendanceRecords, isAdmin, currentUser?.id]);

  const handleOpenOverride = (record = null) => {
    setSelectedRecordToEdit(record);
    setIsOverrideModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header with Systray Widget */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-purple-700 font-semibold mb-1">
            <Calendar className="w-4 h-4" />
            <span>Time & Attendance Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {isAdmin ? 'Organization Attendance' : 'My Attendance Logs'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin
              ? 'Real-time daily clockings, working hours matrix, and missed punch adjustments.'
              : 'Track your daily check-in, check-out, working hours, and computed monthly payable days.'}
          </p>
        </div>

        {/* Live Attendance Clock */}
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
        onPreviousDate={handlePreviousDate}
        onNextDate={handleNextDate}
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

      {/* Attendance Table */}
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
        onSuccess={() => {
          setAttendanceRecords(storage.getAttendance());
        }}
      />
    </div>
  );
}
