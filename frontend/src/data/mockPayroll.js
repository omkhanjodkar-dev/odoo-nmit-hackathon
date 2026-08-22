/**
 * Salary calculation helper conforming to Odoo Hackathon PRD and Backend payroll.py
 */

export function calculateSalaryComponents(monthWage) {
  const wage = Number(monthWage) || 0;
  const yearlyWage = wage * 12;

  // 1. Basic Salary = 50.00% of Month Wage
  const basicSalary = Math.round(wage * 0.50 * 100) / 100;

  // 2. House Rent Allowance (HRA) = 50.00% of Basic
  const hra = Math.round(basicSalary * 0.50 * 100) / 100;

  // 3. Standard Allowance = Fixed ₹4,167.00
  const standardAllowance = 4167.00;

  // 4. Performance Bonus = 8.33% of Basic
  const performanceBonus = Math.round(basicSalary * 0.0833 * 100) / 100;

  // 5. Leave Travel Allowance (LTA) = 8.33% of Basic
  const lta = Math.round(basicSalary * 0.0833 * 100) / 100;

  // 6. Fixed Allowance = Wage - (Basic + HRA + Standard + Performance + LTA)
  const sumBeforeFixed = basicSalary + hra + standardAllowance + performanceBonus + lta;
  const fixedAllowance = Math.max(0, Math.round((wage - sumBeforeFixed) * 100) / 100);

  // 7. Provident Fund (PF) Deductions = 12.00% of Basic
  const pf = Math.round(basicSalary * 0.12 * 100) / 100;

  // 8. Professional Tax = Fixed ₹200.00
  const professionalTax = 200.00;

  // 9. Total Deductions
  const totalDeductions = pf + professionalTax;

  // 10. Net Payable Salary
  const netSalary = Math.round((wage - totalDeductions) * 100) / 100;

  return {
    month_wage: wage,
    yearly_wage: yearlyWage,
    basic_salary: basicSalary,
    hra,
    standard_allowance: standardAllowance,
    performance_bonus: performanceBonus,
    lta,
    fixed_allowance: fixedAllowance,
    pf,
    professional_tax: professionalTax,
    total_deductions: totalDeductions,
    net_salary: netSalary,
  };
}
