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

export function processActivityData(rawLogs = [], year = 2025) {
  const map = {};
  rawLogs.forEach((r) => {
    // Expected r: { check_in_time, check_out_time, hours_worked_today, status }
    if (!r.check_in_time) return;
    const dateStr = r.check_in_time.split('T')[0];
    map[dateStr] = r;
  });

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const days = [];
  let fullDaysCount = 0;
  let halfDaysCount = 0;
  let leavesCount = 0;
  let workingDaysCount = 0;
  let totalHours = 0;
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isFuture = dateStr > todayStr;
    const holidayName = PUBLIC_HOLIDAYS_2025[dateStr];

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
    } else {
      workingDaysCount++;
      const log = map[dateStr];

      if (log) {
        // Evaluate log
        workHours = log.hours_worked_today || 0;
        const hrs = Math.floor(workHours);
        const mins = Math.round((workHours % 1) * 60);
        workHoursStr = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        checkIn = log.check_in_time ? new Date(log.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
        checkOut = log.check_out_time ? new Date(log.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
        
        if (workHours >= 7.5) {
          status = 'FULL_DAY';
          label = 'Full Day Present';
          notes = 'Regular shift on time';
          fullDaysCount++;
          totalHours += workHours;
          tempStreak++;
        } else if (workHours >= 4) {
          status = 'HALF_DAY';
          label = 'Half Day';
          notes = 'Partial shift';
          halfDaysCount++;
          totalHours += workHours;
          tempStreak++;
        } else if (workHours > 0) {
          status = 'ABSENT';
          label = 'Short Shift';
          notes = 'Incomplete shift length';
          tempStreak = 0;
          totalHours += workHours;
        } else {
          status = 'ABSENT';
          label = 'Absent / Off';
          notes = 'No activity recorded';
          leavesCount++;
          tempStreak = 0;
        }
      } else {
        // No log on a past weekday
        status = 'ABSENT';
        label = 'Absent / Off';
        notes = 'No activity recorded';
        leavesCount++;
        tempStreak = 0;
      }
    }

    if (tempStreak > maxStreak) {
      maxStreak = tempStreak;
    }

    days.push({
      date: dateStr,
      dayOfWeek,
      dayOfMonth: d.getDate(),
      month: d.getMonth(),
      monthName: d.toLocaleString('en-US', { month: 'short' }),
      year: d.getFullYear(),
      status,
      label,
      workHours,
      workHoursStr,
      checkIn,
      checkOut,
      notes,
      isToday: dateStr === todayStr,
    });
  }

  // Calculate current streak
  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i];
    if (day.date > todayStr) continue;
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
      averageDailyHours: fullDaysCount + halfDaysCount > 0 ? (totalHours / (fullDaysCount + halfDaysCount)).toFixed(1) : '0.0',
      currentStreak,
      maxStreak: Math.max(maxStreak, currentStreak),
      attendanceRate,
    },
  };
}
