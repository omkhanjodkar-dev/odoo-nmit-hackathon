import apiClient from './apiClient';

export const authService = {
  async signIn(loginIdentifier, password) {
    const payload = {
      login_identifier: loginIdentifier.trim(),
      password,
    };
    const res = await apiClient.post('/auth/signin', payload);
    if (res.access_token) {
      apiClient.setToken(res.access_token);
    }
    return res;
  },

  async signUp(formData) {
    const [firstName, ...rest] = (formData.name || '').trim().split(' ');
    const lastName = rest.join(' ') || '';

    const payload = {
      company_name: formData.companyName || 'Odoo India',
      first_name: formData.firstName || firstName || 'Employee',
      last_name: formData.lastName || lastName || '',
      email: formData.email.trim(),
      phone_number: formData.phone ? parseInt(formData.phone.replace(/\D/g, '').slice(-10), 10) : null,
      role: (formData.role || 'employee').toLowerCase(),
      password: formData.password,
      confirm_password: formData.confirmPassword || formData.password,
    };

    return await apiClient.post('/auth/signup', payload);
  },

  async getMe() {
    return await apiClient.get('/auth/me');
  },

  async changePassword(currentPassword, newPassword) {
    return await apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  signOut() {
    apiClient.setToken(null);
  },

  getToken() {
    return apiClient.getToken();
  },
};

export default authService;
