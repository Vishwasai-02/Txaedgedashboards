import { PlatformService, ApplicationItem, WorkflowTask } from '../../../shared/types/workflowTypes';
import { STORAGE_KEYS } from '../storageKeys';
import { publishStoreEvent } from '../storeCore';

export interface ApplicationStoreState {
  services: PlatformService[];
  applications: ApplicationItem[];
  tasks: WorkflowTask[];
}

export const createApplicationSlice = (
  state: ApplicationStoreState,
  saveToStorage: (key: string, data: unknown) => void
) => ({
  getServices: (): PlatformService[] => [...state.services],

  addService: (serviceData: Omit<PlatformService, 'id'> & Partial<PlatformService>): PlatformService => {
    const newService: PlatformService = {
      id: serviceData.id || `SRV-${Date.now().toString().slice(-4)}`,
      code: serviceData.code || 'TX-GEN',
      name: serviceData.name || 'General Tax Service',
      category: serviceData.category || 'Advisory',
      fee: serviceData.fee || 1999,
      sla: serviceData.sla || '3 Business Days',
      active: serviceData.active !== undefined ? serviceData.active : true,
      desc: serviceData.desc || ''
    };
    state.services = [newService, ...state.services];
    saveToStorage(STORAGE_KEYS.SERVICES, state.services);
    publishStoreEvent('SERVICE_ADDED', newService);
    return newService;
  },

  updateService: (id: string, updates: Partial<PlatformService>): PlatformService | null => {
    let updated: PlatformService | null = null;
    state.services = state.services.map(s => {
      if (s.id === id) {
        updated = { ...s, ...updates };
        return updated;
      }
      return s;
    });
    if (updated) {
      saveToStorage(STORAGE_KEYS.SERVICES, state.services);
      publishStoreEvent('SERVICE_UPDATED', updated);
    }
    return updated;
  },

  toggleServiceActive: (id: string): PlatformService | null => {
    let updated: PlatformService | null = null;
    state.services = state.services.map(s => {
      if (s.id === id) {
        updated = { ...s, active: !s.active };
        return updated;
      }
      return s;
    });
    if (updated) {
      saveToStorage(STORAGE_KEYS.SERVICES, state.services);
      publishStoreEvent('SERVICE_UPDATED', updated);
    }
    return updated;
  },

  getApplications: (filterFn?: (a: ApplicationItem) => boolean): ApplicationItem[] =>
    filterFn ? state.applications.filter(filterFn) : [...state.applications],

  getApplicationById: (id: string): ApplicationItem | undefined => {
    return state.applications.find(a => String(a.id) === String(id));
  },

  addApplication: (appData: Partial<ApplicationItem>): ApplicationItem => {
    const newApp: ApplicationItem = {
      id: appData.id || `APP${Date.now().toString().slice(-4)}`,
      submittedDate: new Date().toISOString().split('T')[0],
      status: appData.status || 'PROCESSING',
      paymentStatus: appData.paymentStatus || 'COMPLETED',
      priority: appData.priority || 'MEDIUM',
      ...appData
    };
    state.applications = [newApp, ...state.applications];
    saveToStorage(STORAGE_KEYS.APPLICATIONS, state.applications);
    publishStoreEvent('APPLICATION_ADDED', newApp);
    return newApp;
  },

  updateApplicationStatus: (id: string, status: string): ApplicationItem | null => {
    let updated: ApplicationItem | null = null;
    state.applications = state.applications.map(a => {
      if (a.id === id) {
        updated = { ...a, status };
        return updated;
      }
      return a;
    });
    if (updated) {
      saveToStorage(STORAGE_KEYS.APPLICATIONS, state.applications);
      publishStoreEvent('APPLICATION_STATUS_CHANGED', updated);
    }
    return updated;
  },

  updateApplication: (id: string, updates: Partial<ApplicationItem>): ApplicationItem | null => {
    let updated: ApplicationItem | null = null;
    state.applications = state.applications.map(a => {
      if (a.id === id) {
        updated = { ...a, ...updates };
        return updated;
      }
      return a;
    });
    if (updated) {
      saveToStorage(STORAGE_KEYS.APPLICATIONS, state.applications);
      publishStoreEvent('APPLICATION_UPDATED', updated);
    }
    return updated;
  },

  getTasks: (filterFn?: (t: WorkflowTask) => boolean): WorkflowTask[] =>
    filterFn ? state.tasks.filter(filterFn) : [...state.tasks],

  getTaskById: (idOrQueueId: string): WorkflowTask | undefined => {
    return state.tasks.find(t => t.id === idOrQueueId || t.serviceQueueId === idOrQueueId);
  },

  updateTask: (idOrQueueId: string, updates: Partial<WorkflowTask>): WorkflowTask | null => {
    let updated: WorkflowTask | null = null;
    state.tasks = state.tasks.map(t => {
      if (t.id === idOrQueueId || t.serviceQueueId === idOrQueueId) {
        updated = { ...t, ...updates };
        return updated;
      }
      return t;
    });
    if (updated) {
      saveToStorage(STORAGE_KEYS.TASKS, state.tasks);
      publishStoreEvent('TASK_UPDATED', updated);
    }
    return updated;
  },

  addTask: (taskData: Partial<WorkflowTask>): WorkflowTask => {
    const newTask: WorkflowTask = {
      id: taskData.id || `TSK-${Date.now().toString().slice(-4)}`,
      assignedDate: new Date().toISOString().split('T')[0],
      status: taskData.status || 'ASSIGNED',
      priority: taskData.priority || 'MEDIUM',
      client: taskData.client || taskData.customerName || 'Client',
      service: taskData.service || 'Tax Service',
      domain: taskData.domain || 'CA',
      assignedTo: taskData.assignedTo || 'AGT001',
      assignedAgent: taskData.assignedAgent || 'Suresh Kumar',
      dueDate: taskData.dueDate || 'In 5 Days',
      documentsCount: taskData.documentsCount || 0,
      checklist: taskData.checklist || [],
      ...taskData
    };
    state.tasks = [newTask, ...state.tasks];
    saveToStorage(STORAGE_KEYS.TASKS, state.tasks);
    publishStoreEvent('TASK_ADDED', newTask);
    return newTask;
  },

  updateTaskStatus: (id: string, status: string): WorkflowTask | null => {
    let updated: WorkflowTask | null = null;
    state.tasks = state.tasks.map(t => {
      if (t.id === id) {
        updated = { ...t, status };
        return updated;
      }
      return t;
    });
    if (updated) {
      saveToStorage(STORAGE_KEYS.TASKS, state.tasks);
      publishStoreEvent('TASK_STATUS_CHANGED', updated);
    }
    return updated;
  },

  updateTaskChecklist: (taskId: string, checklistId: string, completed: boolean): WorkflowTask | null => {
    let updated: WorkflowTask | null = null;
    state.tasks = state.tasks.map(t => {
      if (t.id === taskId) {
        const updatedChecklist = t.checklist.map(c => c.id === checklistId ? { ...c, completed } : c);
        updated = { ...t, checklist: updatedChecklist };
        return updated;
      }
      return t;
    });
    if (updated) {
      saveToStorage(STORAGE_KEYS.TASKS, state.tasks);
      publishStoreEvent('TASK_CHECKLIST_UPDATED', updated);
    }
    return updated;
  },

  assignTask: (taskId: string, agentId: string, agentName: string): WorkflowTask | null => {
    let updated: WorkflowTask | null = null;
    state.tasks = state.tasks.map(t => {
      if (t.id === taskId) {
        updated = { ...t, assignedTo: agentId, assignedAgent: agentName, status: 'ASSIGNED' };
        return updated;
      }
      return t;
    });
    if (updated) {
      saveToStorage(STORAGE_KEYS.TASKS, state.tasks);
      publishStoreEvent('TASK_ASSIGNED', updated);
    }
    return updated;
  }
});
