import React, { useState } from 'react';
import { Button } from '../common/Button/Button';
import { Badge } from '../common/Badge/Badge';
import './ProfileHeader.css';

export const ProfileHeader = ({
  employee,
  isEditing,
  onToggleEdit,
  onSave,
  onChangeField,
  canEditJobDetails = false, // True for Admin, False for Employee
}) => {
  const [avatarPreview, setAvatarPreview] = useState(employee.avatar_url);

  const handleAvatarChange = () => {
    // Generate a new random avatar photo on click for demo
    const randomId = 1534528741775 + Math.floor(Math.random() * 800);
    const newUrl = `https://images.unsplash.com/photo-${randomId}?w=150&auto=format&fit=crop&q=80`;
    setAvatarPreview(newUrl);
    onChangeField('avatar_url', newUrl);
  };

  const getStatusBadge = () => {
    switch (employee.attendance_status) {
      case 'PRESENT':
        return <Badge variant="present" showDot size="sm">Present in Office</Badge>;
      case 'LEAVE':
        return <Badge variant="leave" icon="✈️" size="sm">On Leave</Badge>;
      case 'ABSENT':
      default:
        return <Badge variant="absent" showDot size="sm">Absent</Badge>;
    }
  };

  return (
    <div className="profile-header-card">
      <div className="profile-header-main">
        {/* Avatar with edit overlay */}
        <div className="profile-avatar-container">
          <img
            src={avatarPreview || employee.avatar_url}
            alt={`${employee.first_name} ${employee.last_name}`}
            className="profile-large-avatar"
          />
          {isEditing && (
            <button
              type="button"
              className="avatar-change-overlay"
              onClick={handleAvatarChange}
              title="Change Photo"
            >
              📷 Change
            </button>
          )}
        </div>

        {/* Core Identity Info */}
        <div className="profile-identity">
          <div className="profile-name-row">
            {isEditing && canEditJobDetails ? (
              <div className="name-inputs">
                <input
                  type="text"
                  className="profile-edit-name-input"
                  value={employee.first_name || ''}
                  onChange={(e) => onChangeField('first_name', e.target.value)}
                  placeholder="First name"
                />
                <input
                  type="text"
                  className="profile-edit-name-input"
                  value={employee.last_name || ''}
                  onChange={(e) => onChangeField('last_name', e.target.value)}
                  placeholder="Last name"
                />
              </div>
            ) : (
              <h1 className="profile-full-name">
                {employee.first_name} {employee.last_name}
              </h1>
            )}
            <span className="profile-id-tag">{employee.employee_id}</span>
            {getStatusBadge()}
          </div>

          <div className="profile-designation-row">
            {isEditing && canEditJobDetails ? (
              <input
                type="text"
                className="profile-edit-sub-input"
                value={employee.designation || ''}
                onChange={(e) => onChangeField('designation', e.target.value)}
                placeholder="Job Designation"
              />
            ) : (
              <span className="profile-designation">{employee.designation}</span>
            )}
            <span className="bullet-sep">•</span>
            {isEditing && canEditJobDetails ? (
              <input
                type="text"
                className="profile-edit-sub-input"
                value={employee.department || ''}
                onChange={(e) => onChangeField('department', e.target.value)}
                placeholder="Department"
              />
            ) : (
              <span className="profile-department">{employee.department}</span>
            )}
          </div>

          {/* Quick Contact & Company Chips */}
          <div className="profile-meta-chips">
            <div className="meta-chip">
              <span className="meta-chip-icon">✉️</span>
              <span>{employee.email}</span>
            </div>
            <div className="meta-chip">
              <span className="meta-chip-icon">📞</span>
              {isEditing ? (
                <input
                  type="text"
                  className="profile-chip-input"
                  value={employee.phone || ''}
                  onChange={(e) => onChangeField('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              ) : (
                <span>{employee.phone || 'No phone added'}</span>
              )}
            </div>
            <div className="meta-chip">
              <span className="meta-chip-icon">👔</span>
              <span>Manager: <strong>{employee.manager || 'Sarah Connor'}</strong></span>
            </div>
            <div className="meta-chip">
              <span className="meta-chip-icon">📍</span>
              <span>{employee.location || 'San Francisco, USA'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons (Edit / Save Toggle) */}
      <div className="profile-header-actions">
        {isEditing ? (
          <div className="edit-btn-group">
            <Button variant="ghost" size="md" onClick={onToggleEdit}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={onSave}>
              Save Changes
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="md"
            icon={
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2L12 4L4 12H2V10L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            onClick={onToggleEdit}
          >
            Edit Profile
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
