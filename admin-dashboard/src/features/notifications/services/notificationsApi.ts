import { apiClient } from '../../../core/services/apiClient';
import { sharedWorkflowStore, STORAGE_KEYS } from '../../../core/store/sharedWorkflowStore';

export const notificationsApi = {
  async getNotifications() {
    const apiRes = await apiClient.get('/notification/notifications');
    if (apiRes) return apiRes;
    return sharedWorkflowStore.getNotifications();
  },

  async markAsRead(id: string) {
    const apiRes = await apiClient.post(`/notification/notifications/${id}/read`, {});
    if (apiRes) return apiRes;
    return sharedWorkflowStore.markNotificationRead(id);
  },

  async markAllAsRead() {
    const apiRes = await apiClient.post('/notification/notifications/read-all', {});
    if (apiRes) return apiRes;
    return sharedWorkflowStore.markAllNotificationsRead();
  },

  subscribe(cb: () => void) {
    return sharedWorkflowStore.subscribeStore(cb);
  }
};
