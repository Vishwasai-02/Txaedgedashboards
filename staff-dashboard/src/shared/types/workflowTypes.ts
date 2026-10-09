export type DomainType = 'CA' | 'LOAN';
export type RoleType = 'SUPER_ADMIN' | 'CA_MANAGER' | 'LOAN_MANAGER' | 'CA_AGENT' | 'LOAN_AGENT' | 'MANAGER' | 'AGENT';
export type KycStatus = 'VERIFIED' | 'PENDING_DOCS' | 'REJECTED' | 'UNDER_REVIEW';
export type ApplicationStatus = 'PROCESSING' | 'PAYMENT_PENDING' | 'ADDITIONAL_DOCUMENT_REQUIRED' | 'EXTERNAL_PROCESSING' | 'COMPLETED' | 'IN_PROGRESS' | 'SANCTIONED' | 'DISBURSED';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED' | 'DISBURSED';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  pan: string;
  gstin: string;
  totalApplications: number;
  activeFilings: number;
  totalFilings: number;
  kycStatus: KycStatus | string;
  joinedDate: string;
  assignedManagerId?: string;
  assignedManagerName?: string;
  domain: DomainType | string;
  status: 'ACTIVE' | 'INACTIVE' | string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: RoleType | string;
  domain: DomainType | string;
  phone: string;
  team: string;
  status: 'ACTIVE' | 'INACTIVE' | string;
  directReports?: number;
  joinedDate: string;
  managerId?: string;
  managerName?: string;
  activeCases?: number;
  completedCases?: number;
  rating?: number;
}

export interface PlatformService {
  id: string;
  code: string;
  name: string;
  category: string;
  fee: number;
  sla: string;
  active: boolean;
  desc: string;
}

export interface ApplicationItem {
  id: string;
  customerName?: string;
  customerPhone?: string;
  service?: string;
  domain?: DomainType | string;
  submittedDate?: string;
  documentsCount?: string | number;
  paymentStatus?: string;
  assignedExecutive?: string;
  priority?: PriorityLevel | string;
  status: ApplicationStatus | string;
  dueDate?: string;
  borrower?: string;
  applicantType?: string;
  loanType?: string;
  requestedAmount?: number;
  approvedAmount?: number;
  tenureMonths?: number;
  roi?: string;
  cibilScore?: number;
  stage?: string;
  bankPartner?: string;
  date?: string;
  foir?: string;
  turnover?: string;
  documents?: ReviewDocument[] | any[];
  basePrice?: number;
  additionalCharges?: number;
  discount?: number;
  finalAmount?: number;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface WorkflowTask {
  id: string;
  serviceQueueId?: string;
  applicationId?: string;
  customerName?: string;
  customerPhone?: string;
  client: string;
  service: string;
  serviceCode?: string;
  serviceName?: string;
  gstin?: string;
  pan?: string;
  domain: DomainType | string;
  assignedTo: string;
  assignedAgent: string;
  priority: PriorityLevel | string;
  deadline?: string;
  dueDate: string;
  status: TaskStatus | string;
  assignedDate?: string;
  documentsCount: number;
  instructions?: string;
  checklist: ChecklistItem[];
  loanAmount?: string | number;
}

export interface ReviewDocument {
  id: string;
  name: string;
  type: string;
  file: string;
  verified: boolean;
  remarks: string;
}

export interface ReviewCase {
  id: string;
  taskId: string;
  client: string;
  service: string;
  assignedAgent: string;
  submittedAt: string;
  status: string;
  remarks: string;
  documents: ReviewDocument[];
}

export interface LeadItem {
  id: string;
  name: string;
  business: string;
  category: string;
  requestedAmount: number;
  phone: string;
  email: string;
  source: string;
  status: string;
  date: string;
  assignedOfficer: string;
}

export interface SanctionItem {
  sanctionId: string;
  appId: string;
  borrower: string;
  loanType: string;
  sanctionedAmount: number;
  roi: string;
  tenure: string;
  emi: string;
  processingFee: string;
  lender: string;
  acceptanceStatus: string;
  disbursementStatus: string;
  utrNumber: string;
  disbursedDate: string;
}

export interface RepaymentItem {
  installment: number;
  appId: string;
  borrower: string;
  dueDate: string;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
  status: string;
}

export interface TransactionItem {
  id: string;
  applicationId: string;
  customer: string;
  service: string;
  amount: string;
  rawAmount: number;
  mode: string;
  status: string;
  date: string;
}

export interface NotificationItemData {
  id: string;
  applicationId?: string;
  targetRole?: string;
  userId?: string;
  time: string;
  title: string;
  message: string;
  type: 'INFO' | 'PAYMENT' | 'WARNING' | 'SUCCESS' | 'ALERT' | string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId: string;
  recipientName: string;
  recipientRole: string;
  text: string;
  timestamp: string;
  time: string;
  read: boolean;
}
