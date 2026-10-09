import { apiClient } from '../../../core/services/apiClient';
import { sharedWorkflowStore, STORAGE_KEYS } from '../../../core/store/sharedWorkflowStore';

const BASE_CONTACTS = [
  {
    id: 'TH-001',
    domain: 'CA',
    participantId: 'MGR001',
    participantName: 'Sanjay Verma (CA Manager)',
    role: 'Case Manager - Direct Tax & MCA',
    recipientRole: 'CA_MANAGER'
  },
  {
    id: 'TH-002',
    domain: 'LOAN',
    participantId: 'MGR002',
    participantName: 'Ananya Deshmukh (Loan Manager)',
    role: 'Case Manager - Loans & Advisory',
    recipientRole: 'LOAN_MANAGER'
  },
  {
    id: 'TH-003',
    domain: 'CA',
    participantId: 'AGT001',
    participantName: 'Suresh Kumar (CA Agent)',
    role: 'Executive Agent - Direct Tax',
    recipientRole: 'CA_AGENT'
  },
  {
    id: 'TH-004',
    domain: 'LOAN',
    participantId: 'AGT003',
    participantName: 'Rajesh Patel (Loan Agent)',
    role: 'Executive Agent - Credit Appraisal',
    recipientRole: 'LOAN_AGENT'
  }
];

let mockAgentMonitoring = [
  {
    id: 'AGT001',
    name: 'Suresh Kumar',
    domain: 'CA',
    manager: 'Sanjay Verma',
    status: 'ACTIVE',
    currentApplication: 'APP001 - GST Registration',
    currentTask: 'GST REG-01 Portal Entry',
    lastActivity: '3 mins ago',
    online: true
  },
  {
    id: 'AGT002',
    name: 'Priya Sharma',
    domain: 'CA',
    manager: 'Sanjay Verma',
    status: 'IN_REVIEW',
    currentApplication: 'APP002 - ITR-1 Salaried',
    currentTask: 'Form 16 TDS Reconciliation',
    lastActivity: '12 mins ago',
    online: true
  },
  {
    id: 'AGT003',
    name: 'Rajesh Patel',
    domain: 'LOAN',
    manager: 'Ananya Deshmukh',
    status: 'ACTIVE',
    currentApplication: 'APP003 - Business Loan',
    currentTask: 'Financial Cash Flow Appraisal',
    lastActivity: '8 mins ago',
    online: true
  },
  {
    id: 'AGT004',
    name: 'Kavita Iyer',
    domain: 'LOAN',
    manager: 'Ananya Deshmukh',
    status: 'IDLE',
    currentApplication: 'APP004 - MSME Working Capital',
    currentTask: 'Credit Sanction Letter Audit',
    lastActivity: '25 mins ago',
    online: false
  }
];

export const communicationApi = {
  async getThreads(domainFilter = 'ALL') {
    const apiRes = await apiClient.get(`/communication/admin/threads?domain=${domainFilter}`);
    if (apiRes) return apiRes;

    const contacts = domainFilter === 'ALL'
      ? BASE_CONTACTS
      : BASE_CONTACTS.filter((c) => c.domain === domainFilter);

    return contacts.map((c) => {
      const msgs = sharedWorkflowStore.getDirectMessages('ADM001', c.participantId);
      const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
      const unreadCount = msgs.filter((m) => m.recipientId === 'ADM001' && !m.read).length;

      return {
        id: c.id,
        domain: c.domain,
        participantId: c.participantId,
        participantName: c.participantName,
        role: c.role,
        recipientRole: c.recipientRole,
        unreadCount,
        lastMessage: lastMsg ? lastMsg.text : 'No communication recorded yet',
        lastMessageTime: lastMsg ? lastMsg.time : '',
        messages: msgs.map((m) => ({
          id: m.id,
          sender: m.senderId,
          text: m.text,
          time: m.time
        }))
      };
    });
  },

  async getAgentMonitoring(domainFilter = 'ALL') {
    const apiRes = await apiClient.get(`/communication/admin/monitoring?domain=${domainFilter}`);
    if (apiRes) return apiRes;

    if (domainFilter === 'ALL') {
      return mockAgentMonitoring;
    }
    return mockAgentMonitoring.filter((a) => a.domain === domainFilter);
  },

  async sendMessage(threadId: string, text: string) {
    const apiRes = await apiClient.post(`/communication/admin/threads/${threadId}/messages`, { text });
    if (apiRes) return apiRes;

    const contact = BASE_CONTACTS.find((c) => c.id === threadId);
    if (!contact) return null;

    const saved = sharedWorkflowStore.sendDirectMessage({
      senderId: 'ADM001',
      senderName: 'Rohan Sharma',
      senderRole: 'SUPER_ADMIN',
      recipientId: contact.participantId,
      recipientName: contact.participantName.split(' (')[0],
      recipientRole: contact.recipientRole,
      text
    });

    return saved
      ? {
          id: saved.id,
          sender: saved.senderId,
          text: saved.text,
          time: saved.time
        }
      : null;
  },

  getDirectMessages(recipientId: string) {
    return sharedWorkflowStore.getDirectMessages('ADM001', recipientId);
  },

  sendDirectMessage({ recipientId, recipientName, recipientRole, text }: { recipientId: string; recipientName: string; recipientRole: string; text: string }) {
    return sharedWorkflowStore.sendDirectMessage({
      senderId: 'ADM001',
      senderName: 'Rohan Sharma',
      senderRole: 'SUPER_ADMIN',
      recipientId,
      recipientName,
      recipientRole,
      text
    });
  },

  subscribe(callback: () => void) {
    return sharedWorkflowStore.subscribeStore(callback);
  }
};
