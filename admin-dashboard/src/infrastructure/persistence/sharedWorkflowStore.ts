import { STORAGE_KEYS, CURRENT_STORE_VERSION } from './storageKeys';
import { INITIAL_CUSTOMERS, INITIAL_EMPLOYEES, INITIAL_SERVICES, INITIAL_APPLICATIONS, INITIAL_TRANSACTIONS, INITIAL_NOTIFICATIONS } from './seeds/baseSeeds';
import { INITIAL_TASKS, INITIAL_REVIEW_CASES, INITIAL_LEADS, INITIAL_SANCTIONS, INITIAL_REPAYMENTS, INITIAL_MESSAGES } from './seeds/workflowSeeds';
import { subscribeStore, notifyStoreListeners, registerBroadcastListener } from './storeCore';
import { createCustomerSlice } from './storeSlices/customerSlice';
import { createApplicationSlice } from './storeSlices/applicationSlice';
import { createWorkflowSlice } from './storeSlices/workflowSlice';
import { createCommunicationSlice } from './storeSlices/communicationSlice';
import { Customer, Employee, PlatformService, ApplicationItem, WorkflowTask, ReviewCase, LeadItem, SanctionItem, RepaymentItem, TransactionItem, NotificationItemData, ChatMessage } from '../../shared/types/workflowTypes';

interface StoreState {
  customers: Customer[];
  employees: Employee[];
  services: PlatformService[];
  applications: ApplicationItem[];
  tasks: WorkflowTask[];
  reviewCases: ReviewCase[];
  leads: LeadItem[];
  sanctions: SanctionItem[];
  repayments: RepaymentItem[];
  transactions: TransactionItem[];
  notifications: NotificationItemData[];
  messages: ChatMessage[];
}

const storeState: StoreState = {
  customers: [],
  employees: [],
  services: [],
  applications: [],
  tasks: [],
  reviewCases: [],
  leads: [],
  sanctions: [],
  repayments: [],
  transactions: [],
  notifications: [],
  messages: []
};

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Failed to load ${key} from storage:`, err);
    return fallback;
  }
}

function saveToStorage(key: string, data: unknown): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save ${key} to storage:`, err);
  }
}

export function initStore(forceReset?: boolean): void {
  if (typeof localStorage === 'undefined') return;

  if (forceReset) {
    localStorage.clear();
  }

  const version = localStorage.getItem(STORAGE_KEYS.STORE_VERSION);
  if (version !== CURRENT_STORE_VERSION) {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEYS.STORE_VERSION, CURRENT_STORE_VERSION);
  }

  storeState.customers = loadFromStorage(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  storeState.employees = loadFromStorage(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  storeState.services = loadFromStorage(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
  storeState.applications = loadFromStorage(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  storeState.tasks = loadFromStorage(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  storeState.reviewCases = loadFromStorage(STORAGE_KEYS.REVIEW_CASES, INITIAL_REVIEW_CASES);
  storeState.leads = loadFromStorage(STORAGE_KEYS.LEADS, INITIAL_LEADS);
  storeState.sanctions = loadFromStorage(STORAGE_KEYS.SANCTIONS, INITIAL_SANCTIONS);
  storeState.repayments = loadFromStorage(STORAGE_KEYS.REPAYMENTS, INITIAL_REPAYMENTS);
  storeState.transactions = loadFromStorage(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  storeState.notifications = loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  storeState.messages = loadFromStorage(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);

  saveToStorage(STORAGE_KEYS.CUSTOMERS, storeState.customers);
  saveToStorage(STORAGE_KEYS.EMPLOYEES, storeState.employees);
  saveToStorage(STORAGE_KEYS.SERVICES, storeState.services);
  saveToStorage(STORAGE_KEYS.APPLICATIONS, storeState.applications);
  saveToStorage(STORAGE_KEYS.TASKS, storeState.tasks);
  saveToStorage(STORAGE_KEYS.REVIEW_CASES, storeState.reviewCases);
  saveToStorage(STORAGE_KEYS.LEADS, storeState.leads);
  saveToStorage(STORAGE_KEYS.SANCTIONS, storeState.sanctions);
  saveToStorage(STORAGE_KEYS.REPAYMENTS, storeState.repayments);
  saveToStorage(STORAGE_KEYS.TRANSACTIONS, storeState.transactions);
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, storeState.notifications);
  saveToStorage(STORAGE_KEYS.MESSAGES, storeState.messages);

  registerBroadcastListener(() => {
    initStore();
    notifyStoreListeners();
  });
}

export function resetStore(): void {
  if (typeof window === 'undefined') return;
  localStorage.clear();
  initStore();
  notifyStoreListeners();
}

initStore();

const customerSlice = createCustomerSlice(storeState, saveToStorage);
const applicationSlice = createApplicationSlice(storeState, saveToStorage);
const workflowSlice = createWorkflowSlice(storeState, saveToStorage);
const communicationSlice = createCommunicationSlice(storeState, saveToStorage);

export { STORAGE_KEYS, subscribeStore };

export const initStorage = initStore;
export const getCustomers = customerSlice.getCustomers;
export const addCustomer = customerSlice.addCustomer;
export const updateCustomer = customerSlice.updateCustomer;
export const deleteCustomer = customerSlice.deleteCustomer;
export const getEmployees = customerSlice.getEmployees;
export const addEmployee = customerSlice.addEmployee;
export const updateEmployee = customerSlice.updateEmployee;
export const deleteEmployee = customerSlice.deleteEmployee;

export const getServices = applicationSlice.getServices;
export const addService = applicationSlice.addService;
export const updateService = applicationSlice.updateService;
export const toggleServiceActive = applicationSlice.toggleServiceActive;
export const getApplications = applicationSlice.getApplications;
export const getApplicationById = applicationSlice.getApplicationById;
export const addApplication = applicationSlice.addApplication;
export const updateApplicationStatus = applicationSlice.updateApplicationStatus;
export const updateApplication = applicationSlice.updateApplication;
export const getTasks = applicationSlice.getTasks;
export const getTaskById = applicationSlice.getTaskById;
export const updateTask = applicationSlice.updateTask;
export const addTask = applicationSlice.addTask;
export const updateTaskStatus = applicationSlice.updateTaskStatus;
export const updateTaskChecklist = applicationSlice.updateTaskChecklist;
export const assignTask = applicationSlice.assignTask;

export const getReviewCases = workflowSlice.getReviewCases;
export const addReviewCase = workflowSlice.addReviewCase;
export const updateReviewDocumentStatus = workflowSlice.updateReviewDocumentStatus;
export const approveReviewCase = workflowSlice.approveReviewCase;
export const rejectReviewCase = workflowSlice.rejectReviewCase;
export const getLeads = workflowSlice.getLeads;
export const addLead = workflowSlice.addLead;
export const updateLeadStatus = workflowSlice.updateLeadStatus;
export const convertLeadToApplication = workflowSlice.convertLeadToApplication;
export const getSanctions = workflowSlice.getSanctions;
export const addSanction = workflowSlice.addSanction;
export const updateSanctionStatus = workflowSlice.updateSanctionStatus;
export const getRepayments = workflowSlice.getRepayments;
export const updateRepaymentStatus = workflowSlice.updateRepaymentStatus;
export const getTransactions = workflowSlice.getTransactions;
export const addTransaction = workflowSlice.addTransaction;

export const getNotifications = communicationSlice.getNotifications;
export const addNotification = communicationSlice.addNotification;
export const markNotificationRead = communicationSlice.markNotificationRead;
export const markAllNotificationsRead = communicationSlice.markAllNotificationsRead;
export const getMessages = communicationSlice.getMessages;
export const sendMessage = communicationSlice.sendMessage;
export const markMessagesRead = communicationSlice.markMessagesRead;
export const getConversation = communicationSlice.getConversation;
export const getDirectMessages = communicationSlice.getDirectMessages;
export const sendDirectMessage = communicationSlice.sendDirectMessage;

export const sharedWorkflowStore = {
  initStore,
  initStorage,
  resetStore,
  subscribeStore,
  subscribe: subscribeStore,
  getCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getServices,
  addService,
  updateService,
  toggleServiceActive,
  getApplications,
  getApplicationById,
  addApplication,
  updateApplicationStatus,
  updateApplication,
  getTasks,
  getTaskById,
  updateTask,
  addTask,
  updateTaskStatus,
  updateTaskChecklist,
  assignTask,
  getReviewCases,
  addReviewCase,
  updateReviewDocumentStatus,
  approveReviewCase,
  rejectReviewCase,
  getLeads,
  addLead,
  updateLeadStatus,
  convertLeadToApplication,
  getSanctions,
  addSanction,
  updateSanctionStatus,
  getRepayments,
  updateRepaymentStatus,
  getTransactions,
  addTransaction,
  getNotifications,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  getMessages,
  sendMessage,
  markMessagesRead,
  getConversation,
  getDirectMessages,
  sendDirectMessage,
};

