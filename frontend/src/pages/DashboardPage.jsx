import React, { useState, useEffect } from 'react';
import { storage, STORAGE_KEYS } from '../data/storage';
import EmployeeDashboard from '../components/dashboard/EmployeeDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import { Shield, UserCheck } from 'lucide-react';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState(() => storage.getCurrentUser());

  useEffect(() => {
    const unsubUser = storage.subscribe(STORAGE_KEYS.CURRENT_USER, (user) => {
      if (user) setCurrentUser(user);
    });
    return () => unsubUser();
  }, []);

  const isAdmin = currentUser?.role === 'ADMIN_HR';

  return (
    <div>
      {isAdmin ? <AdminDashboard /> : <EmployeeDashboard />}
    </div>
  );
}
