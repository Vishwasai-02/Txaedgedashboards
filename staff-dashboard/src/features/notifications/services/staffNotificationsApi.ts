import { apiClient } from '../../../core/services/apiClient';
import { authStore } from '../../../core/store/authStore';
import { sharedWorkflowStore } from '../../../core/store/sharedWorkflowStore';
import { ROLES } from '../../../core/constants/roles';
import { NotificationItemData } from '../../../shared/types/workflowTypes';

export const staffNotificationsApi = {
  async getNotifications(): Promise<NotificationItemData[]> {
    const apiRes = await apiClient.get('/notification/staff');
    if (apiRes) return apiRes;

    const user = authStore.getUser();
    let targetRole = 'CA_AGENT';

    if (user?.role === ROLES.CA_MANAGER || (user?.role === ROLES.MANAGER && user?.domain === 'CA')) {
      targetRole = 'CA_MANAGER';
    } else if (user?.role === ROLES.LOAN_MANAGER || (user?.role === ROLES.MANAGER && user?.domain === 'LOAN')) {
      targetRole = 'LOAN_MANAGER';
    } else if (user?.role === ROLES.LOAN_AGENT || user?.domain === 'LOAN') {
      targetRole = 'LOAN_AGENT';
    }

    const allNotifs = sharedWorkflowStore.getNotifications();
    return allNotifs.filter(n => !n.targetRole || n.targetRole === targetRole || n.userId === user?.id);
  },

  async markAsRead(id: string): Promise<NotificationItemData | null> {
    const apiRes = await apiClient.post(`/notification/staff/${id}/read`);
    if (apiRes) return apiRes;
    return sharedWorkflowStore.markNotificationRead(id);
  },

  async markAllAsRead(): Promise<void> {
    const apiRes = await apiClient.post('/notification/staff/read-all');
    if (apiRes) return apiRes;

    const user = authStore.getUser();
    let targetRole = 'CA_AGENT';
    if (user?.role === ROLES.CA_MANAGER || (user?.role === ROLES.MANAGER && user?.domain === 'CA')) {
      targetRole = 'CA_MANAGER';
    } else if (user?.role === ROLES.LOAN_MANAGER || (user?.role === ROLES.MANAGER && user?.domain === 'LOAN')) {
      targetRole = 'LOAN_MANAGER';
    }

    return sharedWorkflowStore.markAllNotificationsRead(targetRole);
  },

  subscribe(cb: () => void): () => void {
    return sharedWorkflowStore.subscribeStore(cb);
  }
};

