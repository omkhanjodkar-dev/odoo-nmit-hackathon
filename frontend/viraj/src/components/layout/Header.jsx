import React, { useState, useEffect } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { Navigation } from './Navigation';
import { ProfileDropdown } from './ProfileDropdown';
import { ContextSwitcher } from './ContextSwitcher';
import './Header.css';

export const Header = () => {
  const { navigate } = useRouter();
  const { activeUser } = useAuth();

  // Simple live check-in timer simulation for Developer 1's shell (Developer 2 will plug into Attendance Context)
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [elapsedTime, setElapsedTime] = useState('03:45:12');

  useEffect(() => {
    let timer;
    if (isCheckedIn) {
      timer = setInterval(() => {
        const now = new Date();
        const hrs = String(now.getHours() % 12 || 12).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        setElapsedTime(`${hrs}:${mins}:${secs}`);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCheckedIn]);

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Company / App Logo */}
        <button
          type="button"
          className="header-logo-btn"
          onClick={() => navigate('/employees')}
          title="Dayflow HRMS Home"
        >
          <div className="header-logo-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="header-company-name">Dayflow</span>
        </button>

        {/* Navigation Links */}
        <Navigation />
      </div>

      <div className="header-right">
        {/* Live Systray Attendance Badge (As specified in Wireframe) */}
        <div className="systray-punch-badge">
          <button
            type="button"
            className={`punch-toggle-btn ${isCheckedIn ? 'checked-in' : 'checked-out'}`}
            onClick={() => setIsCheckedIn(!isCheckedIn)}
            title={isCheckedIn ? 'Click to Check Out' : 'Click to Check In'}
          >
            <span className="punch-dot" aria-hidden="true" />
            <span className="punch-label">{isCheckedIn ? 'Check Out' : 'Check In'}</span>
          </button>
          {isCheckedIn && (
            <span className="punch-timer-text" title="Active Working Time">
              Since 09:00 AM ({elapsedTime})
            </span>
          )}
        </div>

        {/* Admin Context Switcher */}
        <ContextSwitcher />

        {/* User Profile Dropdown */}
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default Header;
