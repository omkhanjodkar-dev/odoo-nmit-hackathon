import apiClient from './apiClient';

export const notificationsService = {
  async registerToken(fcmToken, deviceType = 'web') {
    return await apiClient.post('/notifications/register-token', {
      fcm_token: fcmToken,
      device_type: deviceType,
    });
  },

  async sendNotification(userId, title, body, data = {}) {
    return await apiClient.post('/notifications/send', {
      user_id: userId,
      title,
      body,
      data,
    });
  },
};

export default notificationsService;
