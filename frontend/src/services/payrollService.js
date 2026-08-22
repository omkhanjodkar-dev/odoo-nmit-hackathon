import apiClient from './apiClient';

export const payrollService = {
  async getMySalary() {
    return await apiClient.get('/payroll/my-salary');
  },

  async getAllSalaries() {
    return await apiClient.get('/payroll/all');
  },

  async getEmployeeSalary(userId) {
    return await apiClient.get(`/payroll/employee/${userId}`);
  },

  async updateEmployeeSalary(userId, basePay) {
    return await apiClient.put(`/payroll/employee/${userId}`, {
      base_pay: parseFloat(basePay),
    });
  },

  async generatePayslips(month = null, year = null) {
    const payload = {};
    if (month) payload.month = month;
    if (year) payload.year = parseInt(year, 10);
    return await apiClient.post('/payroll/generate-payslips', payload);
  },
};

export default payrollService;
