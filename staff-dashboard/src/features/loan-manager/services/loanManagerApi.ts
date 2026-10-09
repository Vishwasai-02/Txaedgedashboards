import { sharedWorkflowStore, STORAGE_KEYS } from '../../../core/store/sharedWorkflowStore';
import { Employee, ApplicationItem } from '../../../shared/types/workflowTypes';

export const loanManagerApi = {
  getDashboardStats: async () => {
    const leads = sharedWorkflowStore.getLeads();
    const applications = sharedWorkflowStore.getApplications();
    const sanctions = sharedWorkflowStore.getSanctions();
    const disbursedSanctions = sanctions.filter((s) => s.disbursementStatus === 'DISBURSED');

    const totalDisbursedSum = disbursedSanctions.reduce(
      (sum, s) => sum + (Number(s.sanctionedAmount) || 0),
      0
    );

    const newLeadsCount = leads.filter((l) => l.status === 'NEW' || l.status === 'CONTACTED').length;
    const underReviewCount = applications.filter((a) => a.stage === 'UNDERWRITING' || a.stage === 'DOCUMENTS_VERIFICATION').length;
    const approvedCount = applications.filter((a) => a.status === 'APPROVED' || a.stage === 'SANCTIONED').length;
    const sanctionedCount = sanctions.length;
    const disbursedCount = disbursedSanctions.length;

    return {
      kpis: {
        totalApplications: applications.length,
        newLeads: newLeadsCount,
        underReview: underReviewCount,
        pendingDocs: 14,
        eligibilityPassed: applications.filter((a) => a.stage !== 'LEADS_INGESTED').length,
        approved: approvedCount,
        sanctioned: sanctionedCount,
        disbursed: disbursedCount,
        totalDisbursedAmount: totalDisbursedSum > 0
          ? `₹${(totalDisbursedSum / 10000000).toFixed(2)} Cr`
          : '₹3.45 Cr',
        avgProcessingDays: 5.4,
      },
      funnel: [
        { stage: 'Leads Ingested', count: leads.length + 40, percentage: 100 },
        { stage: 'Eligibility Cleared', count: applications.length + 30, percentage: 79 },
        { stage: 'Documents Verified', count: applications.length + 20, percentage: 58 },
        { stage: 'Underwriting Approved', count: approvedCount + 18, percentage: 46 },
        { stage: 'Sanctioned & Disbursed', count: disbursedCount + 14, percentage: 33 },
      ],
      recentApplications: applications.slice(0, 5).map((a) => ({
        id: a.id,
        borrower: a.borrower,
        type: a.loanType,
        requestedAmount: a.requestedAmount,
        cibilScore: a.cibilScore || 750,
        stage: a.stage,
        status: a.status,
        date: a.date || 'Today'
      }))
    };
  },

  getLeads: async () => {
    return sharedWorkflowStore.getLeads();
  },

  addLead: async (leadData: any) => {
    return sharedWorkflowStore.addLead(leadData);
  },

  convertLeadToApplication: async (leadId: string, convertForm?: any) => {
    return sharedWorkflowStore.convertLeadToApplication(leadId, convertForm);
  },

  getApplications: async () => {
    return sharedWorkflowStore.getApplications();
  },

  getApplicationById: async (id: string) => {
    return sharedWorkflowStore.getApplicationById(id);
  },

  updateApplicationStage: async (appId: string, newStage: string, newStatus: string) => {
    return sharedWorkflowStore.updateApplicationStatus(appId, newStatus);
  },

  getUnderwritingCases: async () => {
    const apps = sharedWorkflowStore.getApplications();
    const uwApps = apps.filter((a) =>
      a.stage === 'UNDERWRITING' ||
      a.stage === 'DOCUMENTS_VERIFICATION' ||
      a.stage === 'ELIGIBILITY_CHECK' ||
      a.status === 'IN_PROGRESS'
    );

    return (uwApps.length > 0 ? uwApps : apps).map((a, idx) => ({
      id: `UW-CASE-${String(idx + 1).padStart(2, '0')}`,
      appId: a.id,
      borrower: a.borrower,
      loanType: a.loanType,
      requestedAmount: a.requestedAmount,
      cibil: a.cibilScore || 750,
      syndicatePartner: a.bankPartner || 'HDFC Bank & SIDBI',
      defaultAmount: a.approvedAmount || a.requestedAmount,
      defaultRoi: 10.5,
      defaultTenure: a.tenureMonths || 36,
      checklist: [
        { id: 'c1', label: 'Statutory Financial Audit & Form 3CB/3CD Cleared', passed: true },
        { id: 'c2', label: 'Primary Banker Operational NOC Confirmed', passed: idx === 0 },
        { id: 'c3', label: 'Promoter Background & MCA DIN Cross-check Clear', passed: true },
        { id: 'c4', label: 'Commercial Contract Work Order Backing Verified', passed: idx === 0 },
      ]
    }));
  },

  signOffUnderwriting: async (appId: string, underwritingData?: any) => {
    return sharedWorkflowStore.updateApplication(appId, { status: 'SANCTIONED', ...underwritingData });
  },

  getSanctions: async () => {
    return sharedWorkflowStore.getSanctions();
  },

  disburseSanction: async (sanctionId: string) => {
    return sharedWorkflowStore.updateSanctionStatus(sanctionId, 'DISBURSED');
  },

  getRepaymentSchedule: async () => {
    return sharedWorkflowStore.getRepayments();
  },

  getTeam: async () => {
    const agents = sharedWorkflowStore.getEmployees(
      (e) => e.role === 'AGENT' && e.domain === 'LOAN'
    );
    return agents.map((a: any) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      phone: a.phone || '+91 99000 88776',
      role: a.roleDescription || a.team || 'Business Loan Credit Executive',
      activeCases: a.activeCases != null ? a.activeCases : 6,
      completedCases: a.completedCases != null ? a.completedCases : 15,
      completedMonth: a.completedCases != null ? a.completedCases : 15,
      avgTurnaround: a.avgTurnaround || a.avgResolutionDays || '3.2d',
      avgResolutionDays: a.avgResolutionDays || '3.2 Days',
      rating: a.rating != null ? (typeof a.rating === 'number' ? `${a.rating.toFixed(1)} / 5.0` : a.rating) : '4.8 / 5.0',
      status: a.status || 'AVAILABLE',
      department: a.team || 'Credit Underwriting',
      joinedDate: a.joinedDate || '2024-08-15',
      managerName: a.managerName || 'Ananya Deshmukh'
    }));
  },

  addAgent: async (agentData: any) => {
    return sharedWorkflowStore.addEmployee({
      ...agentData,
      role: 'AGENT',
      domain: 'LOAN',
      managerId: 'MGR002',
      managerName: 'Ananya Deshmukh',
      status: 'ACTIVE',
      team: agentData.department || agentData.team || 'Credit Underwriting & Syndicate',
      activeCases: Number(agentData.activeCases) || 0,
      completedCases: 0,
      rating: 5.0
    });
  },

  removeAgent: async (agentId: string) => {
    return sharedWorkflowStore.deleteEmployee(agentId);
  },

  getCustomers: async () => {
    return sharedWorkflowStore.getCustomers((c) => c.domain === 'LOAN' || c.assignedManagerId === 'MGR002').map((c) => ({
      id: c.id,
      name: c.businessName || c.name,
      borrower: c.name,
      businessName: c.businessName || c.name,
      gstin: c.gstin || '27AAACG0000A1Z5',
      pan: c.pan,
      contact: c.phone,
      email: c.email,
      activeLoans: c.activeFilings || c.totalApplications || 1,
      totalApplications: c.totalApplications || 1,
      kycStatus: c.kycStatus || 'VERIFIED',
      status: c.status || 'ACTIVE',
      assignedManagerName: c.assignedManagerName || 'Ananya Deshmukh'
    }));
  },

  addCustomer: async (customerData: any) => {
    return sharedWorkflowStore.addCustomer({
      ...customerData,
      domain: 'LOAN',
      assignedManagerId: 'MGR002',
      assignedManagerName: 'Ananya Deshmukh'
    });
  },

  getServiceQueue: async () => {
    return sharedWorkflowStore.getTasks((t) => t.domain === 'LOAN').map((t) => ({
      id: t.serviceQueueId || t.id,
      taskId: t.id,
      serviceCode: t.serviceCode || 'LN-GEN',
      serviceName: t.serviceName || t.service,
      client: t.customerName || t.client,
      clientPan: t.pan || t.gstin || '27AAACG0000A1Z5',
      priority: t.priority,
      dueDate: t.dueDate || t.deadline || '20 Oct 2026',
      assignedAgent: t.assignedAgent || 'Rajesh Patel',
      status: t.status,
      loanAmount: t.loanAmount || '₹25,00,000',
      documentsCount: t.documentsCount || (t.checklist ? t.checklist.length : 4),
      instructions: t.instructions || ''
    }));
  },

  assignAgent: async (caseId: string, agentName: string, details: any = {}) => {
    const agentMap: Record<string, string> = {
      'Rajesh Patel': 'AGT003',
      'Kavita Iyer': 'AGT004'
    };
    const task = sharedWorkflowStore.getTaskById(caseId);
    if (task) {
      return sharedWorkflowStore.updateTask(task.id, {
        assignedAgent: agentName,
        assignedTo: agentMap[agentName] || 'AGT003',
        priority: details.priority || task.priority,
        dueDate: details.dueDate || task.dueDate,
        deadline: details.dueDate || task.deadline,
        instructions: details.instructions || task.instructions,
        status: task.status === 'UNASSIGNED' ? 'ASSIGNED' : task.status
      });
    }
    return null;
  },

  updateServiceStatus: async (caseId: string, newStatus: string) => {
    const task = sharedWorkflowStore.getTaskById(caseId);
    if (task) {
      return sharedWorkflowStore.updateTask(task.id, { status: newStatus });
    }
    return null;
  },

  getFollowups: async () => {
    return [
      {
        id: 'FUP-LN-01',
        client: 'Apex Infra Projects LLP',
        contactPerson: 'Vikram Mehta',
        phone: '+91 98201 99887',
        reason: 'Original NOC from primary consortium banker needed for working capital term loan',
        channel: 'CALL & WHATSAPP',
        lastAttempt: 'Today, 11:15 AM',
        status: 'PENDING_RESPONSE',
        facility: 'Working Capital Term Loan (₹45L)'
      },
      {
        id: 'FUP-LN-02',
        client: 'Sanjay Deshmukh',
        contactPerson: 'Sanjay Deshmukh',
        phone: '+91 98200 11998',
        reason: 'Physical sign-off on housing loan sanction memo & builder tri-partite agreement',
        channel: 'SMS & PHONE',
        lastAttempt: 'Yesterday, 4:20 PM',
        status: 'FOLLOW_UP_SCHEDULED',
        facility: 'Housing Loan (₹72L)'
      },
      {
        id: 'FUP-LN-03',
        client: 'Nexus Retail Solutions',
        contactPerson: 'Kavita Sundaram',
        phone: '+91 98203 33445',
        reason: 'Supplier machinery proforma quotation and delivery schedule validation',
        channel: 'CALL & EMAIL',
        lastAttempt: 'Today, 09:45 AM',
        status: 'PENDING_RESPONSE',
        facility: 'Machinery Loan (₹18L)'
      },
      {
        id: 'FUP-LN-04',
        client: 'Dr. Omkar Joshi',
        contactPerson: 'Dr. Omkar Joshi',
        phone: '+91 98204 44556',
        reason: 'NACH e-Mandate auto-debit registration confirmation for EMI recovery',
        channel: 'EMAIL',
        lastAttempt: '02 Oct 2026',
        status: 'RESOLVED',
        facility: 'Professional Credit Line (₹15L)'
      }
    ];
  },

  subscribe: (cb: () => void) => {
    return sharedWorkflowStore.subscribeStore(cb);
  }
};
