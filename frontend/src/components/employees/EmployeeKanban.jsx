import React from 'react';
import EmployeeCard from './EmployeeCard';

export default function EmployeeKanban({ employees }) {
  if (employees.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80">
        <p className="text-sm font-semibold text-slate-500">No employees match your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {employees.map((employee) => (
        <EmployeeCard key={employee.id} employee={employee} />
      ))}
    </div>
  );
}
