import { INITIAL_EMPLOYEES, INITIAL_ATTENDANCE, INITIAL_LEAVES } from './mockData';

const KEYS = {
  EMPLOYEES: 'dayflow_employees',
  ATTENDANCE: 'dayflow_attendance',
  LEAVES: 'dayflow_leaves',
  CURRENT_USER: 'dayflow_current_user',
  IMPERSONATED_USER_ID: 'dayflow_impersonated_user_id',
};

// Initialize Storage with seed data if not present
export const initStorage = () => {
  if (!localStorage.getItem(KEYS.EMPLOYEES)) {
    localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
  }
  if (!localStorage.getItem(KEYS.ATTENDANCE)) {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  }
  if (!localStorage.getItem(KEYS.LEAVES)) {
    localStorage.setItem(KEYS.LEAVES, JSON.stringify(INITIAL_LEAVES));
  }
  if (!localStorage.getItem(KEYS.CURRENT_USER)) {
    // Default logged in user: Alex Morgan (Admin/HR)
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(INITIAL_EMPLOYEES[0]));
  }
};

// Employee API
export const getEmployees = () => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.EMPLOYEES)) || [];
  } catch {
    return INITIAL_EMPLOYEES;
  }
};

export const getEmployeeById = (id) => {
  const employees = getEmployees();
  return employees.find((emp) => emp.id === id || emp.employee_id === id) || null;
};

export const saveEmployee = (employeeData) => {
  const employees = getEmployees();
  const existingIdx = employees.findIndex((e) => e.id === employeeData.id);
  
  if (existingIdx >= 0) {
    employees[existingIdx] = { ...employees[existingIdx], ...employeeData };
  } else {
    employees.unshift(employeeData);
  }
  
  localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(employees));
  
  // If current logged-in user or viewing user was updated, sync session
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === employeeData.id) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify({ ...currentUser, ...employeeData }));
  }
  
  return employeeData;
};

// Current Session User API
export const getCurrentUser = () => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.CURRENT_USER)) || INITIAL_EMPLOYEES[0];
  } catch {
    return INITIAL_EMPLOYEES[0];
  }
};

export const setCurrentUser = (user) => {
  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  // Clear impersonation on new login
  localStorage.removeItem(KEYS.IMPERSONATED_USER_ID);
};

export const clearCurrentUser = () => {
  localStorage.removeItem(KEYS.CURRENT_USER);
  localStorage.removeItem(KEYS.IMPERSONATED_USER_ID);
};

// Impersonation (Context Switcher) API
export const getImpersonatedUserId = () => {
  return localStorage.getItem(KEYS.IMPERSONATED_USER_ID) || null;
};

export const setImpersonatedUserId = (id) => {
  if (id) {
    localStorage.setItem(KEYS.IMPERSONATED_USER_ID, id);
  } else {
    localStorage.removeItem(KEYS.IMPERSONATED_USER_ID);
  }
};
