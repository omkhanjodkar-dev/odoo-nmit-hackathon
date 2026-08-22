/**
 * Mock Payroll Data for Dayflow HRMS
 * Compliant with wireframe Salary Info breakdown:
 * - Monthly Wage: 50,000 / Yearly: 600,000
 * - Basic Salary: 25,000.00 (50% of monthly wage)
 * - House Rent Allowance (HRA): 12,500.00 (50% of Basic)
 * - Standard Allowance: 4,167.00
 * - Performance Bonus: 2,082.50
 * - Leave Travel Allowance (LTA): 2,082.50
 * - Fixed Allowance: 2,918.00
 * Deductions:
 * - PF Employer (12%): 3,000.00
 * - PF Employee (12%): 3,000.00
 * - Professional Tax: 200.00
 */

export const INITIAL_SALARY_STRUCTURES = {
  "emp-1": {
    employeeId: "emp-1",
    employeeName: "John Doe",
    monthlyWage: 50000.00,
    yearlyWage: 600000.00,
    components: {
      basicSalary: 25000.00,
      basicSalaryPct: 50.0,
      hra: 12500.00,
      hraPct: 50.0,
      standardAllowance: 4167.00,
      performanceBonus: 2082.50,
      performanceBonusPct: 8.33,
      leaveTravelAllowance: 2082.50,
      ltaPct: 8.33,
      fixedAllowance: 2918.00,
    },
    deductions: {
      providentFundEmployee: 3000.00,
      providentFundEmployeePct: 12.0,
      providentFundEmployer: 3000.00,
      providentFundEmployerPct: 12.0,
      professionalTax: 200.00,
      unpaidLeaveDeduction: 0.00,
    },
    grossSalary: 50000.00,
    totalDeductions: 3200.00,
    netMonthlySalary: 46800.00,
    currency: "₹",
  },
  "emp-2": {
    employeeId: "emp-2",
    employeeName: "Jane Smith",
    monthlyWage: 55000.00,
    yearlyWage: 660000.00,
    components: {
      basicSalary: 27500.00,
      basicSalaryPct: 50.0,
      hra: 13750.00,
      hraPct: 50.0,
      standardAllowance: 4583.33,
      performanceBonus: 2291.67,
      performanceBonusPct: 8.33,
      leaveTravelAllowance: 2291.67,
      ltaPct: 8.33,
      fixedAllowance: 4583.33,
    },
    deductions: {
      providentFundEmployee: 3300.00,
      providentFundEmployeePct: 12.0,
      providentFundEmployer: 3300.00,
      providentFundEmployerPct: 12.0,
      professionalTax: 200.00,
      unpaidLeaveDeduction: 0.00,
    },
    grossSalary: 55000.00,
    totalDeductions: 3500.00,
    netMonthlySalary: 51500.00,
    currency: "₹",
  },
  "emp-3": {
    employeeId: "emp-3",
    employeeName: "Rahul Kumar",
    monthlyWage: 45000.00,
    yearlyWage: 540000.00,
    components: {
      basicSalary: 22500.00,
      basicSalaryPct: 50.0,
      hra: 11250.00,
      hraPct: 50.0,
      standardAllowance: 3750.00,
      performanceBonus: 1875.00,
      performanceBonusPct: 8.33,
      leaveTravelAllowance: 1875.00,
      ltaPct: 8.33,
      fixedAllowance: 3750.00,
    },
    deductions: {
      providentFundEmployee: 2700.00,
      providentFundEmployeePct: 12.0,
      providentFundEmployer: 2700.00,
      providentFundEmployerPct: 12.0,
      professionalTax: 200.00,
      unpaidLeaveDeduction: 1500.00, // 1 day unpaid leave
    },
    grossSalary: 45000.00,
    totalDeductions: 4400.00,
    netMonthlySalary: 40600.00,
    currency: "₹",
  },
  "emp-4": {
    employeeId: "emp-4",
    employeeName: "Priya Sharma",
    monthlyWage: 40000.00,
    yearlyWage: 480000.00,
    components: {
      basicSalary: 20000.00,
      basicSalaryPct: 50.0,
      hra: 10000.00,
      hraPct: 50.0,
      standardAllowance: 3333.33,
      performanceBonus: 1666.67,
      performanceBonusPct: 8.33,
      leaveTravelAllowance: 1666.67,
      ltaPct: 8.33,
      fixedAllowance: 3333.33,
    },
    deductions: {
      providentFundEmployee: 2400.00,
      providentFundEmployeePct: 12.0,
      providentFundEmployer: 2400.00,
      providentFundEmployerPct: 12.0,
      professionalTax: 200.00,
      unpaidLeaveDeduction: 0.00,
    },
    grossSalary: 40000.00,
    totalDeductions: 2600.00,
    netMonthlySalary: 37400.00,
    currency: "₹",
  },
  "emp-admin": {
    employeeId: "emp-admin",
    employeeName: "Alex Mercer",
    monthlyWage: 95000.00,
    yearlyWage: 1140000.00,
    components: {
      basicSalary: 47500.00,
      basicSalaryPct: 50.0,
      hra: 23750.00,
      hraPct: 50.0,
      standardAllowance: 7916.67,
      performanceBonus: 3958.33,
      performanceBonusPct: 8.33,
      leaveTravelAllowance: 3958.33,
      ltaPct: 8.33,
      fixedAllowance: 7916.67,
    },
    deductions: {
      providentFundEmployee: 5700.00,
      providentFundEmployeePct: 12.0,
      providentFundEmployer: 5700.00,
      providentFundEmployerPct: 12.0,
      professionalTax: 200.00,
      unpaidLeaveDeduction: 0.00,
    },
    grossSalary: 95000.00,
    totalDeductions: 5900.00,
    netMonthlySalary: 89100.00,
    currency: "₹",
  }
};
