import React from 'react';
import './Badge.css';

export const Badge = ({
  children,
  variant = 'neutral', // 'present', 'leave', 'absent', 'halfday', 'pending', 'rejected', 'primary', 'neutral'
  showDot = false,
  icon = null,
  size = 'md',          // 'sm', 'md'
  className = '',
}) => {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className}`}>
      {showDot && <span className="badge-dot" aria-hidden="true" />}
      {icon && <span className="badge-icon">{icon}</span>}
      <span className="badge-text">{children}</span>
    </span>
  );
};

export default Badge;
