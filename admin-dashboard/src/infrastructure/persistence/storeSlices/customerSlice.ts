import { Customer, Employee } from '../../../shared/types/workflowTypes';
import { STORAGE_KEYS } from '../storageKeys';
import { publishStoreEvent } from '../storeCore';

export interface CustomerStoreState {
  customers: Customer[];
  employees: Employee[];
}

export const createCustomerSlice = (
  state: CustomerStoreState,
  saveToStorage: (key: string, data: unknown) => void
) => ({
  getCustomers: (filterFn?: (c: Customer) => boolean): Customer[] =>
    filterFn ? state.customers.filter(filterFn) : [...state.customers],
  
  addCustomer: (customerData: Partial<Customer>): Customer => {
    const defaults: Customer = {
      id: `CUST-${Date.now().toString().slice(-4)}`,
      name: '',
      email: '',
      phone: '',
      businessName: '',
      pan: '',
      gstin: '',
      kycStatus: 'VERIFIED',
      domain: 'CA',
      status: 'ACTIVE',
      totalApplications: 0,
      activeFilings: 0,
      totalFilings: 0,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    const newCustomer: Customer = { ...defaults, ...customerData };
    state.customers = [newCustomer, ...state.customers];
    saveToStorage(STORAGE_KEYS.CUSTOMERS, state.customers);
    publishStoreEvent('CUSTOMER_ADDED', newCustomer);
    return newCustomer;
  },

  updateCustomer: (id: string, updates: Partial<Customer>): Customer | null => {
    let updated: Customer | null = null;
    state.customers = state.customers.map(c => {
      if (c.id === id) {
        updated = { ...c, ...updates };
        return updated;
      }
      return c;
    });
    if (updated) {
      saveToStorage(STORAGE_KEYS.CUSTOMERS, state.customers);
      publishStoreEvent('CUSTOMER_UPDATED', updated);
    }
    return updated;
  },

  deleteCustomer: (id: string): boolean => {
    const prevLen = state.customers.length;
    state.customers = state.customers.filter(c => c.id !== id);
    const deleted = state.customers.length < prevLen;
    if (deleted) {
      saveToStorage(STORAGE_KEYS.CUSTOMERS, state.customers);
      publishStoreEvent('CUSTOMER_DELETED', id);
    }
    return deleted;
  },

  getEmployees: (filterFn?: (e: Employee) => boolean): Employee[] =>
    filterFn ? state.employees.filter(filterFn) : [...state.employees],

  addEmployee: (employeeData: Partial<Employee>): Employee => {
    const defaults: Employee = {
      id: (employeeData.role === 'MANAGER' ? `MGR${Date.now().toString().slice(-3)}` : `AGT${Date.now().toString().slice(-3)}`),
      name: '',
      email: '',
      role: 'AGENT',
      domain: 'CA',
      phone: '',
      team: 'Tax & Advisory',
      status: 'ACTIVE',
      joinedDate: new Date().toISOString().split('T')[0]
    };
    const newEmp: Employee = { ...defaults, ...employeeData };
    state.employees = [newEmp, ...state.employees];
    saveToStorage(STORAGE_KEYS.EMPLOYEES, state.employees);
    publishStoreEvent('EMPLOYEE_ADDED', newEmp);
    return newEmp;
  },

  updateEmployee: (id: string, updates: Partial<Employee>): Employee | null => {
    let updated: Employee | null = null;
    state.employees = state.employees.map(e => {
      if (e.id === id) {
        updated = { ...e, ...updates };
        return updated;
      }
      return e;
    });
    if (updated) {
      saveToStorage(STORAGE_KEYS.EMPLOYEES, state.employees);
      publishStoreEvent('EMPLOYEE_UPDATED', updated);
    }
    return updated;
  },

  deleteEmployee: (id: string): boolean => {
    const prevLen = state.employees.length;
    state.employees = state.employees.filter(e => e.id !== id);
    const deleted = state.employees.length < prevLen;
    if (deleted) {
      saveToStorage(STORAGE_KEYS.EMPLOYEES, state.employees);
      publishStoreEvent('EMPLOYEE_DELETED', id);
    }
    return deleted;
  }
});
