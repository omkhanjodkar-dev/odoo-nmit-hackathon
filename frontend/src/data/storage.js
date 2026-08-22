/**
 * Dayflow HRMS Unified Reactive Storage Service
 * Provides reactive pub/sub state synchronization across tabs & components.
 */

import { INITIAL_EMPLOYEES } from './mockEmployees';
import { INITIAL_ATTENDANCE } from './mockAttendance';
import { INITIAL_LEAVE_BALANCES, INITIAL_LEAVE_REQUESTS } from './mockLeaves';

export const STORAGE_KEYS = {
  EMPLOYEES: 'dayflow_employees',
  ATTENDANCE: 'dayflow_attendance',
  LEAVE_BALANCES: 'dayflow_leave_balances',
  LEAVE_REQUESTS: 'dayflow_leave_requests',
  CURRENT_USER: 'dayflow_current_user',
  IMPERSONATED_USER_ID: 'dayflow_impersonated_user_id',
  SYSTRAY_STATE: 'dayflow_systray_state',
};

const STORAGE_EVENT = 'dayflow_storage_change';

/**
 * Initialize default storage data if empty
 */
export function initStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  }

  if (!localStorage.getItem(STORAGE_KEYS.LEAVE_BALANCES)) {
    localStorage.setItem(STORAGE_KEYS.LEAVE_BALANCES, JSON.stringify(INITIAL_LEAVE_BALANCES));
  }

  if (!localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(INITIAL_LEAVE_REQUESTS));
  }

  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    // Default current user to Alex Morgan (HR Admin)
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_EMPLOYEES[0]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SYSTRAY_STATE)) {
    const defaultSystray = {
      status: 'checked_in',
      checkInTime: '09:00 AM',
      checkInTimestamp: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString(),
      elapsedSeconds: 16200, // 4h 30m
      isRunning: true,
      lastTick: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.SYSTRAY_STATE, JSON.stringify(defaultSystray));
  }
}

// Auto initialize
initStorage();

export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`[Storage Error] Failed to get key "${key}":`, error);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent(STORAGE_EVENT, {
            detail: { key, value },
          })
        );
      }
      return true;
    } catch (error) {
      console.error(`[Storage Error] Failed to set key "${key}":`, error);
      return false;
    }
  },

  update(key, updater) {
    const current = this.get(key);
    const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
    this.set(key, updated);
    return updated;
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent(STORAGE_EVENT, {
            detail: { key, value: null },
          })
        );
      }
      return true;
    } catch (error) {
      console.error(`[Storage Error] Failed to remove key "${key}":`, error);
      return false;
    }
  },

  reset() {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    initStorage();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key: 'ALL_RESET' } }));
    }
  },

  subscribe(targetKey, callback) {
    if (typeof window === 'undefined') return () => {};

    const handler = (event) => {
      if (!targetKey || event.detail?.key === targetKey || event.detail?.key === 'ALL_RESET') {
        callback(event.detail?.value, event.detail?.key);
      }
    };

    window.addEventListener(STORAGE_EVENT, handler);
    return () => window.removeEventListener(STORAGE_EVENT, handler);
  },

  // Convenience Methods
  getCurrentUser() {
    return this.get(STORAGE_KEYS.CURRENT_USER, INITIAL_EMPLOYEES[0]);
  },

  setCurrentUser(user) {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
    this.remove(STORAGE_KEYS.IMPERSONATED_USER_ID);
    return user;
  },

  getEmployees() {
    const emps = this.get(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
    if (!Array.isArray(emps) || emps.length === 0) {
      return INITIAL_EMPLOYEES;
    }
    return emps.filter(Boolean);
  },

  getEmployeeById(id) {
    if (!id) return null;
    const emps = this.getEmployees();
    return emps.find((e) => e && (e.id === id || e.employeeId === id || e.employee_id === id)) || null;
  },

  saveEmployee(employeeData) {
    const employees = this.getEmployees();
    const existingIdx = employees.findIndex((e) => e.id === employeeData.id);
    let updated;
    if (existingIdx >= 0) {
      updated = [...employees];
      updated[existingIdx] = { ...updated[existingIdx], ...employeeData };
    } else {
      updated = [employeeData, ...employees];
    }
    this.set(STORAGE_KEYS.EMPLOYEES, updated);

    // If current active user was modified, sync session
    const current = this.getCurrentUser();
    if (current && current.id === employeeData.id) {
      this.setCurrentUser({ ...current, ...employeeData });
    }
    return employeeData;
  },

  getAttendance() {
    return this.get(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  },

  getLeaveBalances() {
    return this.get(STORAGE_KEYS.LEAVE_BALANCES, INITIAL_LEAVE_BALANCES);
  },

  getLeaveRequests() {
    return this.get(STORAGE_KEYS.LEAVE_REQUESTS, INITIAL_LEAVE_REQUESTS);
  },

  getSystrayState() {
    return this.get(STORAGE_KEYS.SYSTRAY_STATE, null);
  },

  setSystrayState(state) {
    return this.set(STORAGE_KEYS.SYSTRAY_STATE, state);
  },

  getImpersonatedUserId() {
    return this.get(STORAGE_KEYS.IMPERSONATED_USER_ID, null);
  },

  setImpersonatedUserId(id) {
    if (id) {
      this.set(STORAGE_KEYS.IMPERSONATED_USER_ID, id);
    } else {
      this.remove(STORAGE_KEYS.IMPERSONATED_USER_ID);
    }
  }
};
