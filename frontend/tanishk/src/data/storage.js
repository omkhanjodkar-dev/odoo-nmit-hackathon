/**
 * Dayflow HRMS Storage Service
 * Provides a clean abstraction over localStorage with initial mock data seeding,
 * CRUD operations, and reactive event subscriptions.
 */

import { INITIAL_EMPLOYEES } from './mockEmployees';
import { INITIAL_ATTENDANCE } from './mockAttendance';
import { INITIAL_LEAVE_BALANCES, INITIAL_LEAVE_REQUESTS } from './mockLeaves';
import { INITIAL_SALARY_STRUCTURES } from './mockPayroll';

export const STORAGE_KEYS = {
  EMPLOYEES: 'dayflow_employees',
  ATTENDANCE: 'dayflow_attendance',
  LEAVE_BALANCES: 'dayflow_leave_balances',
  LEAVE_REQUESTS: 'dayflow_leave_requests',
  PAYROLL: 'dayflow_payroll',
  CURRENT_USER: 'dayflow_current_user',
  SYSTRAY_STATE: 'dayflow_systray_state',
  ALERTS: 'dayflow_alerts',
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

  if (!localStorage.getItem(STORAGE_KEYS.PAYROLL)) {
    localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(INITIAL_SALARY_STRUCTURES));
  }

  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    // Default current user to John Doe (Employee)
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_EMPLOYEES[0]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SYSTRAY_STATE)) {
    const defaultSystray = {
      status: 'checked_in', // default checked in for demo
      checkInTime: '09:00 AM',
      checkInTimestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(), // 3.5 hours ago
      elapsedSeconds: 12600, // 3h 30m
      isRunning: true,
      lastTick: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.SYSTRAY_STATE, JSON.stringify(defaultSystray));
  }
}

// Auto initialize on module import
initStorage();

/**
 * Storage Abstraction API
 */
export const storage = {
  /**
   * Get value from localStorage with fallback
   */
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

  /**
   * Set value in localStorage and dispatch change event
   */
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

  /**
   * Update existing value in localStorage using an updater function or merge object
   */
  update(key, updater) {
    const current = this.get(key);
    const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
    this.set(key, updated);
    return updated;
  },

  /**
   * Remove item from localStorage
   */
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

  /**
   * Clear all Dayflow keys and reseed defaults
   */
  reset() {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    initStorage();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key: 'ALL_RESET' } }));
    }
  },

  /**
   * Subscribe to storage change events
   */
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

  // Helper convenience methods
  getCurrentUser() {
    return this.get(STORAGE_KEYS.CURRENT_USER, INITIAL_EMPLOYEES[0]);
  },

  setCurrentUser(user) {
    return this.set(STORAGE_KEYS.CURRENT_USER, user);
  },

  getEmployees() {
    return this.get(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
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

  getPayroll() {
    return this.get(STORAGE_KEYS.PAYROLL, INITIAL_SALARY_STRUCTURES);
  },

  getSystrayState() {
    return this.get(STORAGE_KEYS.SYSTRAY_STATE, null);
  },

  setSystrayState(state) {
    return this.set(STORAGE_KEYS.SYSTRAY_STATE, state);
  }
};
