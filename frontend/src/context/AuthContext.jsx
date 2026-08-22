import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage, STORAGE_KEYS } from '../data/storage';
import { calculateSalaryComponents } from '../data/mockPayroll';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState(() => storage.getCurrentUser());
  const [impersonatedUserId, setImpersonatedState] = useState(() => storage.getImpersonatedUserId());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubUser = storage.subscribe(STORAGE_KEYS.CURRENT_USER, (user) => {
      if (user) setCurrentUserState(user);
    });

    const unsubImp = storage.subscribe(STORAGE_KEYS.IMPERSONATED_USER_ID, (impId) => {
      setImpersonatedState(impId);
    });

    return () => {
      unsubUser();
      unsubImp();
    };
  }, []);

  // Login handler accepting email or Employee ID
  const login = (loginIdentifier = '', password = '', roleOverride = null) => {
    const employees = storage.getEmployees() || [];
    const query = (loginIdentifier || '').trim().toLowerCase();

    let user = employees.find((e) => {
      if (!e) return false;
      const empEmail = (e.email || '').toLowerCase();
      const empId = (e.employeeId || e.employee_id || e.id || '').toLowerCase();
      const empPersonalEmail = (e.personalEmail || e.private_info?.personal_email || '').toLowerCase();
      const empName = (e.name || `${e.firstName || e.first_name || ''} ${e.lastName || e.last_name || ''}`).trim().toLowerCase();

      return (
        (empEmail && empEmail === query) ||
        (empId && empId === query) ||
        (empPersonalEmail && empPersonalEmail === query) ||
        (empName && empName === query)
      );
    });

    if (!user) {
      // Auto create on the fly for demo if unrecognized
      const isHr = roleOverride === 'ADMIN_HR' || query.includes('admin') || query.includes('hr');
      const newId = `emp-${Date.now().toString().slice(-4)}`;
      const rawName = (loginIdentifier || 'Alex Morgan').includes('@')
        ? (loginIdentifier || '').split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
        : (loginIdentifier || 'Alex Morgan');

      user = {
        id: newId,
        employeeId: `OIJ${(rawName.slice(0, 2) || 'EM').toUpperCase()}202500${Math.floor(10 + Math.random() * 90)}`,
        name: rawName,
        firstName: rawName.split(' ')[0] || 'Employee',
        lastName: rawName.split(' ')[1] || (isHr ? '(Admin)' : ''),
        email: (loginIdentifier || '').includes('@') ? loginIdentifier.trim() : `${(loginIdentifier || 'alex.morgan').trim()}@odooindia.com`,
        phone: '+91 98765 00000',
        role: isHr ? 'ADMIN_HR' : 'EMPLOYEE',
        department: isHr ? 'Human Resources' : 'Engineering',
        designation: isHr ? 'HR Administrator' : 'Software Engineer',
        company: 'Odoo India',
        location: 'Gandhinagar, Gujarat',
        manager: 'Alex Morgan',
        managerId: 'emp-1',
        joiningDate: new Date().toISOString().split('T')[0],
        dateOfBirth: '1995-01-01',
        gender: 'Not specified',
        maritalStatus: 'Single',
        residingAddress: 'Gandhinagar, Gujarat',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status: 'present',
        attendance_status: 'PRESENT',
        about: 'Excited team member at Odoo India.',
        whatILoveAboutJob: 'Building delightful enterprise products.',
        interestsAndHobbies: 'Technology, photography, speed chess.',
        skills: ['JavaScript', 'React', 'Problem Solving'],
        certifications: [],
        documents: [],
        bankDetails: {
          accountNumber: '123456789012',
          bankName: 'HDFC Bank',
          ifscCode: 'HDFC0001234',
          branch: 'Infocity Gandhinagar',
        },
        statutory: {
          panNo: 'ABCDE1234F',
          uanNo: '100908070610',
          empCode: `EMP-2025-${newId.slice(-3)}`,
        },
        salary_structure: calculateSalaryComponents(50000),
      };

      storage.saveEmployee(user);
    } else if (roleOverride && user.role !== roleOverride) {
      user = { ...user, role: roleOverride };
      storage.saveEmployee(user);
    }

    storage.setCurrentUser(user);
    setCurrentUserState(user);
    setImpersonatedState(null);
    return user;
  };

  // Sign up handler with standard Employee ID generation
  const signup = (formData) => {
    const employees = storage.getEmployees() || [];
    const targetEmail = (formData?.email || '').trim().toLowerCase();
    const existing = employees.find(
      (e) => e?.email && e.email.toLowerCase() === targetEmail
    );

    if (existing) {
      throw new Error('An employee with this Email address already exists.');
    }

    const newId = `emp-${Date.now().toString().slice(-4)}`;
    const [firstName, ...rest] = (formData.name || 'New Employee').split(' ');
    const lastName = rest.join(' ') || '';

    // Formula: [Company Initials][First 2 letters of First & Last][Year][Serial]
    const compInit = (formData.companyName || 'Odoo India')
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'OI';
    const nameInit = `${firstName.slice(0, 2)}${(lastName || firstName).slice(0, 2)}`.toUpperCase();
    const year = new Date().getFullYear();
    const serial = String(employees.length + 1).padStart(4, '0');
    const autoEmpId = `${compInit}${nameInit}${year}${serial}`;

    const wage = Number(formData.monthWage) || 50000;

    const newUser = {
      id: newId,
      employeeId: autoEmpId,
      name: formData.name.trim(),
      firstName,
      lastName,
      email: formData.email.trim(),
      personalEmail: formData.personalEmail || formData.email.trim(),
      phone: formData.phone || '+91 98765 00000',
      role: formData.role || 'EMPLOYEE',
      department: formData.department || (formData.role === 'ADMIN_HR' ? 'Human Resources' : 'Engineering'),
      designation: formData.designation || (formData.role === 'ADMIN_HR' ? 'HR Specialist' : 'Software Engineer'),
      company: formData.companyName || 'Odoo India',
      location: formData.location || 'Gandhinagar, Gujarat',
      manager: 'Alex Morgan',
      managerId: 'emp-1',
      joiningDate: new Date().toISOString().split('T')[0],
      dateOfBirth: formData.dateOfBirth || '1996-01-01',
      gender: formData.gender || 'Not specified',
      maritalStatus: formData.maritalStatus || 'Single',
      residingAddress: formData.residingAddress || 'Gandhinagar, Gujarat',
      avatar: formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'present',
      attendance_status: 'PRESENT',
      about: 'Newly onboarded team member at Odoo India.',
      whatILoveAboutJob: 'Collaborating on mission-critical features.',
      interestsAndHobbies: 'Reading, technology, travel.',
      skills: ['Problem Solving', 'Teamwork', 'Communication'],
      certifications: [],
      documents: [],
      bankDetails: {
        accountNumber: formData.accountNumber || '123456789012',
        bankName: formData.bankName || 'HDFC Bank',
        ifscCode: formData.ifscCode || 'HDFC0001234',
        branch: 'Infocity Gandhinagar',
      },
      statutory: {
        panNo: formData.panNo || 'ABCDE1234F',
        uanNo: formData.uanNo || '100908070611',
        empCode: `EMP-${year}-${serial.slice(-3)}`,
      },
      salary_structure: calculateSalaryComponents(wage),
    };

    storage.saveEmployee(newUser);
    storage.setCurrentUser(newUser);
    setCurrentUserState(newUser);
    return newUser;
  };

  const logout = () => {
    storage.remove(STORAGE_KEYS.CURRENT_USER);
    storage.remove(STORAGE_KEYS.IMPERSONATED_USER_ID);
    setCurrentUserState(null);
    setImpersonatedState(null);
  };

  const switchContext = (employeeId) => {
    if (!employeeId || employeeId === currentUser?.id) {
      storage.setImpersonatedUserId(null);
      setImpersonatedState(null);
    } else {
      storage.setImpersonatedUserId(employeeId);
      setImpersonatedState(employeeId);
    }
  };

  const updateActiveProfile = (updatedFields) => {
    const targetUser = activeUser;
    if (!targetUser) return;

    const updated = { ...targetUser, ...updatedFields };
    storage.saveEmployee(updated);

    if (impersonatedUserId && targetUser.id === impersonatedUserId) {
      setImpersonatedState(targetUser.id);
    } else {
      setCurrentUserState(updated);
    }
    return updated;
  };

  const impersonatedUser = impersonatedUserId ? storage.getEmployeeById(impersonatedUserId) : null;
  const activeUser = impersonatedUser || currentUser;
  const isAdmin = activeUser?.role === 'ADMIN_HR';

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
