import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEmployees } from '../services/storage';
import { EmployeeKanban } from '../components/employees/EmployeeKanban';
import { EmployeeTable } from '../components/employees/EmployeeTable';
import { AddEmployeeModal } from '../components/employees/AddEmployeeModal';
import { Button } from '../components/common/Button/Button';
import { Input } from '../components/common/Input/Input';
import { Select } from '../components/common/Select/Select';
import './EmployeesPage.css';

export const EmployeesPage = () => {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Load from storage
  useEffect(() => {
    setEmployees(getEmployees());
  }, []);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (!emp) return false;
      const q = (searchQuery || '').toLowerCase().trim();
      const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
      const matchesSearch =
        !q ||
        fullName.toLowerCase().includes(q) ||
        (emp.name && emp.name.toLowerCase().includes(q)) ||
        emp.email?.toLowerCase().includes(q) ||
        emp.designation?.toLowerCase().includes(q) ||
        (emp.employee_id && emp.employee_id.toLowerCase().includes(q)) ||
        (emp.employeeId && emp.employeeId.toLowerCase().includes(q));

      const matchesDept = !selectedDept || emp.department === selectedDept;
      const matchesStatus = !selectedStatus || emp.attendance_status === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchQuery, selectedDept, selectedStatus]);

  // Extract unique departments for filter dropdown
  const departmentOptions = useMemo(() => {
    const depts = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));
    return depts.map((d) => ({ value: d, label: d }));
  }, [employees]);

  const handleEmployeeAdded = (newEmployee) => {
    setEmployees((prev) => [newEmployee, ...prev]);
  };

  return (
    <div className="employees-page">
      {/* Page Header Toolbar */}
      <div className="employees-page-header">
        <div className="header-title-block">
          <h1 className="page-title">Employees</h1>
          <span className="employee-count-badge">
            {filteredEmployees.length} {filteredEmployees.length === 1 ? 'employee' : 'employees'}
          </span>
        </div>

        <div className="header-actions-block">
          {/* View Mode Toggle: Kanban vs Table */}
          <div className="view-mode-toggle" role="group" aria-label="View layout switcher">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
              title="Kanban Cards View"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <span>Kanban</span>
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table List View"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>List</span>
            </button>
          </div>

          {/* Admin "NEW" / "Add Employee" button */}
          {isAdmin && (
            <Button
              variant="primary"
              size="md"
              icon={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              }
              onClick={() => setShowAddModal(true)}
            >
              NEW
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="employees-filter-bar">
        <div className="search-input-wrap">
          <Input
            placeholder="Search by name, role, email, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            }
          />
        </div>

        <div className="filters-right">
          <Select
            placeholder="All Departments"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            options={departmentOptions}
            className="filter-select"
          />

          <Select
            placeholder="All Statuses"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: 'PRESENT', label: '🟢 Present in Office' },
              { value: 'LEAVE', label: '✈️ On Leave' },
              { value: 'ABSENT', label: '🟡 Absent' },
            ]}
            className="filter-select"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="employees-view-container">
        {viewMode === 'kanban' ? (
          <EmployeeKanban employees={filteredEmployees} />
        ) : (
          <EmployeeTable employees={filteredEmployees} />
        )}
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onEmployeeAdded={handleEmployeeAdded}
      />
    </div>
  );
};

export default EmployeesPage;
