import React from 'react';
import { useRouter } from '../../router/RouterContext';
import { useAuth } from '../../context/AuthContext';
import './Navigation.css';

export const Navigation = () => {
  const { currentPath, navigate, isMatch } = useRouter();
  const { isAdmin } = useAuth();

  const navItems = [
    { label: 'Employees', path: '/employees', active: isMatch('/employees') || currentPath.startsWith('/employees') },
    { label: 'Attendance', path: '/attendance', active: isMatch('/attendance') },
    { label: 'Time Off', path: '/time-off', active: isMatch('/time-off') },
    { label: 'Payroll', path: '/payroll', active: isMatch('/payroll'), adminOnly: true },
  ];

  return (
    <nav className="nav-links" aria-label="Main Navigation">
      {navItems
        .filter((item) => !item.adminOnly || isAdmin)
        .map((item) => (
          <button
            key={item.path}
            type="button"
            className={`nav-link ${item.active ? 'nav-link-active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
    </nav>
  );
};

export default Navigation;
