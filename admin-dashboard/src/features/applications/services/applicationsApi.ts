import { apiClient } from '../../../core/services/apiClient';
import { sharedWorkflowStore, STORAGE_KEYS } from '../../../core/store/sharedWorkflowStore';
import { ApplicationItem } from '../../../shared/types/workflowTypes';

export interface ApplicationFilters {
  status?: string;
  priority?: string;
  domain?: string;
}

export const applicationsApi = {
  async getApplications(filters: ApplicationFilters = {}): Promise<ApplicationItem[]> {
    const apiRes = await apiClient.get('/casemanagement/applications');
    if (apiRes) return apiRes as ApplicationItem[];

    let result = sharedWorkflowStore.getApplications();
    if (filters.status) {
      result = result.filter((app: ApplicationItem) => app.status === filters.status);
    }
    if (filters.priority) {
      result = result.filter((app: ApplicationItem) => app.priority === filters.priority);
    }
    if (filters.domain) {
      result = result.filter((app: ApplicationItem) => app.domain === filters.domain);
    }
    return result;
  },

  async getApplicationById(id: string): Promise<ApplicationItem | undefined> {
    const apiRes = await apiClient.get(`/casemanagement/applications/${id}`);
    if (apiRes) return apiRes as ApplicationItem;
    return sharedWorkflowStore.getApplicationById(id);
  },

  async createApplication(applicationData: Partial<ApplicationItem>): Promise<ApplicationItem> {
    const apiRes = await apiClient.post('/casemanagement/applications', applicationData);
    if (apiRes) return apiRes as ApplicationItem;
    return sharedWorkflowStore.addApplication(applicationData);
  },

  async updateStatus(id: string, newStatus: string): Promise<ApplicationItem | null> {
    return sharedWorkflowStore.updateApplicationStatus(id, newStatus);
  },

  async updateApplication(id: string, patch: Partial<ApplicationItem>): Promise<ApplicationItem | null> {
    return sharedWorkflowStore.updateApplication(id, patch);
  },

  subscribe(listener: (data?: any) => void): () => void {
    return sharedWorkflowStore.subscribeStore(listener);
  }
};
