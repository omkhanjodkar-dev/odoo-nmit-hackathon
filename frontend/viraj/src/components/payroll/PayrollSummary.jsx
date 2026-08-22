import React from 'react';
import './PayrollSummary.css';

export const PayrollSummary = ({ employees = [] }) => {
  // Aggregate stats
  const totalEmployees = employees.length;

  const totalMonthlyCost = employees.reduce((acc, emp) => {
    const wage = emp.salary_structure?.month_wage || 0;
    return acc + wage;
  }, 0);

  const totalNetDisbursal = employees.reduce((acc, emp) => {
    const net = emp.salary_structure?.net_salary || 0;
    return acc + net;
  }, 0);

  const totalPFDeductions = employees.reduce((acc, emp) => {
    const basic = emp.salary_structure?.basic_salary || (emp.salary_structure?.month_wage || 0) * 0.5;
    return acc + Math.round(basic * 0.12);
  }, 0);

  const avgMonthlySalary = totalEmployees > 0 ? Math.round(totalMonthlyCost / totalEmployees) : 0;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="payroll-summary-cards-grid">
      <div className="payroll-stat-card brand">
        <div className="stat-icon-wrap">💵</div>
        <div className="stat-content">
          <span className="stat-label">Total Monthly Payroll CTC</span>
          <span className="stat-value">{formatCurrency(totalMonthlyCost)}</span>
          <span className="stat-sub">Yearly Run Rate: {formatCurrency(totalMonthlyCost * 12)}</span>
        </div>
      </div>

      <div className="payroll-stat-card">
        <div className="stat-icon-wrap">💳</div>
        <div className="stat-content">
          <span className="stat-label">Net Salary Disbursal</span>
          <span className="stat-value">{formatCurrency(totalNetDisbursal)}</span>
          <span className="stat-sub">Total in-hand bank deposits</span>
        </div>
      </div>

      <div className="payroll-stat-card">
        <div className="stat-icon-wrap">🛡️</div>
        <div className="stat-content">
          <span className="stat-label">Total PF & Tax Deductions</span>
          <span className="stat-value">{formatCurrency(totalPFDeductions + totalEmployees * 200)}</span>
          <span className="stat-sub">Statutory compliance deposits</span>
        </div>
      </div>

      <div className="payroll-stat-card">
        <div className="stat-icon-wrap">👥</div>
        <div className="stat-content">
          <span className="stat-label">Employees on Payroll</span>
          <span className="stat-value">{totalEmployees} Active</span>
          <span className="stat-sub">Avg Monthly Wage: {formatCurrency(avgMonthlySalary)}</span>
        </div>
      </div>
    </div>
  );
};

export default PayrollSummary;
