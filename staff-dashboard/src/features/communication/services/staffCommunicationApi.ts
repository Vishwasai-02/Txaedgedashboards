import { apiClient } from '../../../core/services/apiClient';
import { authStore } from '../../../core/store/authStore';
import { sharedWorkflowStore, STORAGE_KEYS } from '../../../core/store/sharedWorkflowStore';

const THREAD_REGISTRY = [
  // CA Domain - Manager <-> Agents
  {
    id: 'STH-CA-01',
    domain: 'CA',
    managerId: 'MGR001',
    participantId: 'AGT001',
    participantName: 'Suresh Kumar (CA Agent)',
    role: 'Direct Tax Executive',
    recipientRole: 'CA_AGENT'
  },
  {
    id: 'STH-CA-02',
    domain: 'CA',
    managerId: 'MGR001',
    participantId: 'AGT002',
    participantName: 'Priya Sharma (CA Agent)',
    role: 'ITR & Compliance Executive',
    recipientRole: 'CA_AGENT'
  },
  // Loan Domain - Manager <-> Agents
  {
    id: 'STH-LN-01',
    domain: 'LOAN',
    managerId: 'MGR002',
    participantId: 'AGT003',
    participantName: 'Rajesh Patel (Loan Agent)',
    role: 'Business Loan Credit Executive',
    recipientRole: 'LOAN_AGENT'
  },
  {
    id: 'STH-LN-02',
    domain: 'LOAN',
    managerId: 'MGR002',
    participantId: 'AGT004',
    participantName: 'Kavita Iyer (Loan Agent)',
    role: 'Underwriting & Appraisal Executive',
    recipientRole: 'LOAN_AGENT'
  }
];

export const staffCommunicationApi = {
  validateThreadAccess(threadId: string, user: any) {
    const thread = THREAD_REGISTRY.find((t) => t.id === threadId) || (
      threadId === `STH-${user?.id}-MGR` ? {
        id: threadId,
        domain: user?.domain || 'CA',
        managerId: (user?.domain === 'LOAN') ? 'MGR002' : 'MGR001',
        participantId: (user?.domain === 'LOAN') ? 'MGR002' : 'MGR001'
      } : null
    );
    if (!thread) {
      throw new Error('ACCESS DENIED: Communication thread not recognized.');
    }

    const userDomain = user?.domain || 'CA';
    const isMgr = user?.role === 'MANAGER' || user?.role === 'CA_MANAGER' || user?.role === 'LOAN_MANAGER';

    // Domain isolation
    if (thread.domain !== userDomain) {
      throw new Error(`ACCESS DENIED: Domain isolation policy restricts access to ${thread.domain} communications.`);
    }

    // Role & hierarchy check
    if (isMgr) {
      if (thread.managerId !== user?.id) {
        throw new Error('ACCESS DENIED: Manager is only authorized to communicate with their direct assigned team.');
      }
    } else {
      if (thread.participantId !== user?.id && thread.id !== `STH-${user?.id}-MGR`) {
        throw new Error('ACCESS DENIED: Agent cannot view communications outside their assigned supervisor channel.');
      }
    }

    return thread;
  },

  async getThreads() {
    const user = authStore.getUser();
    const userDomain = user?.domain || 'CA';
    const isMgr = user?.role === 'MANAGER' || user?.role === 'CA_MANAGER' || user?.role === 'LOAN_MANAGER';
    const currentUserId = user?.id || '';

    const apiRes = await apiClient.get(`/communication/staff/threads?domain=${userDomain}&userId=${currentUserId}`);
    if (apiRes) return apiRes;

    let relevantConfigs = [];

    if (isMgr) {
      // Manager sees threads strictly with their assigned domain agents
      relevantConfigs = THREAD_REGISTRY.filter(
        (t) => t.managerId === currentUserId && t.domain === userDomain
      );

      return relevantConfigs.map((cfg) => {
        const msgs = sharedWorkflowStore.getDirectMessages(currentUserId, cfg.participantId);
        const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
        const unreadCount = msgs.filter((m: any) => m.recipientId === currentUserId && !m.read).length;

        return {
          id: cfg.id,
          domain: cfg.domain,
          managerId: cfg.managerId,
          participantId: cfg.participantId,
          participantName: cfg.participantName,
          role: cfg.role,
          recipientRole: cfg.recipientRole,
          unreadCount,
          lastMessage: lastMsg ? lastMsg.text : 'No communication recorded yet',
          lastMessageTime: lastMsg ? lastMsg.time : '',
          messages: msgs.map((m: any) => ({
            id: m.id,
            sender: m.senderId,
            text: m.text,
            time: m.time
          }))
        };
      });
    } else {
      // Agent sees thread strictly with their domain Manager
      const managerId = userDomain === 'LOAN' ? 'MGR002' : 'MGR001';
      const managerName = userDomain === 'LOAN' ? 'Ananya Deshmukh (Loan Manager)' : 'Sanjay Verma (CA Manager)';
      const managerRole = userDomain === 'LOAN' ? 'Case Manager - Loans & Lending' : 'Case Manager - Direct Tax & MCA';

      const agentThreads = [];

      // Thread with Manager only
      const mgrMsgs = sharedWorkflowStore.getDirectMessages(currentUserId, managerId);
      const lastMgrMsg = mgrMsgs.length > 0 ? mgrMsgs[mgrMsgs.length - 1] : null;
      agentThreads.push({
        id: `STH-${currentUserId}-MGR`,
        domain: userDomain,
        participantId: managerId,
        participantName: managerName,
        role: managerRole,
        recipientRole: userDomain === 'LOAN' ? 'LOAN_MANAGER' : 'CA_MANAGER',
        unreadCount: mgrMsgs.filter((m: any) => m.recipientId === currentUserId && !m.read).length,
        lastMessage: lastMgrMsg ? lastMgrMsg.text : 'No messages yet',
        lastMessageTime: lastMgrMsg ? lastMgrMsg.time : '',
        messages: mgrMsgs.map((m: any) => ({
          id: m.id,
          sender: m.senderId,
          text: m.text,
          time: m.time
        }))
      });

      return agentThreads;
    }
  },

  async getThreadById(threadId: string) {
    const user = authStore.getUser();
    this.validateThreadAccess(threadId, user);
    const threads = await this.getThreads();
    return threads.find((t: any) => t.id === threadId);
  },

  async sendMessage(threadId: string, text: string) {
    const user = authStore.getUser();
    const threads = await this.getThreads();
    const thread = threads.find((t: any) => t.id === threadId);
    if (!thread) return null;

    const saved = sharedWorkflowStore.sendDirectMessage({
      senderId: user?.id || '',
      senderName: user?.name || '',
      senderRole: user?.role || '',
      recipientId: thread.participantId,
      recipientName: thread.participantName.split(' (')[0],
      recipientRole: thread.recipientRole,
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
    const user = authStore.getUser();
    return sharedWorkflowStore.getDirectMessages(user?.id || '', recipientId);
  },

  sendDirectMessage({ recipientId, recipientName, recipientRole, text }: { recipientId: string; recipientName: string; recipientRole: string; text: string }) {
    const user = authStore.getUser();
    return sharedWorkflowStore.sendDirectMessage({
      senderId: user?.id || '',
      senderName: user?.name || '',
      senderRole: user?.role || '',
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
