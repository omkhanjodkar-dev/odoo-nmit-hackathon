/**
 * Activity & Attendance Calendar Generator for Dayflow HRMS
 * Produces GitHub / LeetCode style contribution and attendance matrix data.
 */

import { storage, STORAGE_KEYS } from './storage';

// 2025 Public / Corporate Holidays in India
export const PUBLIC_HOLIDAYS_2025 = {
  '2025-01-26': 'Republic Day',
  '2025-03-14': 'Holi',
  '2025-03-31': 'Eid-ul-Fitr',
  '2025-04-14': 'Dr. Ambedkar Jayanti',
  '2025-04-18': 'Good Friday',
  '2025-05-01': 'Maharashtra / Gujarat Day',
  '2025-08-15': 'Independence Day',
  '2025-08-27': 'Ganesh Chaturthi',
  '2025-10-02': 'Gandhi Jayanti',
  '2025-10-21': 'Diwali (Deepavali)',
  '2025-10-22': 'Diwali New Year',
  '2025-11-05': 'Guru Nanak Jayanti',
  '2025-12-25': 'Christmas Day',
};

/**
 * Generate 365 days of attendance activity for a specific employee and year.
 * Integrates real storage records from Attendance and Leaves with deterministic history.
 */
export function getEmployeeActivityData(employeeId, year = 2025) {
  const attendanceRecords = storage.getAttendance() || [];
  const leaveRequests = storage.getLeaveRequests() || [];

  // Map employee specific attendance by date
  const employeeAttendanceMap = {};
  attendanceRecords
    .filter((r) => r.employeeId === employeeId)
    .forEach((r) => {
      employeeAttendanceMap[r.date] = r;
    });

  // Map approved leaves by date range
  const employeeLeaveMap = {};
  leaveRequests
    .filter((r) => r.employeeId === employeeId && r.status === 'APPROVED')
    .forEach((req) => {
      const start = new Date(req.startDate);
      const end = new Date(req.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        employeeLeaveMap[dateStr] = req;
      }
    });

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  const today = new Date('2025-10-22'); // HRMS mock system anchor date

  const days = [];
  let fullDaysCount = 0;
  let halfDaysCount = 0;
  let leavesCount = 0;
  let workingDaysCount = 0;
  let totalHours = 0;

  // Track streaks
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;

  // Simple pseudo-random hash generator for deterministic mock realism
  const pseudoRandom = (seed) => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const idHash = (employeeId || 'emp-1').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isFuture = d > today;
    const holidayName = PUBLIC_HOLIDAYS_2025[dateStr];

    const dayOfYear = Math.floor((d - startDate) / (1000 * 60 * 60 * 24));
    const seed = idHash + dayOfYear * 13;
    const rand = pseudoRandom(seed);

    let status = 'WEEKEND';
    let workHours = 0;
    let workHoursStr = '00:00';
    let checkIn = '-';
    let checkOut = '-';
    let label = 'Weekend';
    let notes = 'Scheduled Weekly Off';

    if (isFuture) {
      status = 'FUTURE';
      label = 'Upcoming';
      notes = 'Future work date';
    } else if (holidayName) {
      status = 'HOLIDAY';
      label = `Holiday: ${holidayName}`;
      notes = `Public Holiday - ${holidayName}`;
    } else if (isWeekend) {
      status = 'WEEKEND';
      label = 'Weekend';
      notes = 'Scheduled Weekly Off';
      // Reset daily streak over weekend without breaking weekday momentum
    } else {
      // Normal weekday
      workingDaysCount++;

      // 1. Check explicit storage attendance
      if (employeeAttendanceMap[dateStr]) {
        const att = employeeAttendanceMap[dateStr];
        if (att.status === 'PRESENT' || att.status === 'OVERRIDDEN') {
          status = 'FULL_DAY';
          workHours = att.workHours ? parseFloat(att.workHours.replace(':', '.')) : 8.5;
          workHoursStr = att.workHours || '08:30';
          checkIn = att.checkIn || '09:00 AM';
          checkOut = att.checkOut !== '-' ? att.checkOut : '06:30 PM';
          label = 'Full Day Present';
          notes = att.notes || 'Biometric check-in verified';
          fullDaysCount++;
          totalHours += workHours;
          tempStreak++;
        } else if (att.status === 'HALF_DAY') {
          status = 'HALF_DAY';
          workHours = 4.5;
          workHoursStr = '04:30';
          checkIn = att.checkIn || '09:00 AM';
          checkOut = '01:30 PM';
          label = 'Half Day';
          notes = 'Half day morning shift';
          halfDaysCount++;
          totalHours += 4.5;
          tempStreak++;
        } else if (att.status === 'ON_LEAVE') {
          status = 'LEAVE';
          label = 'Approved Leave';
          notes = 'Planned time off';
          leavesCount++;
          tempStreak = 0;
        } else {
          status = 'ABSENT';
          label = 'Absent / Off';
          notes = 'Unexcused absence';
          leavesCount++;
          tempStreak = 0;
        }
      }
      // 2. Check explicit approved leave requests
      else if (employeeLeaveMap[dateStr]) {
        const req = employeeLeaveMap[dateStr];
        status = 'LEAVE';
        label = `Leave: ${req.leaveType}`;
        notes = req.reason || 'Approved leave request';
        leavesCount++;
        tempStreak = 0;
      }
      // 3. Fallback realistic deterministic weekday data
      else {
        // Special case: Rahul Kumar has leave around Oct 22-24
        // Priya Patel has leave around Oct 15
        if (rand < 0.88) {
          // 88% Full Day
          status = 'FULL_DAY';
          const mins = Math.floor(rand * 50);
          const inMin = (mins % 30).toString().padStart(2, '0');
          const outMin = ((mins + 30) % 60).toString().padStart(2, '0');
          workHours = 8.5 + (mins > 30 ? 0.5 : 0);
          workHoursStr = `${Math.floor(workHours).toString().padStart(2, '0')}:${(Math.round((workHours % 1) * 60)).toString().padStart(2, '0')}`;
          checkIn = `09:${inMin} AM`;
          checkOut = `06:${outMin} PM`;
          label = 'Full Day Present';
          notes = 'Regular shift on time';
          fullDaysCount++;
          totalHours += workHours;
          tempStreak++;
        } else if (rand < 0.94) {
          // 6% Half Day
          status = 'HALF_DAY';
          workHours = 4.25;
          workHoursStr = '04:15';
          checkIn = '09:15 AM';
          checkOut = '01:30 PM';
          label = 'Half Day';
          notes = 'Approved half-day personal permission';
          halfDaysCount++;
          totalHours += 4.25;
          tempStreak++;
        } else {
          // 6% Leave / Absent
          status = rand < 0.98 ? 'LEAVE' : 'ABSENT';
          workHours = 0;
          workHoursStr = '00:00';
          label = status === 'LEAVE' ? 'Casual / Sick Leave' : 'Unscheduled Leave';
          notes = status === 'LEAVE' ? 'Approved casual time off' : 'Unscheduled absence';
          leavesCount++;
          tempStreak = 0;
        }
      }

      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
      }
    }

    days.push({
      date: dateStr,
      dayOfWeek,
      dayOfMonth: d.getDate(),
      month: d.getMonth(),
      monthName: d.toLocaleString('en-US', { month: 'short' }),
      year: d.getFullYear(),
      status, // 'FULL_DAY' | 'HALF_DAY' | 'LEAVE' | 'ABSENT' | 'WEEKEND' | 'HOLIDAY' | 'FUTURE'
      label,
      workHours,
      workHoursStr,
      checkIn,
      checkOut,
      notes,
      isToday: dateStr === '2025-10-22',
    });
  }

  // Calculate current active streak backwards from today
  currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i];
    if (day.date > '2025-10-22') continue;
    if (day.status === 'FULL_DAY' || day.status === 'HALF_DAY') {
      currentStreak++;
    } else if (day.status === 'LEAVE' || day.status === 'ABSENT') {
      break;
    }
  }

  const attendanceRate = workingDaysCount > 0 ? Math.round(((fullDaysCount + halfDaysCount * 0.5) / workingDaysCount) * 100) : 100;

  return {
    year,
    days,
    summary: {
      totalWorkingDays: workingDaysCount,
      fullDays: fullDaysCount,
      halfDays: halfDaysCount,
      leaves: leavesCount,
      totalHours: Math.round(totalHours),
      averageDailyHours: (totalHours / (fullDaysCount + halfDaysCount || 1)).toFixed(1),
      currentStreak,
      maxStreak: Math.max(maxStreak, currentStreak),
      attendanceRate,
    },
  };
}
