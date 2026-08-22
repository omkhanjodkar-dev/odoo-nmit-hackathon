import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  getEmployees,
  getEmployeeById,
  saveEmployee,
  getImpersonatedUserId,
  setImpersonatedUserId,
  initStorage
} from '../services/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState(null);
  const [impersonatedUserId, setImpersonatedState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from LocalStorage
  useEffect(() => {
    initStorage();
    const user = getCurrentUser();
    const impId = getImpersonatedUserId();
    setCurrentUserState(user);
    setImpersonatedState(impId);
    setIsLoading(false);
  }, []);

  // Login handler
  const login = (email = '', password = '', roleOverride = null) => {
    const employees = getEmployees() || [];
    const query = (email || '').trim().toLowerCase();
    // Match by email or employee ID
    let user = employees.find((e) => {
      if (!e) return false;
      const empEmail = (e.email || '').toLowerCase();
      const empId = (e.employee_id || e.employeeId || e.id || '').toLowerCase();
      const empPersonalEmail = (e.private_info?.personal_email || e.personalEmail || '').toLowerCase();
      return (
        (empEmail && empEmail === query) ||
        (empId && empId === query) ||
        (empPersonalEmail && empPersonalEmail === query)
      );
    });
    
    if (!user) {
      // Create user on-the-fly for demo flexibility if email contains employee/admin
      const isHr = roleOverride === 'ADMIN_HR' || email.includes('admin') || email.includes('hr');
      const newId = `emp-${Date.now().toString().slice(-4)}`;
      user = {
        id: newId,
        employee_id: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
        first_name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        last_name: isHr ? '(HR)' : '',
        email: email.trim(),
        phone: '+1 (555) 000-0000',
        role: isHr ? 'ADMIN_HR' : 'EMPLOYEE',
        is_verified: true,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        department: isHr ? 'Human Resources' : 'Engineering',
        designation: isHr ? 'HR Officer' : 'Software Associate',
        manager: 'Sarah Connor',
        joining_date: new Date().toISOString().split('T')[0],
        location: 'San Francisco, USA',
        company: 'Dayflow Technologies Inc.',
        attendance_status: 'PRESENT',
        about: 'Excited member of the Dayflow team.',
        job_love: 'Creating innovative solutions and working with great colleagues.',
        interests: 'Technology, photography, music.',
        skills: ['Communication', 'Teamwork', 'JavaScript'],
        certifications: ['Dayflow Onboarding Complete'],
        private_info: {
          dob: '1995-01-01',
          address: '100 Main Street, San Francisco, CA',
          personal_email: email,
          gender: 'Not specified',
          nationality: 'American',
          marital_status: 'Single',
          bank_details: {
            bank_name: 'Chase Bank',
            account_number: '123456789012',
            ifsc_code: 'CHAS0001234'
          }
        },
        salary_structure: {
          month_wage: 50000,
          yearly_wage: 600000,
          basic_salary: 25000,
          hra: 12500,
          standard_allowance: 4000,
          performance_bonus_percent: 10,
          lta_percent: 5,
          pf_percent: 12,
          professional_tax: 200,
          net_salary: 47000
        },
        documents: []
      };
      saveEmployee(user);
    } else if (roleOverride) {
      user = { ...user, role: roleOverride };
      saveEmployee(user);
    }

    setCurrentUser(user);
    setCurrentUserState(user);
    setImpersonatedState(null);
    return user;
  };

  // Sign up handler
  const signup = (formData) => {
    const employees = getEmployees() || [];
    const targetEmail = (formData?.email || '').trim().toLowerCase();
    const existing = employees.find(
      (e) => (e?.email && e.email.toLowerCase() === targetEmail) || (e?.employee_id && formData?.employee_id && e.employee_id === formData.employee_id)
    );

    if (existing) {
      throw new Error('An account with this Email or Employee ID already exists.');
    }

    const newId = `emp-${Date.now().toString().slice(-4)}`;
    const [firstName, ...rest] = (formData.name || 'New User').split(' ');
    const lastName = rest.join(' ') || '';

    const newUser = {
      id: newId,
      employee_id: formData.employee_id || `EMP${Math.floor(1000 + Math.random() * 9000)}`,
      first_name: firstName,
      last_name: lastName,
      email: formData.email.trim(),
      phone: formData.phone || '+1 (555) 000-0000',
      role: formData.role || 'EMPLOYEE',
      is_verified: false, // will be verified via verification modal
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      department: formData.role === 'ADMIN_HR' ? 'Human Resources' : 'Engineering',
      designation: formData.role === 'ADMIN_HR' ? 'HR Officer' : 'Software Engineer',
      manager: 'Sarah Connor',
      joining_date: new Date().toISOString().split('T')[0],
      location: 'San Francisco, USA',
      company: 'Dayflow Technologies Inc.',
      attendance_status: 'PRESENT',
      about: 'Newly registered employee at Dayflow Technologies.',
      job_love: 'Collaborative problem solving and building delightful products.',
      interests: 'Reading, technology, sports.',
      skills: ['Problem Solving', 'Communication'],
      certifications: [],
      private_info: {
        dob: '1995-01-01',
        address: 'San Francisco, CA',
        personal_email: formData.email,
        gender: 'Not specified',
        nationality: 'American',
        marital_status: 'Single',
        bank_details: {
          bank_name: 'Chase Bank',
          account_number: '123456789012',
          ifsc_code: 'CHAS0001234'
        }
      },
      salary_structure: {
        month_wage: 50000,
        yearly_wage: 600000,
        basic_salary: 25000,
        hra: 12500,
        standard_allowance: 4000,
        performance_bonus_percent: 10,
        lta_percent: 5,
        pf_percent: 12,
        professional_tax: 200,
        net_salary: 47000
      },
      documents: []
    };

    saveEmployee(newUser);
    return newUser;
  };

  // Verify email
  const verifyEmail = (email) => {
    const employees = getEmployees() || [];
    const targetEmail = (email || '').trim().toLowerCase();
    const user = employees.find((e) => e?.email && e.email.toLowerCase() === targetEmail);
    if (user) {
      user.is_verified = true;
      saveEmployee(user);
      setCurrentUser(user);
      setCurrentUserState(user);
    }
  };

  // Logout handler
  const logout = () => {
    clearCurrentUser();
    setCurrentUserState(null);
    setImpersonatedState(null);
  };

  // Impersonate / Switch employee context (For Admin)
  const switchContext = (employeeId) => {
    if (!employeeId || employeeId === currentUser?.id) {
      setImpersonatedUserId(null);
      setImpersonatedState(null);
    } else {
      setImpersonatedUserId(employeeId);
      setImpersonatedState(employeeId);
    }
  };

  // Update active user profile
  const updateActiveProfile = (updatedFields) => {
    const targetUser = activeUser;
    if (!targetUser) return;
    
    const updated = { ...targetUser, ...updatedFields };
    saveEmployee(updated);

    if (impersonatedUserId && targetUser.id === impersonatedUserId) {
      // Impersonated user updated
      setImpersonatedState(targetUser.id);
    } else {
      setCurrentUserState(updated);
    }
    return updated;
  };

  // Compute active viewing user
  const impersonatedUser = impersonatedUserId ? getEmployeeById(impersonatedUserId) : null;
  const activeUser = impersonatedUser || currentUser;
  const isAdmin = currentUser?.role === 'ADMIN_HR';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        impersonatedUser,
        activeUser,
        isAdmin,
        isImpersonating: !!impersonatedUserId,
        isLoading,
        login,
        signup,
        verifyEmail,
        logout,
        switchContext,
        updateActiveProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
