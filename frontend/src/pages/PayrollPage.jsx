import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { payrollService } from '../services/payrollService';
import { employeesService } from '../services/employeesService';
import PayrollSummary from '../components/payroll/PayrollSummary';
import SalaryStructureTable from '../components/payroll/SalaryStructureTable';
import SalaryConfigModal from '../components/payroll/SalaryConfigModal';
import { DollarSign, Search, CheckCircle2, FileSpreadsheet } from 'lucide-react';

export default function PayrollPage() {
  const { activeUser, isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [configuringEmployee, setConfiguringEmployee] = useState(null);
  const [successNotice, setSuccessNotice] = useState('');

  const fetchLivePayroll = React.useCallback(async () => {
    try {
      let currentEmployees = [];
      if (isAdmin) {
        try {
          currentEmployees = await employeesService.getEmployees() || [];
        } catch (e) {
          console.warn('Failed to fetch employees for payroll', e.message);
        }
        const salaries = await payrollService.getAllSalaries();
        if (Array.isArray(salaries) && salaries.length > 0) {
          const updatedEmps = currentEmployees.map((e) => {
            const matched = salaries.find((s) => s.user_id === e.id || s.employee_id === e.employeeId);
            if (matched) {
              return {
                ...e,
                salary_structure: {
                  base_pay: matched.base_pay,
                  hra: matched.hra,
                  standard_allowance: matched.standard_allowance,
                  performance_bonus: matched.performance_bonus,
                  gross_salary: matched.gross_salary,
                  pf_employee: matched.pf_employee,
                  pf_employer: matched.pf_employer,
                  professional_tax: matched.professional_tax,
                  net_deductions: matched.net_deductions,
                  net_salary: matched.net_salary,
                },
              };
            }
            return e;
          });
          setEmployees(updatedEmps);
        } else {
          setEmployees(currentEmployees);
        }
      } else {
        const mySal = await payrollService.getMySalary();
        if (mySal && activeUser?.id) {
          setEmployees([{
            ...activeUser,
            salary_structure: {
              base_pay: mySal.base_pay,
              hra: mySal.hra,
              standard_allowance: mySal.standard_allowance,
              performance_bonus: mySal.performance_bonus,
              gross_salary: mySal.gross_salary,
              pf_employee: mySal.pf_employee,
              pf_employer: mySal.pf_employer,
              professional_tax: mySal.professional_tax,
              net_deductions: mySal.net_deductions,
              net_salary: mySal.net_salary,
            },
          }]);
        } else if (activeUser) {
          setEmployees([activeUser]);
        }
      }
    } catch (err) {
      console.warn('Backend payroll fetch warning:', err.message);
    }
  }, [isAdmin, activeUser]);

  useEffect(() => {
    fetchLivePayroll();
  }, [fetchLivePayroll]);

  const departmentOptions = useMemo(() => {
    const depts = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));
    return ['ALL', ...depts];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (!isAdmin && emp.id !== activeUser?.id) {
        return false;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        emp.name?.toLowerCase().includes(q) ||
        emp.designation?.toLowerCase().includes(q) ||
        emp.department?.toLowerCase().includes(q) ||
        emp.employeeId?.toLowerCase().includes(q);

      const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;

      return matchesSearch && matchesDept;
    });
  }, [employees, isAdmin, activeUser?.id, searchQuery, selectedDept]);

  const handleSaveSalaryStructure = async (employeeId, updatedStructure) => {
    const target = employees.find((e) => e.id === employeeId);
    if (target) {
      const basePay = updatedStructure.base_pay || updatedStructure.basePay || 50000;
      
      try {
        const userId = target.user_id || target.id;
        await payrollService.updateEmployeeSalary(userId, basePay);
      } catch (err) {
        console.warn('Backend salary update warning:', err.message);
      }

      fetchLivePayroll();
      setSuccessNotice(`Salary structure updated for ${target.name}!`);
      setTimeout(() => setSuccessNotice(''), 3500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-indigo-600 font-semibold mb-0.5">
            <DollarSign className="w-4 h-4" />
            <span>Compensation & Payroll Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isAdmin ? 'Organization Payroll Structures' : 'My Compensation'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin
              ? 'Configure employee base wages, calculate statutory HRA & PF deductions, and audit payroll.'
              : 'View your monthly gross pay, statutory PF deductions, and net disbursed salary structure.'}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Oct 2025 Cycle</span>
            </span>
          </div>
        )}
      </div>

      {successNotice && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Aggregate KPI Summary (Admin view) */}
      {isAdmin && <PayrollSummary employees={employees} />}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by employee name, role, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          {isAdmin && (
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {departmentOptions.filter((d) => d !== 'ALL').map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Structure Table */}
      <SalaryStructureTable
        employees={filteredEmployees}
        onConfigureEmployee={(emp) => setConfiguringEmployee(emp)}
        isAdmin={isAdmin}
      />

      {/* Configuration Modal */}
      <SalaryConfigModal
        isOpen={!!configuringEmployee}
        employee={configuringEmployee}
        onClose={() => setConfiguringEmployee(null)}
        onSave={handleSaveSalaryStructure}
        isAdmin={isAdmin}
      />
    </div>
  );
}
