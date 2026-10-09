import { NotificationItemData, ChatMessage } from '../../../shared/types/workflowTypes';
import { STORAGE_KEYS } from '../storageKeys';
import { publishStoreEvent } from '../storeCore';

export interface CommunicationStoreSliceState {
  notifications: NotificationItemData[];
  messages: ChatMessage[];
}

export const createCommunicationSlice = (
  state: CommunicationStoreSliceState,
  saveToStorage: (key: string, data: unknown) => void
) => ({
  getNotifications: (): NotificationItemData[] => [...state.notifications],

  addNotification: (ntfData: Partial<NotificationItemData>): NotificationItemData => {
    const newNtf: NotificationItemData = {
      id: ntfData.id || `NTF-${Date.now().toString().slice(-4)}`,
      time: ntfData.time || 'Just now',
      title: ntfData.title || 'System Notification',
      message: ntfData.message || '',
      type: ntfData.type || 'INFO',
      read: ntfData.read || false,
      ...ntfData
    };
    state.notifications = [newNtf, ...state.notifications];
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, state.notifications);
    publishStoreEvent('NOTIFICATION_ADDED', newNtf);
    return newNtf;
  },

  markNotificationRead: (id: string): NotificationItemData | null => {
    let updated: NotificationItemData | null = null;
    state.notifications = state.notifications.map(n => {
      if (n.id === id) {
        updated = { ...n, read: true };
        return updated;
      }
      return n;
    });
    if (updated) {
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, state.notifications);
      publishStoreEvent('NOTIFICATION_READ', updated);
    }
    return updated;
  },

  markAllNotificationsRead: (roleOrUserId?: string): void => {
    state.notifications = state.notifications.map(n => {
      if (!roleOrUserId || n.targetRole === roleOrUserId || n.userId === roleOrUserId) {
        return { ...n, read: true };
      }
      return n;
    });
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, state.notifications);
    publishStoreEvent('ALL_NOTIFICATIONS_READ', roleOrUserId);
  },

  getMessages: (): ChatMessage[] => [...state.messages],

  sendMessage: (msgData: Omit<ChatMessage, 'id' | 'timestamp' | 'time' | 'read'> & Partial<ChatMessage>): ChatMessage => {
    const now = new Date();
    const newMsg: ChatMessage = {
      id: msgData.id || `MSG-${Date.now().toString().slice(-4)}`,
      senderId: msgData.senderId || 'ADM001',
      senderName: msgData.senderName || 'System Admin',
      senderRole: msgData.senderRole || 'SUPER_ADMIN',
      recipientId: msgData.recipientId || 'MGR001',
      recipientName: msgData.recipientName || 'Manager',
      recipientRole: msgData.recipientRole || 'CA_MANAGER',
      text: msgData.text || '',
      read: msgData.read || false,
      timestamp: msgData.timestamp || now.toISOString(),
      time: msgData.time || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    };
    state.messages = [...state.messages, newMsg];
    saveToStorage(STORAGE_KEYS.MESSAGES, state.messages);
    publishStoreEvent('MESSAGE_SENT', newMsg);
    return newMsg;
  },

  markMessagesRead: (senderId: string, recipientId: string): void => {
    state.messages = state.messages.map(m => {
      if (m.senderId === senderId && m.recipientId === recipientId && !m.read) {
        return { ...m, read: true };
      }
      return m;
    });
    saveToStorage(STORAGE_KEYS.MESSAGES, state.messages);
    publishStoreEvent('MESSAGES_READ', { senderId, recipientId });
  },

  getConversation: (user1Id: string, user2Id: string): ChatMessage[] => {
    return state.messages.filter(m =>
      (m.senderId === user1Id && m.recipientId === user2Id) ||
      (m.senderId === user2Id && m.recipientId === user1Id)
    );
  },

  getDirectMessages: (user1Id: string, user2Id: string): ChatMessage[] => {
    return state.messages.filter(m =>
      (m.senderId === user1Id && m.recipientId === user2Id) ||
      (m.senderId === user2Id && m.recipientId === user1Id)
    );
  },

  sendDirectMessage: (msgData: Omit<ChatMessage, 'id' | 'timestamp' | 'time' | 'read'> & Partial<ChatMessage>): ChatMessage => {
    const now = new Date();
    const newMsg: ChatMessage = {
      id: msgData.id || `MSG-${Date.now().toString().slice(-4)}`,
      senderId: msgData.senderId || 'ADM001',
      senderName: msgData.senderName || 'System Admin',
      senderRole: msgData.senderRole || 'SUPER_ADMIN',
      recipientId: msgData.recipientId || 'MGR001',
      recipientName: msgData.recipientName || 'Manager',
      recipientRole: msgData.recipientRole || 'CA_MANAGER',
      text: msgData.text || '',
      read: msgData.read || false,
      timestamp: msgData.timestamp || now.toISOString(),
      time: msgData.time || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    };
    state.messages = [...state.messages, newMsg];
    saveToStorage(STORAGE_KEYS.MESSAGES, state.messages);
    publishStoreEvent('MESSAGE_SENT', newMsg);
    return newMsg;
  }
});
