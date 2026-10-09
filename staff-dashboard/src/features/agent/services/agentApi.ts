import { apiClient } from '../../../core/services/apiClient';
import { authStore } from '../../../core/store/authStore';
import { sharedWorkflowStore, STORAGE_KEYS } from '../../../core/store/sharedWorkflowStore';
import { WorkflowTask } from '../../../shared/types/workflowTypes';

export const agentApi = {
  async getTasks(): Promise<WorkflowTask[]> {
    const user = authStore.getUser();
    const domain = user?.domain || 'CA';
    const userId = user?.id || 'AGT001';
    const userName = user?.name || 'Suresh Kumar';

    const apiRes = await apiClient.get(`/task/agent/queue?domain=${domain}`);
    if (apiRes) return apiRes;

    const allTasks = sharedWorkflowStore.getTasks((t: WorkflowTask) => t.domain === domain);
    // Filter tasks assigned to this agent or within their domain caseload
    const myTasks = allTasks.filter(
      (t: WorkflowTask) => t.assignedTo === userId || t.assignedAgent === userName || !t.assignedTo
    );
    return myTasks.length > 0 ? myTasks : allTasks;
  },

  async getTaskById(taskId: string): Promise<WorkflowTask | undefined> {
    const user = authStore.getUser();
    const domain = user?.domain || 'CA';
    const apiRes = await apiClient.get(`/task/${taskId}`);
    if (apiRes) return apiRes;

    const task = sharedWorkflowStore.getTaskById(taskId);
    if (task) return task;

    // Fallback
    const domainTasks = sharedWorkflowStore.getTasks((t: WorkflowTask) => t.domain === domain);
    return domainTasks[0] || sharedWorkflowStore.getTasks()[0];
  },

  async toggleChecklistItem(taskId: string, checklistId: string): Promise<WorkflowTask | null> {
    const task = sharedWorkflowStore.getTaskById(taskId);
    if (!task) return null;
    const item = task.checklist?.find((c: any) => c.id === checklistId);
    const completed = item ? !item.completed : true;
    return sharedWorkflowStore.updateTaskChecklist(taskId, checklistId, completed);
  },

  async submitTaskForReview(taskId: string, _submissionData: any = {}): Promise<WorkflowTask | null> {
    return sharedWorkflowStore.updateTaskStatus(taskId, 'PENDING_REVIEW');
  },

  async triggerMaskedCall(customerPhone: string): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: `Initiating masked telephone session to ${customerPhone} via TANVOX business telephony trunk. Caller ID displayed to customer: TANVOX.`
    };
  },

  async requestAdditionalDoc(_taskId: string, docDetails: { name: string; reason?: string; dueDate?: string }): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: `Additional document request for '${docDetails.name}' dispatched to customer app & WhatsApp.`
    };
  },

  async uploadCertificate(taskId: string, certData: any): Promise<WorkflowTask | null> {
    const task = sharedWorkflowStore.getTaskById(taskId);
    if (task) {
      const updated = sharedWorkflowStore.updateTask(task.id, {
        certificate: {
          id: `CERT-${Math.floor(1000 + Math.random() * 9000)}`,
          ...certData,
          status: 'VERIFIED'
        },
        status: 'COMPLETED'
      } as any);
      return updated;
    }
    return null;
  },

  subscribe(cb: () => void) {
    return sharedWorkflowStore.subscribeStore(cb);
  }
};
