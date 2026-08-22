import apiClient from './apiClient';

export const attendanceService = {
  async checkIn(location = 'Office') {
    return await apiClient.post('/attendance/check-in', { location });
  },

  async checkOut() {
    return await apiClient.post('/attendance/check-out', {});
  },

  async getStatus() {
    return await apiClient.get('/attendance/status');
  },

  async getMyLogs() {
    return await apiClient.get('/attendance/my-logs');
  },

  async getAllAttendance() {
    return await apiClient.get('/attendance/all');
  },
};

export default attendanceService;
