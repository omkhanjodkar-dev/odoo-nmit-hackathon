import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import { Play, Square, Clock, Sparkles } from 'lucide-react';

export default function SystrayAttendance({ className = '', compact = false }) {
  const { activeUser } = useAuth();
  
  // Local state for the systray
  const [systrayState, setSystrayState] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // Initial backend status synchronization
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await attendanceService.getStatus();
        if (res) {
          const isServerCheckedIn = Boolean(res.checked_in);
          if (isServerCheckedIn) {
            const checkInDate = res.check_in_time ? new Date(res.check_in_time) : new Date();
            const elapsedSince = Math.max(0, Math.floor((Date.now() - checkInDate.getTime()) / 1000));
            const formattedTime = checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

            const updated = {
              status: 'checked_in',
              checkInTime: formattedTime,
              checkInTimestamp: checkInDate.toISOString(),
              elapsedSeconds: elapsedSince,
              isRunning: true,
              lastTick: Date.now(),
            };
            setSystrayState(updated);
            setElapsed(elapsedSince);
          } else if (res.last_check_out_time) {
            const updated = {
              status: 'checked_out',
              checkInTime: null,
              checkInTimestamp: null,
              elapsedSeconds: Math.floor((res.hours_worked_today || 0) * 3600),
              isRunning: false,
              lastTick: null,
            };
            setSystrayState(updated);
            setElapsed(updated.elapsedSeconds);
          }
        }
      } catch (err) {
        console.warn('Backend attendance status fetch warning:', err.message);
      }
    };

    fetchStatus();
  }, [activeUser?.id]);

  // Live Timer interval
  useEffect(() => {
    if (systrayState?.status === 'checked_in' && systrayState?.isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (next % 15 === 0) {
            setSystrayState((curr) => ({
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

  const handleToggleAttendance = async () => {
    const isCurrentlyCheckedIn = systrayState?.status === 'checked_in';
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    if (!isCurrentlyCheckedIn) {
      // 1. Backend Check-In
      try {
        await attendanceService.checkIn('Web Portal');
      } catch (err) {
        console.warn('Backend check-in warning:', err.message);
      }

      // Check-In State
      const newState = {
        status: 'checked_in',
        checkInTime: formattedTime,
        checkInTimestamp: now.toISOString(),
        elapsedSeconds: 0,
        isRunning: true,
        lastTick: Date.now(),
      };
      setElapsed(0);
      setSystrayState(newState);
    } else {
      // 2. Backend Check-Out
      try {
        await attendanceService.checkOut();
      } catch (err) {
        console.warn('Backend check-out warning:', err.message);
      }

      // Check-Out State
      const newState = {
        status: 'checked_out',
        checkInTime: systrayState?.checkInTime || null,
        checkInTimestamp: systrayState?.checkInTimestamp || null,
        elapsedSeconds: elapsed,
        isRunning: false,
        lastTick: null,
      };
      setSystrayState(newState);
    }
  };

  const isCheckedIn = systrayState?.status === 'checked_in';

  if (compact) {
    return (
      <div className={`flex items-center gap-2.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 text-white ${className}`}>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              isCheckedIn ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-300' : 'bg-rose-400'
            }`}
            title={isCheckedIn ? 'Checked In' : 'Checked Out'}
          />
          <span className="font-mono text-xs font-bold tracking-wider text-purple-50">
            {formatTime(elapsed)}
          </span>
        </div>

        <button
          onClick={handleToggleAttendance}
          className={`text-xs px-2.5 py-0.5 rounded-full font-bold transition-all duration-150 ${
            isCheckedIn
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
          }`}
        >
          {isCheckedIn ? 'Check Out' : 'Check In'}
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 transition-all duration-200 hover:shadow-md ${className}`}>
      <div className="flex items-center justify-between gap-4">
        {/* Left: Status indicator & Live Timer */}
        <div className="flex items-center gap-3.5">
          <div
            className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition-colors ${
              isCheckedIn ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span
              className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                isCheckedIn ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'
              }`}
            />
            <span
              className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                isCheckedIn ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                {isCheckedIn ? 'Active Work Session' : 'Attendance Clock'}
              </span>
              <span
                className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isCheckedIn ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {isCheckedIn ? '🟢 Checked In' : '🔴 Checked Out'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-mono text-2xl font-extrabold tracking-tight text-slate-900">
                {formatTime(elapsed)}
              </span>
              {systrayState?.checkInTime && isCheckedIn && (
                <span className="text-xs text-slate-400">
                  Since <span className="font-semibold text-slate-600">{systrayState.checkInTime}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Action Button */}
        <button
          onClick={handleToggleAttendance}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
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
