import React from 'react';
import { useRouter } from '../../router/RouterContext';
import { Badge } from '../common/Badge/Badge';
import './EmployeeCard.css';

export const EmployeeCard = ({ employee }) => {
  const { navigate } = useRouter();

  const handleCardClick = () => {
    navigate(`/employees/${employee.id}`);
  };

  // Determine status badge variant
  const getStatusBadge = () => {
    switch (employee.attendance_status) {
      case 'PRESENT':
        return (
          <Badge variant="present" showDot size="sm">
            Present
          </Badge>
        );
      case 'LEAVE':
        return (
          <Badge variant="leave" icon="✈️" size="sm">
            On Leave
          </Badge>
        );
      case 'ABSENT':
      default:
        return (
          <Badge variant="absent" showDot size="sm">
            Absent
          </Badge>
        );
    }
  };

  return (
    <div
      className="employee-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick();
        }
      }}
      aria-label={`View profile for ${employee.first_name} ${employee.last_name}`}
    >
      {/* Top Header with Status Dot/Badge */}
      <div className="employee-card-top">
        <span className="employee-id-pill">{employee.employee_id}</span>
        <div className="employee-card-status">
          {getStatusBadge()}
        </div>
      </div>

      {/* Main Profile Info */}
      <div className="employee-card-main">
        <div className="employee-card-avatar-wrap">
          <img
            src={employee.avatar_url}
            alt={`${employee.first_name} ${employee.last_name}`}
            className="employee-card-avatar"
            loading="lazy"
          />
        </div>

        <div className="employee-card-details">
          <h3 className="employee-card-name">
            {employee.first_name} {employee.last_name}
          </h3>
          <p className="employee-card-designation">{employee.designation}</p>
          <span className="employee-card-department">{employee.department}</span>
        </div>
      </div>

      <div className="employee-card-divider" />

      {/* Contact & Reporting Meta */}
      <div className="employee-card-meta">
        <div className="meta-item">
          <span className="meta-icon">✉️</span>
          <span className="meta-text" title={employee.email}>{employee.email}</span>
        </div>
        <div className="meta-item">
          <span className="meta-icon">📞</span>
          <span className="meta-text">{employee.phone || 'No phone added'}</span>
        </div>
        <div className="meta-item">
          <span className="meta-icon">👔</span>
          <span className="meta-text">Manager: <strong>{employee.manager || 'None'}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
