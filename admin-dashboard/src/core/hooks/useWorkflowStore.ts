import { useState, useEffect, useCallback, useMemo } from 'react';
import { sharedWorkflowStore } from '../store/sharedWorkflowStore';
import { Customer, Employee, PlatformService, ApplicationItem, NotificationItemData } from '../../shared/types/workflowTypes';

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
    updateEmployee: (id: string, patch: Partial<Employee>) => sharedWorkflowStore.updateEmployee(id, patch),
    toggleStatus: (id: string) => {
      const emp = sharedWorkflowStore.getEmployees().find(e => e.id === id);
      if (emp) {
        return sharedWorkflowStore.updateEmployee(id, { status: emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
      }
      return null;
    }
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
