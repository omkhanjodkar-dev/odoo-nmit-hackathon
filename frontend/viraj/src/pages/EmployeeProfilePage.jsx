import React, { useState, useEffect } from 'react';
import { useRouter } from '../router/RouterContext';
import { useAuth } from '../context/AuthContext';
import { getEmployeeById, saveEmployee, getEmployees } from '../services/storage';
import { ProfileHeader } from '../components/employees/ProfileHeader';
import { Tabs } from '../components/common/Tabs/Tabs';
import { ResumeTab } from '../components/employees/tabs/ResumeTab';
import { PrivateInfoTab } from '../components/employees/tabs/PrivateInfoTab';
import { SalaryInfoTab } from '../components/employees/tabs/SalaryInfoTab';
import { SecurityDocumentsTab } from '../components/employees/tabs/SecurityDocumentsTab';
import { Button } from '../components/common/Button/Button';
import './EmployeeProfilePage.css';

export const EmployeeProfilePage = () => {
  const { currentPath, getRouteParam, navigate } = useRouter();
  const { currentUser, activeUser, isAdmin } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('resume');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Extract ID if accessing /employees/:id
  const routeEmpId = getRouteParam('/employees/:id');

  useEffect(() => {
    let targetEmp = null;
    if (routeEmpId) {
      targetEmp = getEmployeeById(routeEmpId);
    } else {
      // /profile -> activeUser or currentUser
      targetEmp = activeUser || currentUser || getEmployees()[0];
    }

    if (targetEmp) {
      setEmployee(JSON.parse(JSON.stringify(targetEmp)));
    }
  }, [routeEmpId, activeUser, currentUser]);

  if (!employee) {
    return (
      <div className="profile-not-found">
        <h2>Employee Not Found</h2>
        <p>The requested employee profile does not exist in the organizational directory.</p>
        <Button variant="primary" onClick={() => navigate('/employees')} style={{ marginTop: '16px' }}>
          Back to Employee Directory
        </Button>
      </div>
    );
  }

  // Check RBAC permissions
  // Is this self profile?
  const isSelf = currentUser?.id === employee.id;
  // Can edit job details (only HR admin)
  const canEditJobDetails = isAdmin;
  // Can edit salary (only HR admin)
  const canEditSalary = isAdmin;

  const handleFieldChange = (field, value) => {
    setEmployee((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = () => {
    saveEmployee(employee);
    setIsEditing(false);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3500);
  };

  const tabsConfig = [
    {
      id: 'resume',
      label: 'Work & Resume',
      icon: '📝',
      content: (
        <ResumeTab
          employee={employee}
          isEditing={isEditing}
          onChangeField={handleFieldChange}
        />
      ),
    },
    {
      id: 'private',
      label: 'Private Info',
      icon: '🔒',
      content: (
        <PrivateInfoTab
          employee={employee}
          isEditing={isEditing}
          onChangeField={handleFieldChange}
        />
      ),
    },
    {
      id: 'salary',
      label: 'Salary & Compensation',
      icon: '💰',
      content: (
        <SalaryInfoTab
          employee={employee}
          isEditing={isEditing}
          onChangeField={handleFieldChange}
          canEditSalary={canEditSalary}
        />
      ),
    },
    {
      id: 'documents',
      label: 'Documents & Records',
      icon: '📁',
      badge: (employee.documents || []).length,
      content: (
        <SecurityDocumentsTab
          employee={employee}
          isEditing={isEditing}
          onChangeField={handleFieldChange}
        />
      ),
    },
  ];

  return (
    <div className="employee-profile-page">
      {/* Breadcrumb Navigation */}
      <div className="profile-breadcrumbs">
        <button
          type="button"
          className="breadcrumb-link"
          onClick={() => navigate('/employees')}
        >
          Employees
        </button>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">
          {employee.first_name} {employee.last_name}
        </span>
      </div>

      {saveSuccessNotice && (
        <div className="profile-save-alert">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Profile changes saved successfully to organizational records!</span>
        </div>
      )}

      {/* Profile Header Block */}
      <ProfileHeader
        employee={employee}
        isEditing={isEditing}
        onToggleEdit={() => setIsEditing(!isEditing)}
        onSave={handleSaveProfile}
        onChangeField={handleFieldChange}
        canEditJobDetails={canEditJobDetails}
      />

      {/* Profile Navigation Tabs */}
      <div className="profile-tabs-wrapper">
        <Tabs
          tabs={tabsConfig}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>
    </div>
  );
};

export default EmployeeProfilePage;
