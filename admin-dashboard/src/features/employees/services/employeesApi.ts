import { apiClient } from '../../../core/services/apiClient';
import { ROLES } from '../../../core/constants/roles';
import { sharedWorkflowStore, STORAGE_KEYS } from '../../../core/store/sharedWorkflowStore';

export const employeesApi = {
  async getManagers() {
    const apiRes = await apiClient.get('/employee?role=MANAGER');
    if (apiRes) return apiRes;
    return sharedWorkflowStore.getEmployees((e) => e.role === 'MANAGER' || e.role === 'CA_MANAGER' || e.role === 'LOAN_MANAGER');
  },

  async getAgents() {
    const apiRes = await apiClient.get('/employee?role=AGENT');
    if (apiRes) return apiRes;
    return sharedWorkflowStore.getEmployees((e) => e.role === 'AGENT' || e.role === 'CA_AGENT' || e.role === 'LOAN_AGENT');
  },

  async getEmployees(filterFn?: (e: any) => boolean) {
    const apiRes = await apiClient.get('/employee');
    if (apiRes) return apiRes;
    return sharedWorkflowStore.getEmployees(filterFn);
  },

  async createEmployee(employeeData: any) {
    const apiRes = await apiClient.post('/employee', employeeData);
    if (apiRes) return apiRes;
    return sharedWorkflowStore.addEmployee(employeeData);
  },

  async updateEmployee(id: string, patch: any) {
    return sharedWorkflowStore.updateEmployee(id, patch);
  },

  async toggleStatus(id: string) {
    const emp = sharedWorkflowStore.getEmployees((e) => e.id === id)[0];
    if (emp) {
      const newStatus = emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      return sharedWorkflowStore.updateEmployee(id, { status: newStatus });
    }
    return null;
  },

  async resetPassword(id: string) {
    return { success: true, message: `Password reset email sent for employee ${id}` };
  },

  subscribe(listener: () => void) {
    return sharedWorkflowStore.subscribeStore(listener);
  }
};
