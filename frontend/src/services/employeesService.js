import apiClient from './apiClient';

export const employeesService = {
  async getEmployees() {
    return await apiClient.get('/employees');
  },

  async onboardEmployee(formData) {
    const [firstName, ...rest] = (formData.name || '').trim().split(' ');
    const lastName = rest.join(' ') || '';

    const payload = {
      company_name: formData.companyName || 'Odoo India',
      first_name: formData.firstName || firstName || 'Employee',
      last_name: formData.lastName || lastName || '',
      email: formData.email.trim(),
      phone_number: formData.phone ? parseInt(formData.phone.replace(/\D/g, '').slice(-10), 10) : null,
      role: formData.role || 'EMPLOYEE',
      password: formData.password || 'Welcome@123',
      department: formData.department || 'Engineering',
      designation: formData.designation || 'Software Engineer',
      base_pay: parseFloat(formData.monthWage || formData.basePay || 50000),
      address: formData.residingAddress || formData.address || '',
      dob: formData.dateOfBirth || formData.dob || null,
      blood_group: formData.bloodGroup || null,
    };

    return await apiClient.post('/employees', payload);
  },

  async updatePersonalInfo(userId, personalInfo) {
    return await apiClient.put(`/employees/${userId}/personal-info`, personalInfo);
  },

  async updateBankDetails(userId, bankDetails) {
    return await apiClient.put(`/employees/${userId}/bank-details`, bankDetails);
  },
};

export default employeesService;
