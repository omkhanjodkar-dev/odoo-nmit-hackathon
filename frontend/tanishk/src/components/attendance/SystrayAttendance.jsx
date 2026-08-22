import React, { useState, useEffect, useRef } from 'react';
import { storage, STORAGE_KEYS } from '../../data/storage';
import { Play, Square, Clock, CheckCircle2 } from 'lucide-react';

export default function SystrayAttendance({ className = '', compact = false }) {
  const [systrayState, setSystrayState] = useState(() => storage.getSystrayState());
  const [elapsed, setElapsed] = useState(() => systrayState?.elapsedSeconds || 0);
  const timerRef = useRef(null);

  // Sync with storage changes
  useEffect(() => {
    const unsubscribe = storage.subscribe(STORAGE_KEYS.SYSTRAY_STATE, (newState) => {
      if (newState) {
        setSystrayState(newState);
        if (newState.isRunning && newState.lastTick) {
          const delta = Math.floor((Date.now() - newState.lastTick) / 1000);
          setElapsed((newState.elapsedSeconds || 0) + Math.max(0, delta));
        } else {
          setElapsed(newState.elapsedSeconds || 0);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Live Timer Interval
  useEffect(() => {
    if (systrayState?.status === 'checked_in' && systrayState?.isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          // Periodically save elapsed time to storage every 15 seconds
          if (next % 15 === 0) {
            storage.update(STORAGE_KEYS.SYSTRAY_STATE, (curr) => ({
              ...curr,
              elapsedSeconds: next,
              lastTick: Date.now(),
            }));
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [systrayState?.status, systrayState?.isRunning]);

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleAttendance = () => {
    const isCurrentlyCheckedIn = systrayState?.status === 'checked_in';
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const todayStr = now.toISOString().split('T')[0];
    const currentUser = storage.getCurrentUser();

    if (!isCurrentlyCheckedIn) {
      // Perform Check-In
      const newState = {
        status: 'checked_in',
        checkInTime: formattedTime,
        checkInTimestamp: now.toISOString(),
        elapsedSeconds: 0,
        isRunning: true,
        lastTick: Date.now(),
      };
      setElapsed(0);
      storage.setSystrayState(newState);

      // Update today's attendance record
      storage.update(STORAGE_KEYS.ATTENDANCE, (records = []) => {
        const existingIndex = records.findIndex(
          (r) => r.employeeId === currentUser?.id && r.date === todayStr
        );
        if (existingIndex >= 0) {
          const updated = [...records];
          updated[existingIndex] = {
            ...updated[existingIndex],
            checkIn: formattedTime,
            status: 'PRESENT',
            isCurrentDay: true,
          };
          return updated;
        } else {
          return [
            {
              id: `att-${Date.now()}`,
              employeeId: currentUser?.id || 'emp-1',
              employeeName: currentUser?.name || 'John Doe',
              employeeAvatar: currentUser?.avatar || '',
              department: currentUser?.department || 'Engineering',
              date: todayStr,
              checkIn: formattedTime,
              checkOut: '-',
              workHours: '00:00',
              extraHours: '00:00',
              breakHours: '00:00',
              status: 'PRESENT',
              isCurrentDay: true,
            },
            ...records,
          ];
        }
      });

      // Update employee status in employee list
      storage.update(STORAGE_KEYS.EMPLOYEES, (emps = []) =>
        emps.map((e) => (e.id === currentUser?.id ? { ...e, status: 'present' } : e))
      );
    } else {
      // Perform Check-Out
      const finalWorkHours = (elapsed / 3600).toFixed(2);
      const hrsPart = Math.floor(elapsed / 3600).toString().padStart(2, '0');
      const minsPart = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
      const workHoursStr = `${hrsPart}:${minsPart}`;

      const newState = {
        status: 'checked_out',
        checkInTime: systrayState?.checkInTime || null,
        checkInTimestamp: systrayState?.checkInTimestamp || null,
        elapsedSeconds: elapsed,
        isRunning: false,
        lastTick: null,
      };
      storage.setSystrayState(newState);

      // Update today's attendance record with check-out
      storage.update(STORAGE_KEYS.ATTENDANCE, (records = []) => {
        return records.map((r) => {
          if (r.employeeId === currentUser?.id && r.date === todayStr) {
            return {
              ...r,
              checkOut: formattedTime,
              workHours: workHoursStr,
              status: elapsed >= 4 * 3600 ? 'PRESENT' : 'HALF_DAY',
              extraHours: elapsed > 8 * 3600 ? `${(Math.floor((elapsed - 8 * 3600) / 3600)).toString().padStart(2, '0')}:00` : '00:00',
            };
          }
          return r;
        });
      });

      // Update employee status in employee list
      storage.update(STORAGE_KEYS.EMPLOYEES, (emps = []) =>
        emps.map((e) => (e.id === currentUser?.id ? { ...e, status: 'checked_out' } : e))
      );
    }
  };

  const isCheckedIn = systrayState?.status === 'checked_in';

  if (compact) {
    return (
      <div className={`flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 text-white ${className}`}>
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isCheckedIn ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-300' : 'bg-rose-400'
          }`}
          title={isCheckedIn ? 'Checked In' : 'Checked Out'}
        />
        <span className="font-mono text-xs font-semibold tracking-wider">
          {formatTime(elapsed)}
        </span>
        <button
          onClick={handleToggleAttendance}
          className={`text-xs px-2.5 py-0.5 rounded-full font-medium transition-all duration-150 ${
            isCheckedIn
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isCheckedIn ? 'Check Out' : 'Check In'}
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all duration-200 hover:shadow-md ${className}`}>
      <div className="flex items-center justify-between gap-4">
        {/* Left: Status indicator and Live Timer */}
        <div className="flex items-center gap-3">
          <div
            className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${
              isCheckedIn ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span
              className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                isCheckedIn ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'
              }`}
            />
            <span
              className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                isCheckedIn ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wide uppercase text-gray-500">
                {isCheckedIn ? 'Active Work Session' : 'Attendance Clock'}
              </span>
              <span
                className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isCheckedIn ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {isCheckedIn ? '🟢 Checked In' : '🔴 Checked Out'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-mono text-2xl font-bold tracking-tight text-gray-900">
                {formatTime(elapsed)}
              </span>
              {systrayState?.checkInTime && isCheckedIn && (
                <span className="text-xs text-gray-500">
                  Since <span className="font-medium text-gray-700">{systrayState.checkInTime}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Action Button */}
        <button
          onClick={handleToggleAttendance}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isCheckedIn
              ? 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-rose-200'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-emerald-200'
          }`}
        >
          {isCheckedIn ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>Check Out &rarr;</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Check In &rarr;</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
