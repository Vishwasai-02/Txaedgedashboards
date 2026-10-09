import { useState, useEffect, useCallback, useMemo } from 'react';
import { sharedWorkflowStore } from '../store/sharedWorkflowStore';
import { Customer, Employee, PlatformService, ApplicationItem, WorkflowTask, ReviewCase, LeadItem, SanctionItem, RepaymentItem, NotificationItemData } from '../../shared/types/workflowTypes';

export function useWorkflowStore<T>(selector: (store: typeof sharedWorkflowStore) => T = (store) => selector(store)): T {
  const [state, setState] = useState(() => selector(sharedWorkflowStore));

  useEffect(() => {
    setState(selector(sharedWorkflowStore));

    const unsubscribe = sharedWorkflowStore.subscribeStore(() => {
      setState(selector(sharedWorkflowStore));
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selector]);

  return state;
}

export function useCustomers(filterFn?: (c: Customer) => boolean) {
  const [customers, setCustomers] = useState(() => sharedWorkflowStore.getCustomers(filterFn));
  const [loading] = useState(false);

  const refresh = useCallback(() => {
    setCustomers(sharedWorkflowStore.getCustomers(filterFn));
  }, [filterFn]);

  useEffect(() => {
    refresh();
    const unsub = sharedWorkflowStore.subscribeStore(refresh);
    return () => unsub();
  }, [refresh]);

  return {
    customers,
    loading,
    refresh,
    getCustomerById: (id: string) => sharedWorkflowStore.getCustomers().find(c => c.id === id),
    addCustomer: (data: Partial<Customer>) => sharedWorkflowStore.addCustomer(data),
    updateCustomer: (id: string, patch: Partial<Customer>) => sharedWorkflowStore.updateCustomer(id, patch),
    deleteCustomer: (id: string) => sharedWorkflowStore.deleteCustomer(id)
  };
}

export function useTasks(filterFn?: (t: WorkflowTask) => boolean) {
  const [tasks, setTasks] = useState(() => sharedWorkflowStore.getTasks(filterFn));
  const [loading] = useState(false);

  const refresh = useCallback(() => {
    setTasks(sharedWorkflowStore.getTasks(filterFn));
  }, [filterFn]);

  useEffect(() => {
    refresh();
    const unsub = sharedWorkflowStore.subscribeStore(refresh);
    return () => unsub();
  }, [refresh]);

  return {
    tasks,
    loading,
    refresh,
    getTaskById: (id: string) => sharedWorkflowStore.getTaskById(id),
    addTask: (data: Partial<WorkflowTask>) => sharedWorkflowStore.addTask(data),
    updateTask: (id: string, patch: Partial<WorkflowTask>) => sharedWorkflowStore.updateTask(id, patch),
    toggleChecklist: (taskId: string, checkId: string, completed: boolean) => sharedWorkflowStore.updateTaskChecklist(taskId, checkId, completed)
  };
}

export function useReviewCases() {
  const [reviewCases, setReviewCases] = useState(() => sharedWorkflowStore.getReviewCases());
  const [loading] = useState(false);

  const refresh = useCallback(() => {
    setReviewCases(sharedWorkflowStore.getReviewCases());
  }, []);

  useEffect(() => {
    refresh();
    const unsub = sharedWorkflowStore.subscribeStore(refresh);
    return () => unsub();
  }, [refresh]);

  return {
    reviewCases,
    loading,
    refresh,
    rejectCase: (caseId: string, remarks: string) => sharedWorkflowStore.rejectReviewCase(caseId, remarks),
    approveCase: (caseId: string) => sharedWorkflowStore.approveReviewCase(caseId)
  };
}

export function useLoanPipeline() {
  const [leads, setLeads] = useState(() => sharedWorkflowStore.getLeads());
  const [applications, setApplications] = useState(() =>
    sharedWorkflowStore.getApplications((a) => a.id.startsWith('LN-APP') || a.domain === 'LOAN')
  );
  const [sanctions, setSanctions] = useState(() => sharedWorkflowStore.getSanctions());
  const [repayments, setRepayments] = useState(() => sharedWorkflowStore.getRepayments());
  const [loading] = useState(false);

  const refreshAll = useCallback(() => {
    setLeads(sharedWorkflowStore.getLeads());
    setApplications(sharedWorkflowStore.getApplications((a) => a.id.startsWith('LN-APP') || a.domain === 'LOAN'));
    setSanctions(sharedWorkflowStore.getSanctions());
    setRepayments(sharedWorkflowStore.getRepayments());
  }, []);

  useEffect(() => {
    refreshAll();
    const unsub = sharedWorkflowStore.subscribeStore(refreshAll);
    return () => unsub();
  }, [refreshAll]);

  return {
    leads,
    applications,
    sanctions,
    repayments,
    loading,
    addLead: (data: Partial<LeadItem>) => sharedWorkflowStore.addLead(data),
    convertLead: (leadId: string, appData?: Partial<ApplicationItem>) => sharedWorkflowStore.convertLeadToApplication(leadId, appData),
    updateSanctionStatus: (id: string, status: string) => sharedWorkflowStore.updateSanctionStatus(id, status),
    updateRepaymentStatus: (installment: number, status: string) => sharedWorkflowStore.updateRepaymentStatus(installment, status)
  };
}

export function useNotifications(role?: string, userId?: string) {
  const [notifications, setNotifications] = useState(() => sharedWorkflowStore.getNotifications());
  const [loading] = useState(false);

  const refresh = useCallback(() => {
    setNotifications(sharedWorkflowStore.getNotifications());
  }, []);

  useEffect(() => {
    refresh();
    const unsub = sharedWorkflowStore.subscribeStore(refresh);
    return () => unsub();
  }, [refresh]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (userId && n.userId && n.userId !== userId) return false;
      if (role && n.targetRole && n.targetRole !== role && n.targetRole !== 'ALL') return false;
      return true;
    });
  }, [notifications, role, userId]);

  const unreadCount = useMemo(() => {
    return filteredNotifications.filter((n: NotificationItemData) => !n.read).length;
  }, [filteredNotifications]);

  return {
    notifications: filteredNotifications,
    unreadCount,
    loading,
    refresh,
    markRead: (id: string) => sharedWorkflowStore.markNotificationRead(id),
    markAllRead: () => sharedWorkflowStore.markAllNotificationsRead(),
    addNotification: (data: Partial<NotificationItemData>) => sharedWorkflowStore.addNotification(data)
  };
}

export function useEmployees(filterFn?: (e: Employee) => boolean) {
  const [employees, setEmployees] = useState(() => sharedWorkflowStore.getEmployees(filterFn));
  const [loading] = useState(false);

  const refresh = useCallback(() => {
    setEmployees(sharedWorkflowStore.getEmployees(filterFn));
  }, [filterFn]);

  useEffect(() => {
    refresh();
    const unsub = sharedWorkflowStore.subscribeStore(refresh);
    return () => unsub();
  }, [refresh]);

  const managers = useMemo(() => employees.filter((e) => e.role === 'MANAGER' || e.role === 'CA_MANAGER' || e.role === 'LOAN_MANAGER'), [employees]);
  const agents = useMemo(() => employees.filter((e) => e.role === 'AGENT' || e.role === 'CA_AGENT' || e.role === 'LOAN_AGENT'), [employees]);

  return {
    employees,
    managers,
    agents,
    loading,
    refresh,
    addEmployee: (data: Partial<Employee>) => sharedWorkflowStore.addEmployee(data),
    updateEmployee: (id: string, patch: Partial<Employee>) => sharedWorkflowStore.updateEmployee(id, patch)
  };
}

export function useServices(filterFn?: (s: PlatformService) => boolean) {
  const [services, setServices] = useState(() => {
    const list = sharedWorkflowStore.getServices();
    return filterFn ? list.filter(filterFn) : list;
  });
  const [loading] = useState(false);

  const refresh = useCallback(() => {
    const list = sharedWorkflowStore.getServices();
    setServices(filterFn ? list.filter(filterFn) : list);
  }, [filterFn]);

  useEffect(() => {
    refresh();
    const unsub = sharedWorkflowStore.subscribeStore(refresh);
    return () => unsub();
  }, [refresh]);

  return {
    services,
    loading,
    refresh,
    getServiceById: (id: string) => sharedWorkflowStore.getServices().find(s => s.id === id),
    addService: (data: Omit<PlatformService, 'id'> & Partial<PlatformService>) => sharedWorkflowStore.addService(data),
    updateService: (id: string, patch: Partial<PlatformService>) => sharedWorkflowStore.updateService(id, patch),
    toggleStatus: (id: string) => sharedWorkflowStore.toggleServiceActive(id)
  };
}

export function useApplications(filterFn?: (a: ApplicationItem) => boolean) {
  const [applications, setApplications] = useState(() => {
    const list = sharedWorkflowStore.getApplications();
    return filterFn ? list.filter(filterFn) : list;
  });
  const [loading] = useState(false);

  const refresh = useCallback(() => {
    const list = sharedWorkflowStore.getApplications();
    setApplications(filterFn ? list.filter(filterFn) : list);
  }, [filterFn]);

  useEffect(() => {
    refresh();
    const unsub = sharedWorkflowStore.subscribeStore(refresh);
    return () => unsub();
  }, [refresh]);

  return {
    applications,
    loading,
    refresh,
    getApplicationById: (id: string) => sharedWorkflowStore.getApplicationById(id),
    addApplication: (data: Partial<ApplicationItem>) => sharedWorkflowStore.addApplication(data),
    updateApplication: (id: string, patch: Partial<ApplicationItem>) => sharedWorkflowStore.updateApplication(id, patch),
    updateStatus: (id: string, status: string) => sharedWorkflowStore.updateApplicationStatus(id, status)
  };
}

export function useRevenue() {
  const getSummary = () => {
    const txs = sharedWorkflowStore.getTransactions();
    const totalRevenue = txs.reduce((sum, t) => sum + (t.rawAmount || 0), 0);
    return { transactions: txs, totalRevenue, count: txs.length };
  };

  const [revenueData, setRevenueData] = useState(getSummary);
  const [loading] = useState(false);

  const refresh = useCallback(() => {
    setRevenueData(getSummary());
  }, []);

  useEffect(() => {
    refresh();
    const unsub = sharedWorkflowStore.subscribeStore(refresh);
    return () => unsub();
  }, [refresh]);

  return {
    revenueData,
    loading,
    refresh
  };
}
