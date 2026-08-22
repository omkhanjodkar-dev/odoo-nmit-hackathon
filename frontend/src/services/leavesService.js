import apiClient from './apiClient';

export const leavesService = {
  async getMyBalance() {
    return await apiClient.get('/leaves/my-balance');
  },

  async applyLeave(leaveData) {
    const payload = {
      leave_type: leaveData.leave_type || leaveData.leaveType,
      start_date: leaveData.start_date || leaveData.startDate,
      end_date: leaveData.end_date || leaveData.endDate,
      duration: parseFloat(leaveData.duration || 1),
      is_half_day: Boolean(leaveData.is_half_day || leaveData.isHalfDay),
      half_day_period: leaveData.half_day_period || leaveData.halfDayPeriod || null,
      start_time: leaveData.start_time || leaveData.startTime || null,
      end_time: leaveData.end_time || leaveData.endTime || null,
      reason: leaveData.reason || '',
      attachment_url: leaveData.attachment_url || leaveData.attachmentUrl || null,
    };

    return await apiClient.post('/leaves/apply', payload);
  },

  async getPendingLeaves() {
    return await apiClient.get('/leaves/pending');
  },

  async approveLeave(leaveId, adminComments = '') {
    return await apiClient.post(`/leaves/${leaveId}/approve`, {
      admin_comments: adminComments,
    });
  },

  async rejectLeave(leaveId, adminComments = '') {
    return await apiClient.post(`/leaves/${leaveId}/reject`, {
      admin_comments: adminComments,
    });
  },
};

export default leavesService;
