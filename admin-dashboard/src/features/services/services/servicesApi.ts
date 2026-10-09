import { apiClient } from '../../../core/services/apiClient';
import { sharedWorkflowStore, STORAGE_KEYS } from '../../../core/store/sharedWorkflowStore';
import { PlatformService } from '../../../shared/types/workflowTypes';

export const servicesApi = {
  async getServices(filters: { category?: string } = {}): Promise<PlatformService[]> {
    const apiRes = await apiClient.get('/services');
    if (apiRes) return apiRes;

    let result = sharedWorkflowStore.getServices();
    if (filters.category && filters.category !== 'All') {
      result = result.filter((s) => s.category === filters.category);
    }
    return result;
  },

  async getServiceById(id: string): Promise<PlatformService | undefined> {
    const apiRes = await apiClient.get(`/services/${id}`);
    if (apiRes) return apiRes;
    return sharedWorkflowStore.getServices().find(s => s.id === id);
  },

  async createService(serviceData: Omit<PlatformService, 'id'> & Partial<PlatformService>): Promise<PlatformService> {
    const apiRes = await apiClient.post('/services', serviceData);
    if (apiRes) return apiRes;
    return sharedWorkflowStore.addService(serviceData);
  },

  async updateService(id: string, patch: Partial<PlatformService>): Promise<PlatformService | null> {
    const apiRes = await apiClient.put(`/services/${id}`, patch);
    if (apiRes) return apiRes;
    return sharedWorkflowStore.updateService(id, patch);
  },

  async toggleStatus(id: string): Promise<PlatformService | null> {
    return sharedWorkflowStore.toggleServiceActive(id);
  },

  async deleteService(id: string): Promise<boolean> {
    const apiRes = await apiClient.delete(`/services/${id}`);
    if (apiRes) return apiRes;
    const services = sharedWorkflowStore.getServices().filter(s => s.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    }
    return true;
  },

  subscribe(listener: () => void): () => void {
    return sharedWorkflowStore.subscribeStore(listener);
  }
};

