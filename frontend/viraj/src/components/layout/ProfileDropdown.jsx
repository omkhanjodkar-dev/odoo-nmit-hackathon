import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../router/RouterContext';
import './ProfileDropdown.css';

export const ProfileDropdown = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { navigate } = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMyProfile = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  if (!currentUser) return null;

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <button
        type="button"
        className="profile-avatar-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <img
          src={currentUser.avatar_url}
          alt={`${currentUser.first_name} ${currentUser.last_name}`}
          className="profile-avatar-img"
        />
        <span className="profile-status-indicator" />
      </button>

      {isOpen && (
        <div className="profile-menu-dropdown">
          <div className="profile-menu-header">
            <img
              src={currentUser.avatar_url}
              alt=""
              className="profile-menu-avatar"
            />
            <div className="profile-menu-info">
              <span className="profile-menu-name">
                {currentUser.first_name} {currentUser.last_name}
              </span>
              <span className="profile-menu-email">{currentUser.email}</span>
              <span className={`profile-menu-badge ${isAdmin ? 'admin' : 'employee'}`}>
                {isAdmin ? '👑 HR Admin' : '👤 Employee'}
              </span>
            </div>
          </div>

          <div className="profile-menu-divider" />

          <div className="profile-menu-items">
            <button
              type="button"
              className="profile-menu-item"
              onClick={handleMyProfile}
            >
              <span className="profile-item-icon">👤</span>
              <span>My Profile</span>
            </button>

            <button
              type="button"
              className="profile-menu-item"
              onClick={() => {
                setIsOpen(false);
                navigate('/employees');
              }}
            >
              <span className="profile-item-icon">👥</span>
              <span>Employee Directory</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                className="profile-menu-item"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/payroll');
                }}
              >
                <span className="profile-item-icon">💰</span>
                <span>Payroll Settings</span>
              </button>
            )}
          </div>

          <div className="profile-menu-divider" />

          <button
            type="button"
            className="profile-menu-item logout"
            onClick={handleLogout}
          >
            <span className="profile-item-icon">🚪</span>
            <span>Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
