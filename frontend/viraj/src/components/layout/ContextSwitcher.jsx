import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { getEmployees } from '../../services/storage';
import './ContextSwitcher.css';

export const ContextSwitcher = () => {
  const { currentUser, impersonatedUser, isImpersonating, switchContext, isAdmin } = useAuth();

  // Only available for Admins or while an impersonation session is active
  if (!isAdmin && !isImpersonating) return null;

  const employees = getEmployees();

  const handleSelectChange = (e) => {
    const selectedId = e.target.value;
    switchContext(selectedId || null);
  };

  const handleReset = () => {
    switchContext(null);
  };

  return (
    <div className="context-switcher-wrap">
      <div className={`context-switcher-pill ${isImpersonating ? 'active-impersonation' : ''}`}>
        <span className="context-icon" aria-hidden="true">
          {isImpersonating ? '👁️' : '🔄'}
        </span>
        <label htmlFor="context-select" className="sr-only">
          Switch Employee Perspective
        </label>
        <select
          id="context-select"
          className="context-select"
          value={isImpersonating ? impersonatedUser?.id : ''}
          onChange={handleSelectChange}
          title="Switch viewing perspective to another employee"
        >
          <option value="">
            Viewing as: {currentUser?.first_name} {currentUser?.last_name} (Self)
          </option>
          <optgroup label="Impersonate Employee View">
            {employees
              .filter((emp) => emp.id !== currentUser?.id)
              .map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.designation})
                </option>
              ))}
          </optgroup>
        </select>

        {isImpersonating && (
          <button
            type="button"
            className="context-reset-btn"
            onClick={handleReset}
            title="Reset to your admin account"
          >
            ✕ Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default ContextSwitcher;
