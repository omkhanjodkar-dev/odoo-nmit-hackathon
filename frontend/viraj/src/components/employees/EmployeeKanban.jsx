import React from 'react';
import { EmployeeCard } from './EmployeeCard';
import './EmployeeKanban.css';

export const EmployeeKanban = ({ employees = [] }) => {
  if (employees.length === 0) {
    return (
      <div className="employee-empty-state">
        <div className="empty-icon">👥</div>
        <h3 className="empty-title">No employees found</h3>
        <p className="empty-subtitle">Try adjusting your search query or department filter.</p>
      </div>
    );
  }

  return (
    <div className="employee-kanban-grid">
      {employees.map((employee) => (
        <EmployeeCard key={employee.id} employee={employee} />
      ))}
    </div>
  );
};

export default EmployeeKanban;
