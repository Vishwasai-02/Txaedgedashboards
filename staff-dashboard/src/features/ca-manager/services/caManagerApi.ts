import { sharedWorkflowStore, STORAGE_KEYS } from '../../../core/store/sharedWorkflowStore';
import { Customer, Employee, WorkflowTask, ReviewCase } from '../../../shared/types/workflowTypes';

export const caManagerApi = {
  getDashboardStats: async () => {
    const customers = sharedWorkflowStore.getCustomers((c: Customer) => c.domain === 'CA' || c.assignedManagerId === 'MGR001' || !c.domain);
    const tasks = sharedWorkflowStore.getTasks((t: WorkflowTask) => t.domain === 'CA');
    const reviewCases = sharedWorkflowStore.getReviewCases();

    const activeCases = tasks.filter((t: WorkflowTask) => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED' || t.status === 'REWORK_REQUIRED');
    const underReview = tasks.filter((t: WorkflowTask) => t.status === 'PENDING_REVIEW');
    const completed = tasks.filter((t: WorkflowTask) => t.status === 'COMPLETED' || t.status === 'FILED');

    return {
      kpis: {
        totalAssignedCustomers: customers.length,
        activeServiceRequests: activeCases.length,
        pendingDocuments: 15,
        casesUnderReview: underReview.length || reviewCases.filter((r: ReviewCase) => r.status === 'PENDING_REVIEW').length,
        upcomingDeadlines: 7,
        completedThisMonth: completed.length + 18,
        agentTeamSize: 6,
        avgTurnaroundDays: 2.8,
      },
      distribution: [
        { service: 'GSTR-3B Filing', count: 28, percentage: 35 },
        { service: 'ITR-3 Business', count: 20, percentage: 25 },
        { service: 'GST Registration', count: 14, percentage: 18 },
        { service: 'ROC AOC-4 Annual', count: 11, percentage: 14 },
        { service: 'Tax Audit (44AB)', count: 7, percentage: 8 },
      ],
      recentRequests: tasks.slice(0, 5).map((t: WorkflowTask) => ({
        id: t.serviceQueueId || t.id,
        client: t.customerName || t.client,
        service: t.service || t.serviceName,
        agent: t.assignedAgent || 'Suresh Kumar',
        assignedAgent: t.assignedAgent || 'Suresh Kumar',
        due: t.dueDate || t.deadline || '20 Oct 2026',
        status: t.status,
        priority: t.priority
      })),
      upcomingDeadlines: [
        { id: 'DL-01', form: 'GSTR-3B', period: 'Sep 2026', dueDate: '20 Oct 2026', category: 'GST', clientsAffected: 24, status: 'URGENT', urgency: 'URGENT', description: 'Monthly summary return for outward and inward supplies' },
        { id: 'DL-02', form: 'TCS Quarterly Return', period: 'Q2 FY26', dueDate: '15 Oct 2026', category: 'Direct Tax', clientsAffected: 12, status: 'HIGH', urgency: 'HIGH', description: 'Quarterly statement of tax collected at source' },
        { id: 'DL-03', form: 'GSTR-1 Monthly', period: 'Sep 2026', dueDate: '11 Oct 2026', category: 'GST', clientsAffected: 32, status: 'COMPLETED', urgency: 'COMPLETED', description: 'Statement of outward supplies of goods or services' },
        { id: 'DL-04', form: 'ROC AOC-4', period: 'FY25-26', dueDate: '29 Oct 2026', category: 'Corporate', clientsAffected: 8, status: 'MEDIUM', urgency: 'MEDIUM', description: 'Financial statements statutory filing with MCA' },
        { id: 'DL-05', form: 'Advance Tax Inst. 3', period: 'FY26-27', dueDate: '15 Dec 2026', category: 'Direct Tax', clientsAffected: 65, status: 'LOW', urgency: 'LOW', description: 'Third installment of advance corporate and direct tax' },
      ]
    };
  },

  getCustomers: async () => {
    return sharedWorkflowStore.getCustomers((c: Customer) => c.domain === 'CA' || c.assignedManagerId === 'MGR001' || !c.domain).map((c: Customer) => ({
      id: c.id,
      name: c.businessName || c.name,
      director: c.name,
      gstin: c.gstin,
      pan: c.pan,
      contact: c.phone,
      email: c.email,
      activeFilings: c.activeFilings || 1,
      totalFilings: c.totalFilings || c.totalApplications || 1,
      status: c.status || 'ACTIVE',
      assignedManagerName: c.assignedManagerName || 'Sanjay Verma'
    }));
  },

  addCustomer: async (customerData: Partial<Customer>) => {
    return sharedWorkflowStore.addCustomer({
      ...customerData,
      domain: 'CA',
      assignedManagerId: 'MGR001',
      assignedManagerName: 'Sanjay Verma'
    });
  },

  getServiceQueue: async () => {
    return sharedWorkflowStore.getTasks((t: WorkflowTask) => t.domain === 'CA').map((t: WorkflowTask) => ({
      id: t.serviceQueueId || t.id,
      taskId: t.id,
      serviceCode: t.serviceCode || 'TX-GST-RET',
      serviceName: t.serviceName || t.service,
      client: t.customerName || t.client,
      gstin: t.gstin || '27AAACA1234B1Z5',
      priority: t.priority,
      dueDate: t.dueDate || t.deadline || '20 Oct 2026',
      assignedAgent: t.assignedAgent || 'Suresh Kumar',
      status: t.status,
      documentsCount: t.documentsCount || (t.checklist ? t.checklist.length : 4),
      instructions: t.instructions || ''
    }));
  },

  assignAgent: async (caseId: string, agentName: string, details: any = {}) => {
    const agentMap: Record<string, string> = {
      'Suresh Kumar': 'AGT001',
      'Priya Sharma': 'AGT002',
      'Rahul Dave': 'AGT004',
      'Amit Singh': 'AGT004'
    };

    const task = sharedWorkflowStore.getTaskById(caseId);
    if (task) {
      return sharedWorkflowStore.updateTask(task.id, {
        assignedAgent: agentName,
        assignedTo: agentMap[agentName] || 'AGT001',
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

  getDocumentReviewCases: async () => {
    return sharedWorkflowStore.getReviewCases();
  },

  requestCorrection: async (caseId: string, remarks: string) => {
    return sharedWorkflowStore.rejectReviewCase(caseId, remarks);
  },

  approveCase: async (caseId: string) => {
    return sharedWorkflowStore.approveReviewCase(caseId);
  },

  getFilingCalendar: async () => {
    return [
      { id: 'CAL-01', form: 'GSTR-3B', period: 'Sep 2026', dueDate: '20 Oct 2026', category: 'GST', clientsAffected: 24, status: 'URGENT', penaltyRule: '₹50/day late fee + 18% p.a. interest' },
      { id: 'CAL-02', form: 'TCS Quarterly Return (Form 27EQ)', period: 'Q2 FY26', dueDate: '15 Oct 2026', category: 'Direct Tax', clientsAffected: 12, status: 'HIGH', penaltyRule: '₹200/day under Sec 234E' },
      { id: 'CAL-03', form: 'GSTR-1 Monthly Return', period: 'Sep 2026', dueDate: '11 Oct 2026', category: 'GST', clientsAffected: 32, status: 'COMPLETED', penaltyRule: '₹50/day late fee' },
      { id: 'CAL-04', form: 'ROC AOC-4 (Financial Statements)', period: 'FY25-26', dueDate: '29 Oct 2026', category: 'Corporate', clientsAffected: 8, status: 'MEDIUM', penaltyRule: '₹100/day under MCA rules' },
      { id: 'CAL-05', form: 'ROC MGT-7 (Annual Return)', period: 'FY25-26', dueDate: '29 Nov 2026', category: 'Corporate', clientsAffected: 8, status: 'LOW', penaltyRule: '₹100/day under MCA rules' },
      { id: 'CAL-06', form: 'Advance Tax 3rd Installment (75%)', period: 'FY26-27', dueDate: '15 Dec 2026', category: 'Direct Tax', clientsAffected: 65, status: 'LOW', penaltyRule: '1% per month Sec 234C' },
    ];
  },

  getTeam: async () => {
    const agents = sharedWorkflowStore.getEmployees(
      (e: any) => e.role === 'AGENT' && (e.domain === 'CA' || !e.domain)
    );
    return agents.map((a: any) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      phone: a.phone || '+91 97234 56789',
      role: a.roleDescription || a.team || 'Direct Tax & GST Executive',
      activeCases: a.activeCases != null ? a.activeCases : 8,
      completedCases: a.completedCases != null ? a.completedCases : 18,
      avgTurnaround: a.avgTurnaround || a.avgResolutionDays || '2.4d',
      avgResolutionDays: a.avgResolutionDays || '2.4 Days',
      rating: a.rating != null ? (typeof a.rating === 'number' ? `${a.rating.toFixed(1)} / 5.0` : a.rating) : '4.8 / 5.0',
      status: a.status || 'AVAILABLE',
      department: a.team || 'CA Operations',
      joinedDate: a.joinedDate || '2024-05-10',
      managerName: a.managerName || 'Sanjay Verma'
    }));
  },

  addAgent: async (agentData: any) => {
    return sharedWorkflowStore.addEmployee({
      ...agentData,
      role: 'AGENT',
      domain: 'CA',
      managerId: 'MGR001',
      managerName: 'Sanjay Verma',
      status: 'ACTIVE',
      team: agentData.department || agentData.team || 'Direct Tax & GST',
      roleDescription: agentData.role || 'Direct Tax Executive',
      activeCases: Number(agentData.activeCases) || 0,
      completedCases: 0,
      rating: 5.0
    });
  },

  removeAgent: async (agentId: string) => {
    return sharedWorkflowStore.deleteEmployee(agentId);
  },

  getFollowups: async () => {
    return [
      { id: 'FUP-01', client: 'Nexus Retail Solutions', contactPerson: 'Vikram Mehta', phone: '+91 98203 33445', reason: 'Fresh address proof electricity bill needed for GST amendment', channel: 'CALL & WHATSAPP', lastAttempt: 'Today, 10:00 AM', status: 'PENDING_RESPONSE' },
      { id: 'FUP-02', client: 'GreenLeaf Agrotech Pvt Ltd', contactPerson: 'Sanjay Deshmukh', phone: '+91 98202 22334', reason: 'Aadhaar OTP required for EVC verification of ITR-3', channel: 'SMS & PHONE', lastAttempt: 'Yesterday, 3:30 PM', status: 'FOLLOW_UP_SCHEDULED' },
      { id: 'FUP-03', client: 'Omkar Health Systems', contactPerson: 'Dr. Omkar Joshi', phone: '+91 98204 44556', reason: 'Director digital signature token (DSC) expiry renewal', channel: 'EMAIL', lastAttempt: '01 Oct 2026', status: 'RESOLVED' },
    ];
  },

  subscribe(keyOrCb: any, cb?: any) {
    const callback = typeof keyOrCb === 'function' ? keyOrCb : cb;
    return sharedWorkflowStore.subscribeStore(callback);
  }
};
