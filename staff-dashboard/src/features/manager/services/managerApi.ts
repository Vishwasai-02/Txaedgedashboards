import { apiClient } from '../../../core/services/apiClient';
import { APPLICATION_STATUS } from '../../../core/constants/statusEnums';
import { authStore } from '../../../core/store/authStore';
import { sharedWorkflowStore } from '../../../core/store/sharedWorkflowStore';
import { ApplicationItem, Customer, WorkflowTask, Employee } from '../../../shared/types/workflowTypes';

export const managerApi = {
  async getOverviewMetrics() {
    const user = authStore.getUser();
    const domain = user?.domain || 'CA';
    const apiRes = await apiClient.get(`/dashboard/manager/metrics?domain=${domain}`);
    if (apiRes) return apiRes;

    const apps = sharedWorkflowStore.getApplications().filter((a: ApplicationItem) => a.domain === domain);
    const customers = sharedWorkflowStore.getCustomers().filter((c: Customer) => c.domain === domain);
    const tasks = sharedWorkflowStore.getTasks().filter((t: WorkflowTask) => t.domain === domain);

    const pendingApps = apps.filter((a: ApplicationItem) => a.status !== 'COMPLETED' && a.status !== 'DISBURSED');
    const completedApps = apps.filter((a: ApplicationItem) => a.status === 'COMPLETED' || a.status === 'DISBURSED');

    if (domain === 'LOAN') {
      return {
        totalCustomers: String(customers.length || 185),
        totalApplications: String(apps.length || 340),
        newApplications: '8',
        pendingApplications: String(pendingApps.length || 19),
        documentsPending: '7',
        paymentsPending: '4',
        tasksPending: String(tasks.filter((t: WorkflowTask) => t.status !== 'COMPLETED').length || 12),
        completedApplications: String(completedApps.length || 321),
        todaysTasks: '15',
        overdueTasks: '1',
        revenue: '₹ 18.6 L'
      };
    }

    return {
      totalCustomers: String(customers.length || 420),
      totalApplications: String(apps.length || 840),
      newApplications: '18',
      pendingApplications: String(pendingApps.length || 42),
      documentsPending: '14',
      paymentsPending: '9',
      tasksPending: String(tasks.filter((t: WorkflowTask) => t.status !== 'COMPLETED').length || 26),
      completedApplications: String(completedApps.length || 798),
      todaysTasks: '34',
      overdueTasks: '2',
      revenue: '₹ 12.4 L'
    };
  },

  async getIncomingQueue(): Promise<ApplicationItem[]> {
    const user = authStore.getUser();
    const domain = user?.domain || 'CA';
    const apiRes = await apiClient.get(`/casemanagement/incoming?domain=${domain}`);
    if (apiRes) return apiRes;

    return sharedWorkflowStore.getApplications().filter((app: ApplicationItem) => !app.domain || app.domain === domain);
  },

  async getApplication(id: string): Promise<ApplicationItem | null> {
    const user = authStore.getUser();
    const domain = user?.domain || 'CA';
    const apiRes = await apiClient.get(`/casemanagement/applications/${id}`);
    if (apiRes) return apiRes;

    const found = sharedWorkflowStore.getApplications().find((app: ApplicationItem) => app.id === id);
    if (found && found.domain && found.domain !== domain) {
      throw new Error(`ACCESS DENIED: Domain isolation policy restricts access to ${found.domain} records.`);
    }
    return found || sharedWorkflowStore.getApplications().find((app: ApplicationItem) => app.domain === domain) || null;
  },

  async updateDocumentStatus(appId: string, docId: string, newStatus: string, remarks?: string): Promise<boolean> {
    const app = sharedWorkflowStore.getApplications().find((a: ApplicationItem) => a.id === appId);
    if (app && app.documents) {
      const updatedDocs = app.documents.map((d: any) =>
        d.id === docId ? { ...d, status: newStatus, remarks: remarks || d.remarks } : d
      );
      sharedWorkflowStore.updateApplication(appId, { documents: updatedDocs });
    }
    return true;
  },

  async assignAgent(appId: string, agentName: string, priority?: string, deadline?: string, instructions?: string): Promise<boolean> {
    const app = sharedWorkflowStore.getApplications().find((a: ApplicationItem) => a.id === appId);
    if (app) {
      sharedWorkflowStore.updateApplication(appId, {
        assignedExecutive: agentName,
        priority: priority || app.priority,
        dueDate: deadline || app.dueDate,
        status: APPLICATION_STATUS.ASSIGNED
      });

      sharedWorkflowStore.addTask({
        applicationId: appId,
        service: app.service || app.loanType || 'Statutory Filing',
        customerName: app.customerName || app.borrower || 'Client',
        client: app.customerName || app.borrower || 'Client',
        domain: app.domain || 'CA',
        assignedAgent: agentName,
        priority: priority || 'HIGH',
        deadline: deadline || '2026-10-25',
        dueDate: deadline || '25 Oct 2026',
        instructions: instructions || 'Please verify client documentation and complete filing.'
      });
    }
    return true;
  },

  async updatePricing(appId: string, pricingData: { basePrice?: number | string; additionalCharges?: number | string; discount?: number | string }): Promise<boolean> {
    const app = sharedWorkflowStore.getApplications().find((a: ApplicationItem) => a.id === appId);
    if (app) {
      const basePrice = Number(pricingData.basePrice) || app.basePrice || 0;
      const additionalCharges = Number(pricingData.additionalCharges) || app.additionalCharges || 0;
      const discount = Number(pricingData.discount) || app.discount || 0;
      const finalAmount = basePrice + additionalCharges - discount;

      sharedWorkflowStore.updateApplication(appId, {
        basePrice,
        additionalCharges,
        discount,
        finalAmount
      });
    }
    return true;
  },

  async getTeamMonitoring(): Promise<Employee[]> {
    const user = authStore.getUser();
    const domain = user?.domain || 'CA';
    const apiRes = await apiClient.get(`/task/team-monitoring?domain=${domain}`);
    if (apiRes) return apiRes;

    const agents = sharedWorkflowStore.getEmployees().filter((e: Employee) => e.role === 'AGENT');
    return agents.filter((agent: Employee) => !agent.domain || agent.domain === domain);
  },

  subscribe(listener: () => void): () => void {
    return sharedWorkflowStore.subscribeStore(listener);
  }
};

