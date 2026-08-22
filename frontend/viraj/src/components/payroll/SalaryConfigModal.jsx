import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import { Input } from '../common/Input/Input';
import './SalaryConfigModal.css';

export const SalaryConfigModal = ({
  isOpen,
  onClose,
  employee,
  onSave,
}) => {
  const [config, setConfig] = useState({
    month_wage: 50000,
    basic_percent: 50,
    hra_percent: 50,
    standard_allowance: 4000,
    performance_bonus_percent: 10,
    lta_percent: 5,
    pf_percent: 12,
    professional_tax: 200,
  });

  useEffect(() => {
    if (employee && employee.salary_structure) {
      const s = employee.salary_structure;
      setConfig({
        month_wage: s.month_wage || 50000,
        basic_percent: 50,
        hra_percent: 50,
        standard_allowance: s.standard_allowance || 4000,
        performance_bonus_percent: s.performance_bonus_percent || 10,
        lta_percent: s.lta_percent || 5,
        pf_percent: 12,
        professional_tax: s.professional_tax || 200,
      });
    }
  }, [employee]);

  if (!employee) return null;

  // Real-time calculation
  const wage = parseFloat(config.month_wage) || 0;
  const basicSalary = Math.round(wage * ((config.basic_percent || 50) / 100));
  const hra = Math.round(basicSalary * ((config.hra_percent || 50) / 100));
  const standardAllowance = parseFloat(config.standard_allowance) || 0;
  const bonus = Math.round(basicSalary * ((config.performance_bonus_percent || 10) / 100));
  const lta = Math.round(basicSalary * ((config.lta_percent || 5) / 100));
  const pfDeduction = Math.round(basicSalary * ((config.pf_percent || 12) / 100));
  const profTax = parseFloat(config.professional_tax) || 0;

  const totalEarnings = basicSalary + hra + standardAllowance + bonus + lta;
  const totalDeductions = pfDeduction + profTax;
  const netCalculatedSalary = Math.round(totalEarnings - totalDeductions);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleSave = () => {
    const updatedSalaryStructure = {
      month_wage: wage,
      yearly_wage: wage * 12,
      basic_salary: basicSalary,
      hra: hra,
      standard_allowance: standardAllowance,
      performance_bonus_percent: parseFloat(config.performance_bonus_percent) || 10,
      lta_percent: parseFloat(config.lta_percent) || 5,
      pf_percent: parseFloat(config.pf_percent) || 12,
      professional_tax: profTax,
      net_salary: netCalculatedSalary,
    };

    onSave(employee.id, updatedSalaryStructure);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configure Salary Structure: ${employee.first_name} ${employee.last_name}`}
      subtitle={`${employee.designation} • ${employee.department} (${employee.employee_id})`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Discard
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Apply & Save Structure
          </Button>
        </>
      }
    >
      <div className="salary-config-modal-body">
        {/* Live Computation Highlight Box */}
        <div className="config-live-banner">
          <div className="live-metric">
            <span className="live-label">Gross Monthly Wage</span>
            <span className="live-val">{formatCurrency(wage)}</span>
          </div>
          <span className="math-operator">→</span>
          <div className="live-metric">
            <span className="live-label">Total Deductions</span>
            <span className="live-val deduction">-{formatCurrency(totalDeductions)}</span>
          </div>
          <span className="math-operator">=</span>
          <div className="live-metric highlight">
            <span className="live-label">Net In-Hand Salary</span>
            <span className="live-val net">{formatCurrency(netCalculatedSalary)}</span>
          </div>
        </div>

        {/* Configuration Fields */}
        <div className="config-fields-grid">
          <div className="config-column">
            <h4 className="config-col-title">💵 Base Earnings & Allowances</h4>

            <Input
              label="Monthly Gross Wage ($)"
              type="number"
              value={config.month_wage}
              onChange={(e) => setConfig({ ...config, month_wage: e.target.value })}
              required
            />

            <div className="formula-readonly-chip">
              <span>Basic Salary (50% of wage):</span>
              <strong>{formatCurrency(basicSalary)}</strong>
            </div>

            <div className="formula-readonly-chip">
              <span>HRA (50% of Basic):</span>
              <strong>{formatCurrency(hra)}</strong>
            </div>

            <Input
              label="Standard Allowance ($)"
              type="number"
              value={config.standard_allowance}
              onChange={(e) => setConfig({ ...config, standard_allowance: e.target.value })}
            />

            <Input
              label="Performance Bonus (%)"
              type="number"
              value={config.performance_bonus_percent}
              onChange={(e) => setConfig({ ...config, performance_bonus_percent: e.target.value })}
            />

            <Input
              label="Leave Travel Allowance LTA (%)"
              type="number"
              value={config.lta_percent}
              onChange={(e) => setConfig({ ...config, lta_percent: e.target.value })}
            />
          </div>

          <div className="config-column">
            <h4 className="config-col-title">📉 Statutory Deductions & Taxes</h4>

            <div className="formula-readonly-chip deduction-chip">
              <span>Provident Fund (PF) (12% of Basic):</span>
              <strong>-{formatCurrency(pfDeduction)}</strong>
            </div>

            <Input
              label="Professional Tax ($)"
              type="number"
              value={config.professional_tax}
              onChange={(e) => setConfig({ ...config, professional_tax: e.target.value })}
            />

            <div className="config-helper-callout">
              <span className="callout-icon">ℹ️</span>
              <p className="callout-text">
                The net monthly salary is dynamically disbursed according to employee verified attendance days and unpaid leave deductions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SalaryConfigModal;
