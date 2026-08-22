import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEmployees, saveEmployee } from '../services/storage';
import { PayrollSummary } from '../components/payroll/PayrollSummary';
import { SalaryStructureTable } from '../components/payroll/SalaryStructureTable';
import { SalaryConfigModal } from '../components/payroll/SalaryConfigModal';
import { Input } from '../components/common/Input/Input';
import { Select } from '../components/common/Select/Select';
import './PayrollPage.css';

export const PayrollPage = () => {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [configuringEmployee, setConfiguringEmployee] = useState(null);
  const [successNotice, setSuccessNotice] = useState('');

  useEffect(() => {
    setEmployees(getEmployees());
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q);

      const matchesDept = !selectedDept || emp.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [employees, searchQuery, selectedDept]);

  const departmentOptions = useMemo(() => {
    const depts = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));
    return depts.map((d) => ({ value: d, label: d }));
  }, [employees]);

  const handleSaveSalaryStructure = (employeeId, updatedSalaryStructure) => {
    const target = employees.find((e) => e.id === employeeId);
    if (target) {
      const updatedEmp = {
        ...target,
        salary_structure: updatedSalaryStructure,
      };
      saveEmployee(updatedEmp);
      setEmployees((prev) =>
        prev.map((e) => (e.id === employeeId ? updatedEmp : e))
      );
      setSuccessNotice(`Salary structure updated for ${target.first_name} ${target.last_name}!`);
      setTimeout(() => setSuccessNotice(''), 3500);
    }
  };

  return (
    <div className="payroll-page">
      {/* Page Header */}
      <div className="payroll-page-header">
        <div>
          <h1 className="page-title">Payroll & Compensation Management</h1>
          <p className="page-subtitle">Configure organization salary structures, allowances, and statutory PF deductions</p>
        </div>
      </div>

      {successNotice && (
        <div className="payroll-save-alert">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{successNotice}</span>
        </div>
      )}

      {/* Aggregate Financial Metrics */}
      <PayrollSummary employees={employees} />

      {/* Filters & Search */}
      <div className="payroll-filter-bar">
        <div className="payroll-search-wrap">
          <Input
            placeholder="Search employee or position..."
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

        <Select
          placeholder="All Departments"
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          options={departmentOptions}
          className="payroll-dept-select"
        />
      </div>

      {/* Main Structure Table */}
      <div className="payroll-table-container">
        <SalaryStructureTable
          employees={filteredEmployees}
          onConfigureEmployee={(emp) => setConfiguringEmployee(emp)}
        />
      </div>

      {/* Configuration Modal */}
      <SalaryConfigModal
        isOpen={!!configuringEmployee}
        employee={configuringEmployee}
        onClose={() => setConfiguringEmployee(null)}
        onSave={handleSaveSalaryStructure}
      />
    </div>
  );
};

export default PayrollPage;
