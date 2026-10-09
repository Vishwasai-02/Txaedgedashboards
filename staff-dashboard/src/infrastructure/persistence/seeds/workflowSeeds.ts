import { WorkflowTask, ReviewCase, LeadItem, SanctionItem, RepaymentItem, ChatMessage } from '../../../shared/types/workflowTypes';

export const INITIAL_TASKS: WorkflowTask[] = [
  {
    id: 'TSK-101',
    serviceQueueId: 'SQ-101',
    applicationId: 'APP001',
    customerName: 'Apex Infra Projects LLP',
    customerPhone: '+91 98201 11223',
    client: 'Apex Infra Projects LLP',
    service: 'GST Return Filing (GSTR-3B)',
    serviceCode: 'TX-GST-RET',
    serviceName: 'GSTR-3B Monthly Return',
    gstin: '27AAACA1234B1Z5',
    domain: 'CA',
    assignedTo: 'AGT001',
    assignedAgent: 'Suresh Kumar',
    priority: 'HIGH',
    deadline: '2026-10-20',
    dueDate: '20 Oct 2026',
    status: 'IN_PROGRESS',
    assignedDate: '2026-09-20',
    documentsCount: 4,
    instructions: 'Verify electricity bill date and complete GST Portal registration',
    checklist: [
      { id: 'C1', title: 'Verify Aadhaar & PAN details', completed: true },
      { id: 'C2', title: 'Draft Form GST REG-01 application', completed: true },
      { id: 'C3', title: 'Generate & Validate OTP with Customer', completed: true },
      { id: 'C4', title: 'Submit application on GST Common Portal', completed: false },
      { id: 'C5', title: 'Verify ARN Generation & attach filing acknowledgment', completed: false }
    ]
  },
  {
    id: 'TSK-102',
    serviceQueueId: 'SQ-102',
    applicationId: 'APP002',
    customerName: 'Anil Sharma',
    customerPhone: '+91 99123 44556',
    client: 'Anil Sharma',
    service: 'ITR-2 Filing (Salaried + Capital Gains)',
    serviceCode: 'TX-ITR-IND',
    serviceName: 'ITR-2 Annual Filing',
    gstin: '27BCDEF2345G1Z2',
    domain: 'CA',
    assignedTo: 'AGT002',
    assignedAgent: 'Priya Sharma',
    priority: 'MEDIUM',
    deadline: '2026-10-25',
    dueDate: '25 Oct 2026',
    status: 'ASSIGNED',
    assignedDate: '2026-09-21',
    documentsCount: 3,
    instructions: 'Reconcile Form 16 Part A/B with 26AS dividend entries',
    checklist: [
      { id: 'C1', title: 'Download AIS and Form 26AS', completed: true },
      { id: 'C2', title: 'Compute Capital Gains from Zerodha Tax P&L', completed: false },
      { id: 'C3', title: 'Verify Chapter VI-A deductions', completed: false },
      { id: 'C4', title: 'Client Sign-off on Computation Draft', completed: false }
    ]
  },
  {
    id: 'TSK-103',
    serviceQueueId: 'SQ-103',
    applicationId: 'APP004',
    customerName: 'GreenLeaf Agrotech Pvt Ltd',
    customerPhone: '+91 98202 22334',
    client: 'GreenLeaf Agrotech Pvt Ltd',
    service: 'ROC Annual Filing (AOC-4 & MGT-7)',
    serviceCode: 'TX-MCA-ROC',
    serviceName: 'ROC Annual Compliance',
    gstin: '27AABCG5544K1ZV',
    domain: 'CA',
    assignedTo: 'AGT001',
    assignedAgent: 'Suresh Kumar',
    priority: 'URGENT',
    deadline: '2026-10-15',
    dueDate: '15 Oct 2026',
    status: 'IN_PROGRESS',
    assignedDate: '2026-09-18',
    documentsCount: 6,
    instructions: 'Check Director DSC validity before triggering MCA V3 upload',
    checklist: [
      { id: 'C1', title: 'Verify Signed Balance Sheet & P&L', completed: true },
      { id: 'C2', title: 'Draft Directors Report & Notice', completed: true },
      { id: 'C3', title: 'Obtain Audit Report with UDIN', completed: false },
      { id: 'C4', title: 'Execute Form AOC-4 on MCA Portal', completed: false }
    ]
  },
  {
    id: 'TSK-LN-201',
    serviceQueueId: 'SQ-LN-201',
    applicationId: 'LN-APP-801',
    customerName: 'Apex Infra Projects LLP',
    customerPhone: '+91 98201 11223',
    client: 'Apex Infra Projects LLP',
    service: 'Working Capital Term Loan Appraisal',
    serviceCode: 'LN-WCTL',
    serviceName: 'Working Capital Term Loan Appraisal',
    gstin: '27AAACA1234B1Z5',
    pan: 'AAACA1234B',
    domain: 'LOAN',
    assignedTo: 'AGT003',
    assignedAgent: 'Rajesh Patel',
    priority: 'HIGH',
    deadline: '2026-10-18',
    dueDate: '18 Oct 2026',
    status: 'IN_PROGRESS',
    assignedDate: '2026-09-22',
    loanAmount: '₹45,00,000',
    documentsCount: 5,
    instructions: 'Execute primary banker NOC and audited financial cross-checks.',
    checklist: [
      { id: 'C1', title: '6-Month Current Account Banking Analysis', completed: true },
      { id: 'C2', title: 'Audited P&L and Balance Sheet Cross-Verification', completed: true },
      { id: 'C3', title: 'Commercial Credit Bureau CMR-1 Report Review', completed: true },
      { id: 'C4', title: 'Syndicate Banker Appraisal Memo Finalization', completed: false }
    ]
  },
  {
    id: 'TSK-LN-202',
    serviceQueueId: 'SQ-LN-202',
    applicationId: 'LN-APP-802',
    customerName: 'Sanjay Deshmukh',
    customerPhone: '+91 98200 11998',
    client: 'Sanjay Deshmukh',
    service: 'Housing Loan Underwriting & Sanction',
    serviceCode: 'LN-HL',
    serviceName: 'Housing Loan Underwriting & Sanction',
    gstin: '27BCDEF2345G1Z2',
    pan: 'BCDEF2345G',
    domain: 'LOAN',
    assignedTo: 'AGT004',
    assignedAgent: 'Kavita Iyer',
    priority: 'URGENT',
    deadline: '2026-10-15',
    dueDate: '15 Oct 2026',
    status: 'PENDING_REVIEW',
    assignedDate: '2026-09-25',
    loanAmount: '₹72,00,000',
    documentsCount: 4,
    instructions: 'Complete property valuation appraisal and CIBIL report sign-off.',
    checklist: [
      { id: 'C1', title: 'Salary Slips and Form 16 Validation', completed: true },
      { id: 'C2', title: 'Property Legal Search & Title Search Report', completed: true },
      { id: 'C3', title: 'CIBIL Bureau Score 785 Verification', completed: true },
      { id: 'C4', title: 'Final Underwriting Sign-off and Sanction Letter', completed: false }
    ]
  },
  {
    id: 'TSK-LN-203',
    serviceQueueId: 'SQ-LN-203',
    applicationId: 'LN-APP-803',
    customerName: 'Nexus Retail Solutions',
    customerPhone: '+91 98203 33445',
    client: 'Nexus Retail Solutions',
    service: 'Machinery Hypothecation & Asset Loan',
    serviceCode: 'LN-MACH',
    serviceName: 'Machinery Hypothecation & Asset Loan',
    gstin: '27CDEFG3456H1Z4',
    pan: 'CDEFG3456H',
    domain: 'LOAN',
    assignedTo: 'AGT003',
    assignedAgent: 'Rajesh Patel',
    priority: 'MEDIUM',
    deadline: '2026-10-22',
    dueDate: '22 Oct 2026',
    status: 'ASSIGNED',
    assignedDate: '2026-09-28',
    loanAmount: '₹18,00,000',
    documentsCount: 3,
    instructions: 'Verify supplier proforma invoice and GSTIN registration status.',
    checklist: [
      { id: 'C1', title: 'Machinery Supplier Proforma Invoice Audit', completed: true },
      { id: 'C2', title: 'Promoter KYC & Business PAN Validation', completed: false },
      { id: 'C3', title: 'Asset Hypothecation Deed Drafting', completed: false }
    ]
  },
  {
    id: 'TSK-LN-204',
    serviceQueueId: 'SQ-LN-204',
    applicationId: 'LN-APP-804',
    customerName: 'Dr. Omkar Joshi',
    customerPhone: '+91 98204 44556',
    client: 'Dr. Omkar Joshi',
    service: 'Professional Practice Line of Credit',
    serviceCode: 'LN-PROF',
    serviceName: 'Professional Practice Line of Credit',
    gstin: '27DEFGH4567J1Z6',
    pan: 'DEFGH4567J',
    domain: 'LOAN',
    assignedTo: 'AGT004',
    assignedAgent: 'Kavita Iyer',
    priority: 'LOW',
    deadline: '2026-10-28',
    dueDate: '28 Oct 2026',
    status: 'DISBURSED',
    assignedDate: '2026-09-15',
    loanAmount: '₹15,00,000',
    documentsCount: 4,
    instructions: 'Disbursement released via UTR CMSICICI9821039821.',
    checklist: [
      { id: 'C1', title: 'Medical Council Registration Certificate Check', completed: true },
      { id: 'C2', title: '2-Year Clinic Income Tax Returns Verification', completed: true },
      { id: 'C3', title: 'Sanction Acceptance Memo Executed', completed: true },
      { id: 'C4', title: 'Disbursement Release to Beneficiary Account', completed: true }
    ]
  }
];

export const INITIAL_REVIEW_CASES: ReviewCase[] = [
  {
    id: 'DOC-REV-01',
    taskId: 'TSK-101',
    client: 'Apex Infra Projects LLP',
    service: 'GSTR-3B Monthly Return',
    assignedAgent: 'Suresh Kumar',
    submittedAt: 'Today, 11:30 AM',
    status: 'PENDING_REVIEW',
    remarks: '',
    documents: [
      { id: 'd1', name: 'PAN & GSTIN Certificate', type: 'PAN', file: 'apex_pan.pdf', verified: true, remarks: 'Matches ITD database' },
      { id: 'd2', name: 'GSTR-2B ITC Reconciliation Sheet', type: 'Worksheet', file: 'itc_recon_sep.xlsx', verified: true, remarks: 'Reconciled with 0 variance' },
      { id: 'd3', name: 'Challan Payment Receipt (PMT-06)', type: 'Receipt', file: 'pmt06_receipt.pdf', verified: true, remarks: '₹84,500 tax paid' },
      { id: 'd4', name: 'Client Signed Declaration', type: 'Consent', file: 'client_signoff.pdf', verified: false, remarks: 'Pending verification' }
    ]
  },
  {
    id: 'DOC-REV-02',
    taskId: 'TSK-103',
    client: 'GreenLeaf Agrotech Pvt Ltd',
    service: 'ROC Form AOC-4 XBRL',
    assignedAgent: 'Suresh Kumar',
    submittedAt: 'Yesterday, 04:15 PM',
    status: 'PENDING_REVIEW',
    remarks: '',
    documents: [
      { id: 'd5', name: 'Statutory Audit Report with UDIN', type: 'Audit', file: 'audit_report_udin.pdf', verified: true, remarks: 'UDIN verified on ICAI portal' },
      { id: 'd6', name: 'Notes to Financial Accounts', type: 'Financials', file: 'notes_to_accounts.pdf', verified: true, remarks: 'All schedules complete' }
    ]
  }
];

export const INITIAL_LEADS: LeadItem[] = [
  { id: 'LEAD-101', name: 'Vikram Mehta', business: 'Mehta Logistics', category: 'MSME', requestedAmount: 3500000, phone: '+91 98201 99887', email: 'vikram@mehtalogistics.in', source: 'Direct Website', status: 'NEW', date: 'Today, 09:30 AM', assignedOfficer: 'Rajesh Patel' },
  { id: 'LEAD-102', name: 'Dr. Omkar Joshi', business: 'Omkar Dental Clinic', category: 'Professional', requestedAmount: 1500000, phone: '+91 98204 44556', email: 'omkar@omkardental.com', source: 'CA Referral', status: 'CONTACTED', date: 'Yesterday', assignedOfficer: 'Rajesh Patel' },
  { id: 'LEAD-103', name: 'Kavita Sundaram', business: 'Sundaram Enterprises', category: 'Retail Salaried', requestedAmount: 6000000, phone: '+91 98207 11223', email: 'kavita.s@gmail.com', source: 'Partner NBFC', status: 'QUALIFIED', date: '01 Oct 2026', assignedOfficer: 'Rajesh Patel' },
  { id: 'LEAD-104', name: 'Rohan Deshpande', business: 'Deshpande Agro Mills', category: 'MSME', requestedAmount: 8000000, phone: '+91 98208 33445', email: 'rohan@deshpandeagro.com', source: 'Direct Lead', status: 'NEW', date: '30 Sep 2026', assignedOfficer: 'Rajesh Patel' }
];

export const INITIAL_SANCTIONS: SanctionItem[] = [
  {
    sanctionId: 'SANC-2026-081',
    appId: 'LN-APP-802',
    borrower: 'Sanjay Deshmukh',
    loanType: 'Housing Loan',
    sanctionedAmount: 7200000,
    roi: '8.40% p.a.',
    tenure: '240 Months (20 Years)',
    emi: '₹62,074',
    processingFee: '₹10,000 + GST',
    lender: 'ICICI Bank Home Finance',
    acceptanceStatus: 'ACCEPTED_BY_CLIENT',
    disbursementStatus: 'DISBURSED',
    utrNumber: 'CMSICICI9821039821',
    disbursedDate: '30 Sep 2026'
  },
  {
    sanctionId: 'SANC-2026-082',
    appId: 'LN-APP-801',
    borrower: 'Apex Infra Projects LLP',
    loanType: 'Working Capital Term Loan',
    sanctionedAmount: 4500000,
    roi: '10.50% p.a.',
    tenure: '36 Months (3 Years)',
    emi: '₹1,46,285',
    processingFee: '₹45,000 + GST',
    lender: 'HDFC Bank & SIDBI',
    acceptanceStatus: 'AWAITING_CUSTOMER_SIGNATURE',
    disbursementStatus: 'PENDING_DISBURSEMENT',
    utrNumber: 'PENDING',
    disbursedDate: 'Scheduled 05 Oct 2026'
  }
];

export const INITIAL_REPAYMENTS: RepaymentItem[] = [
  { installment: 1, appId: 'LN-APP-802', borrower: 'Sanjay Deshmukh', dueDate: '05 Nov 2026', emi: 62074, principal: 11674, interest: 50400, balance: 7188326, status: 'PAID' },
  { installment: 2, appId: 'LN-APP-802', borrower: 'Sanjay Deshmukh', dueDate: '05 Dec 2026', emi: 62074, principal: 11756, interest: 50318, balance: 7176570, status: 'PAID' },
  { installment: 3, appId: 'LN-APP-802', borrower: 'Sanjay Deshmukh', dueDate: '05 Jan 2027', emi: 62074, principal: 11838, interest: 50236, balance: 7164732, status: 'DUE' },
  { installment: 4, appId: 'LN-APP-802', borrower: 'Sanjay Deshmukh', dueDate: '05 Feb 2027', emi: 62074, principal: 11921, interest: 50153, balance: 7152811, status: 'UPCOMING' }
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'MSG-001',
    senderId: 'MGR001',
    senderName: 'Sanjay Verma',
    senderRole: 'CA_MANAGER',
    recipientId: 'ADM001',
    recipientName: 'Rohan Sharma',
    recipientRole: 'SUPER_ADMIN',
    text: 'Hi Admin, regarding the urgent GST filings for Apex Logistics.',
    timestamp: '2026-10-06T08:35:00.000Z',
    time: '14:05',
    read: true
  },
  {
    id: 'MSG-002',
    senderId: 'ADM001',
    senderName: 'Rohan Sharma',
    senderRole: 'SUPER_ADMIN',
    recipientId: 'MGR001',
    recipientName: 'Sanjay Verma',
    recipientRole: 'CA_MANAGER',
    text: 'Yes Sanjay, did the customer provide the amended electricity bill?',
    timestamp: '2026-10-06T08:42:00.000Z',
    time: '14:12',
    read: true
  },
  {
    id: 'MSG-003',
    senderId: 'MGR001',
    senderName: 'Sanjay Verma',
    senderRole: 'CA_MANAGER',
    recipientId: 'ADM001',
    recipientName: 'Rohan Sharma',
    recipientRole: 'SUPER_ADMIN',
    text: 'All high priority GST cases for Q2 have been verified and assigned.',
    timestamp: '2026-10-06T08:50:00.000Z',
    time: '14:20',
    read: true
  },
  {
    id: 'MSG-004',
    senderId: 'MGR002',
    senderName: 'Ananya Deshmukh',
    senderRole: 'LOAN_MANAGER',
    recipientId: 'ADM001',
    recipientName: 'Rohan Sharma',
    recipientRole: 'SUPER_ADMIN',
    text: 'Sanction letter for Sanjay Deshmukh is ready for dismittal.',
    timestamp: '2026-10-06T09:10:00.000Z',
    time: '14:40',
    read: true
  },
  {
    id: 'MSG-005',
    senderId: 'MGR001',
    senderName: 'Sanjay Verma',
    senderRole: 'CA_MANAGER',
    recipientId: 'AGT001',
    recipientName: 'Suresh Kumar',
    recipientRole: 'CA_AGENT',
    text: 'Suresh, please expedite GSTR-3B verification for Apex Infra.',
    timestamp: '2026-10-06T09:15:00.000Z',
    time: '14:45',
    read: true
  },
  {
    id: 'MSG-006',
    senderId: 'MGR002',
    senderName: 'Ananya Deshmukh',
    senderRole: 'LOAN_MANAGER',
    recipientId: 'AGT003',
    recipientName: 'Rajesh Patel',
    recipientRole: 'LOAN_AGENT',
    text: 'Rajesh, review the updated CIBIL score for Sanjay Deshmukh.',
    timestamp: '2026-10-06T09:20:00.000Z',
    time: '14:50',
    read: true
  }
];
