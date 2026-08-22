import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { employeesService } from '../services/employeesService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState(() => {
    try {
      const stored = localStorage.getItem('odoo_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  
  const [impersonatedUserId, setImpersonatedState] = useState(() => {
    return localStorage.getItem('odoo_impersonated_user_id') || null;
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and check token / load fresh profile on startup
  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const profile = await authService.getMe();
          if (profile) {
            const normalizedUser = normalizeProfile(profile);
            localStorage.setItem('odoo_current_user', JSON.stringify(normalizedUser));
            setCurrentUserState(normalizedUser);
          }
        } catch (err) {
          console.warn('Initial session check failed:', err.message);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Helper to normalize backend user profile to frontend schema
  const normalizeProfile = (profile, fallback = {}) => {
    const firstName = profile.first_name || fallback.firstName || 'Employee';
    const lastName = profile.last_name || fallback.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || fallback.name || 'Dayflow User';
    const role = (profile.role || fallback.role || 'EMPLOYEE').toUpperCase().includes('ADMIN') ? 'ADMIN_HR' : 'EMPLOYEE';
    const userId = profile.user_id || fallback.id || fallback.user_id;
    const employeeId = profile.employee_id || fallback.employeeId || fallback.employee_id || `OIJ${firstName.slice(0, 2).toUpperCase()}2025001`;

    return {
      ...fallback,
      id: userId,
      user_id: userId,
      employeeId: employeeId,
      employee_id: employeeId,
      name: fullName,
      firstName,
      lastName,
      email: profile.email || fallback.email,
      phone: profile.phone_number ? String(profile.phone_number) : fallback.phone || '+91 98765 00000',
      role,
      department: fallback.department || (role === 'ADMIN_HR' ? 'Human Resources' : 'Engineering'),
      designation: fallback.designation || (role === 'ADMIN_HR' ? 'HR Administrator' : 'Software Engineer'),
      company: fallback.company || 'Odoo India',
      location: fallback.location || 'Gandhinagar, Gujarat',
      joiningDate: profile.joining_date || fallback.joiningDate || new Date().toISOString().split('T')[0],
      dateOfBirth: profile.dob || fallback.dateOfBirth || '1996-01-01',
      bloodGroup: profile.blood_group || fallback.bloodGroup || 'O+',
      residingAddress: profile.address || fallback.residingAddress || 'Gandhinagar, Gujarat',
      avatar: profile.profile_image || fallback.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: fallback.status || 'present',
      attendance_status: fallback.attendance_status || 'PRESENT',
      bankDetails: profile.bank_details ? {
        accountNumber: profile.bank_details.account_number || '123456789012',
        ifscCode: profile.bank_details.ifsc_code || 'HDFC0001234',
        bankName: fallback.bankDetails?.bankName || 'HDFC Bank',
        branch: fallback.bankDetails?.branch || 'Infocity Gandhinagar',
      } : fallback.bankDetails || {
        accountNumber: '123456789012',
        bankName: 'HDFC Bank',
        ifscCode: 'HDFC0001234',
        branch: 'Infocity Gandhinagar',
      },
      salary_structure: fallback.salary_structure || { month_wage: 50000, base_pay: 50000 },
    };
  };

  // Login handler calling FastAPI backend
  const login = async (loginIdentifier = '', password = '', roleOverride = null) => {
    setIsLoading(true);
    try {
      const authData = await authService.signIn(loginIdentifier, password);
      
      let profileData = null;
      try {
        profileData = await authService.getMe();
      } catch (e) {
        console.warn('Could not fetch /auth/me after signin, using token response', e);
      }

      const role = (authData.role || (profileData && profileData.role) || roleOverride || 'EMPLOYEE').toUpperCase().includes('ADMIN')
        ? 'ADMIN_HR'
        : 'EMPLOYEE';

      const user = normalizeProfile(profileData || {}, {
        id: authData.user_id,
        user_id: authData.user_id,
        employeeId: authData.employee_id,
        email: authData.email || loginIdentifier,
        role,
      });

      localStorage.setItem('odoo_current_user', JSON.stringify(user));
      setCurrentUserState(user);
      setImpersonatedState(null);
      localStorage.removeItem('odoo_impersonated_user_id');
      setIsLoading(false);
      return user;
    } catch (apiError) {
      console.warn('Backend API login failed', apiError.message);
      setIsLoading(false);
      throw apiError;
    }
  };

  const signup = async (formData) => {
    setIsLoading(true);
    try {
      const resp = await authService.signUp(formData);
      setIsLoading(false);
      return resp;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const logout = () => {
    authService.signOut();
    localStorage.removeItem('odoo_current_user');
    localStorage.removeItem('odoo_impersonated_user_id');
    setCurrentUserState(null);
    setImpersonatedState(null);
  };

  const switchContext = (employeeId) => {
    if (!employeeId || employeeId === currentUser?.id || employeeId === currentUser?.user_id) {
      localStorage.removeItem('odoo_impersonated_user_id');
      setImpersonatedState(null);
    } else {
      localStorage.setItem('odoo_impersonated_user_id', employeeId);
      setImpersonatedState(employeeId);
    }
  };

  const updateActiveProfile = async (updatedFields) => {
    const targetUser = activeUser;
    if (!targetUser) return;

    const updated = { ...targetUser, ...updatedFields };

    if (targetUser.user_id || targetUser.id) {
      try {
        const userId = targetUser.user_id || targetUser.id;
        if (updatedFields.first_name || updatedFields.firstName || updatedFields.phone_number || updatedFields.address) {
          await employeesService.updatePersonalInfo(userId, {
            first_name: updatedFields.firstName || updatedFields.first_name,
            last_name: updatedFields.lastName || updatedFields.last_name,
            phone_number: updatedFields.phone ? parseInt(String(updatedFields.phone).replace(/\D/g, '').slice(-10), 10) : undefined,
            address: updatedFields.residingAddress || updatedFields.address,
            blood_group: updatedFields.bloodGroup || updatedFields.blood_group,
            dob: updatedFields.dateOfBirth || updatedFields.dob,
          });
        }
        if (updatedFields.bankDetails) {
          await employeesService.updateBankDetails(userId, {
            account_number: updatedFields.bankDetails.accountNumber || updatedFields.bankDetails.account_number,
            ifsc_code: updatedFields.bankDetails.ifscCode || updatedFields.bankDetails.ifsc_code,
          });
        }
      } catch (err) {
        console.warn('Backend profile update warning:', err.message);
      }
    }

    if (!impersonatedUserId) {
      setCurrentUserState(updated);
      localStorage.setItem('odoo_current_user', JSON.stringify(updated));
    }
    return updated;
  };

  const [impersonatedUserObj, setImpersonatedUserObj] = useState(null);
  useEffect(() => {
    const fetchImpUser = async () => {
      if (impersonatedUserId) {
         try {
           const emps = await employeesService.getEmployees();
           const emp = emps.find(e => String(e.user_id) === String(impersonatedUserId));
           if (emp) {
             setImpersonatedUserObj(normalizeProfile(emp));
           }
         } catch(e) { console.warn(e) }
      } else {
         setImpersonatedUserObj(null);
      }
    };
    fetchImpUser();
  }, [impersonatedUserId]);

  const impersonatedUser = impersonatedUserObj;
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

export default AuthContext;
