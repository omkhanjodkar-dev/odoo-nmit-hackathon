import React from 'react';
import { Card } from '../../common/Card/Card';
import { Input } from '../../common/Input/Input';
import './SalaryInfoTab.css';

export const SalaryInfoTab = ({
  employee,
  isEditing,
  onChangeField,
  canEditSalary = false, // True only for HR Admin
}) => {
  const salary = employee.salary_structure || {
    month_wage: 50000,
    yearly_wage: 600000,
    basic_salary: 25000,
    hra: 12500,
    standard_allowance: 4000,
    performance_bonus_percent: 10,
    lta_percent: 5,
    pf_percent: 12,
    professional_tax: 200,
    net_salary: 47000,
  };

  const handleWageChange = (newWageStr) => {
    const wage = parseFloat(newWageStr) || 0;
    const basic = Math.round(wage * 0.5);
    const hra = Math.round(basic * 0.5);
    const pf = Math.round(basic * 0.12);
    const standard = salary.standard_allowance || 4000;
    const bonus = Math.round(basic * ((salary.performance_bonus_percent || 10) / 100));
    const lta = Math.round(basic * ((salary.lta_percent || 5) / 100));
    const tax = salary.professional_tax || 200;
    const net = Math.round(basic + hra + standard + bonus + lta - (pf + tax));

    onChangeField('salary_structure', {
      ...salary,
      month_wage: wage,
      yearly_wage: wage * 12,
      basic_salary: basic,
      hra: hra,
      pf_percent: 12,
      net_salary: net,
    });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="salary-info-layout">
      {/* Top Banner with Net Salary & Wage Summary */}
      <div className="salary-summary-banner">
        <div className="salary-metric-block highlight">
          <span className="salary-metric-label">Estimated Net Monthly Salary</span>
          <span className="salary-metric-val">{formatCurrency(salary.net_salary)}</span>
          <span className="salary-metric-sub">Direct in-hand deposit after deductions</span>
        </div>

        <div className="salary-metric-block">
          <span className="salary-metric-label">Monthly Gross Wage</span>
          {isEditing && canEditSalary ? (
            <Input
              type="number"
              value={salary.month_wage || ''}
              onChange={(e) => handleWageChange(e.target.value)}
              placeholder="50000"
              className="salary-wage-input"
            />
          ) : (
            <span className="salary-metric-val">{formatCurrency(salary.month_wage)}</span>
          )}
          <span className="salary-metric-sub">Yearly CTC: {formatCurrency(salary.yearly_wage || salary.month_wage * 12)}</span>
        </div>

        <div className="salary-metric-block">
          <span className="salary-metric-label">Work Schedule</span>
          <span className="salary-metric-val small">5 Days / Week</span>
          <span className="salary-metric-sub">1 hr Daily Lunch Break</span>
        </div>
      </div>

      {/* Breakdown Columns: Earnings vs Deductions */}
      <div className="salary-breakdown-grid">
        {/* Earnings Card */}
        <Card
          header={
            <div className="breakdown-card-header">
              <h3 className="section-card-title">💵 Salary Components & Earnings</h3>
              <span className="status-badge-earning">Gross</span>
            </div>
          }
          className="salary-card"
        >
          <div className="salary-row-list">
            <div className="salary-item-row">
              <div className="item-name-group">
                <span className="item-title">Basic Salary</span>
                <span className="item-formula">50% of Monthly Gross Wage</span>
              </div>
              <span className="item-value">{formatCurrency(salary.basic_salary)}</span>
            </div>

            <div className="salary-item-row">
              <div className="item-name-group">
                <span className="item-title">House Rent Allowance (HRA)</span>
                <span className="item-formula">50% of Basic Salary</span>
              </div>
              <span className="item-value">{formatCurrency(salary.hra)}</span>
            </div>

            <div className="salary-item-row">
              <div className="item-name-group">
                <span className="item-title">Standard Allowance</span>
                <span className="item-formula">Fixed monthly standard benefit</span>
              </div>
              <span className="item-value">{formatCurrency(salary.standard_allowance || 4167)}</span>
            </div>

            <div className="salary-item-row">
              <div className="item-name-group">
                <span className="item-title">Performance Bonus ({salary.performance_bonus_percent || 10}%)</span>
                <span className="item-formula">Variable performance incentive</span>
              </div>
              <span className="item-value">
                {formatCurrency(salary.basic_salary * ((salary.performance_bonus_percent || 10) / 100))}
              </span>
            </div>

            <div className="salary-item-row">
              <div className="item-name-group">
                <span className="item-title">Leave Travel Allowance (LTA) ({salary.lta_percent || 5}%)</span>
                <span className="item-formula">Tax-exempt travel benefit</span>
              </div>
              <span className="item-value">
                {formatCurrency(salary.basic_salary * ((salary.lta_percent || 5) / 100))}
              </span>
            </div>
          </div>
        </Card>

        {/* Deductions Card */}
        <Card
          header={
            <div className="breakdown-card-header">
              <h3 className="section-card-title">📉 Taxes & Statutory Deductions</h3>
              <span className="status-badge-deduction">Deductions</span>
            </div>
          }
          className="salary-card"
        >
          <div className="salary-row-list">
            <div className="salary-item-row">
              <div className="item-name-group">
                <span className="item-title">Provident Fund (PF) Contribution</span>
                <span className="item-formula">12% of Basic Salary</span>
              </div>
              <span className="item-value deduction-val">
                -{formatCurrency(salary.basic_salary * 0.12)}
              </span>
            </div>

            <div className="salary-item-row">
              <div className="item-name-group">
                <span className="item-title">Professional Tax</span>
                <span className="item-formula">Standard municipal deduction</span>
              </div>
              <span className="item-value deduction-val">
                -{formatCurrency(salary.professional_tax || 200)}
              </span>
            </div>

            <div className="salary-divider" />

            <div className="salary-item-row total-row">
              <span className="item-title-bold">Total Monthly Deductions</span>
              <span className="item-value deduction-val-bold">
                -{formatCurrency((salary.basic_salary * 0.12) + (salary.professional_tax || 200))}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SalaryInfoTab;
