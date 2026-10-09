import { apiClient } from '../../../core/services/apiClient';
import { sharedWorkflowStore, STORAGE_KEYS } from '../../../core/store/sharedWorkflowStore';

export const customersApi = {
  async getCustomers() {
    const apiRes = await apiClient.get('/customer');
    if (apiRes) return apiRes;
    return sharedWorkflowStore.getCustomers();
  },

  async getCustomerById(id: string) {
    const apiRes = await apiClient.get(`/customer/${id}`);
    if (apiRes) return apiRes;
    return sharedWorkflowStore.getCustomers((c) => c.id === id)[0];
  },

  async createCustomer(customerData: any) {
    const apiRes = await apiClient.post('/customer', customerData);
    if (apiRes) return apiRes;
    return sharedWorkflowStore.addCustomer(customerData);
  },

  async updateCustomer(id: string, patch: any) {
    const apiRes = await apiClient.put(`/customer/${id}`, patch);
    if (apiRes) return apiRes;
    return sharedWorkflowStore.updateCustomer(id, patch);
  },

  async deleteCustomer(id: string) {
    const apiRes = await apiClient.delete(`/customer/${id}`);
    if (apiRes) return apiRes;
    return sharedWorkflowStore.deleteCustomer(id);
  },

  subscribe(callback: () => void) {
    return sharedWorkflowStore.subscribeStore(callback);
  }
};
