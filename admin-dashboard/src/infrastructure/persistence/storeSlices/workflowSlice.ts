import { ReviewCase, LeadItem, SanctionItem, RepaymentItem, TransactionItem } from '../../../shared/types/workflowTypes';
import { STORAGE_KEYS } from '../storageKeys';
import { publishStoreEvent } from '../storeCore';

export interface WorkflowStoreSliceState {
  reviewCases: ReviewCase[];
  leads: LeadItem[];
  sanctions: SanctionItem[];
  repayments: RepaymentItem[];
  transactions: TransactionItem[];
}

export const createWorkflowSlice = (
  state: WorkflowStoreSliceState,
  saveToStorage: (key: string, data: unknown) => void
) => ({
  getReviewCases: (): ReviewCase[] => [...state.reviewCases],

  addReviewCase: (reviewData: Partial<ReviewCase>): ReviewCase => {
    const newCase: ReviewCase = {
      id: reviewData.id || `DOC-REV-${Date.now().toString().slice(-3)}`,
      taskId: reviewData.taskId || '',
      client: reviewData.client || 'Client',
      service: reviewData.service || 'Document Review',
      assignedAgent: reviewData.assignedAgent || 'Agent',
      submittedAt: reviewData.submittedAt || 'Just now',
      status: reviewData.status || 'PENDING_REVIEW',
      remarks: reviewData.remarks || '',
      documents: reviewData.documents || [],
      ...reviewData
    };
    state.reviewCases = [newCase, ...state.reviewCases];
    saveToStorage(STORAGE_KEYS.REVIEW_CASES, state.reviewCases);
    publishStoreEvent('REVIEW_CASE_ADDED', newCase);
    return newCase;
  },

  updateReviewDocumentStatus: (caseId: string, docId: string, verified: boolean, remarks?: string): ReviewCase | null => {
    let updated: ReviewCase | null = null;
    state.reviewCases = state.reviewCases.map(c => {
      if (c.id === caseId) {
        const updatedDocs = c.documents.map(d => d.id === docId ? { ...d, verified, remarks: remarks !== undefined ? remarks : d.remarks } : d);
        updated = { ...c, documents: updatedDocs };
        return updated;
      }
      return c;
    });
    if (updated) {
      saveToStorage(STORAGE_KEYS.REVIEW_CASES, state.reviewCases);
      publishStoreEvent('REVIEW_DOCUMENT_UPDATED', updated);
    }
    return updated;
  },

  approveReviewCase: (caseId: string, remarks?: string): ReviewCase | null => {
    let updated: ReviewCase | null = null;
    state.reviewCases = state.reviewCases.map(c => {
      if (c.id === caseId) {
        updated = { ...c, status: 'APPROVED', remarks: remarks || 'Approved by Manager' };
        return updated;
      }
      return c;
    });
    if (updated) {
      saveToStorage(STORAGE_KEYS.REVIEW_CASES, state.reviewCases);
      publishStoreEvent('REVIEW_CASE_APPROVED', updated);
    }
    return updated;
  },

  rejectReviewCase: (caseId: string, remarks: string): ReviewCase | null => {
    let updated: ReviewCase | null = null;
    state.reviewCases = state.reviewCases.map(c => {
      if (c.id === caseId) {
        updated = { ...c, status: 'REJECTED', remarks: remarks || 'Correction requested by Manager' };
        return updated;
      }
      return c;
    });
    if (updated) {
      saveToStorage(STORAGE_KEYS.REVIEW_CASES, state.reviewCases);
      publishStoreEvent('REVIEW_CASE_REJECTED', updated);
    }
    return updated;
  },

  getLeads: (): LeadItem[] => [...state.leads],

  addLead: (leadData: Partial<LeadItem>): LeadItem => {
    const newLead: LeadItem = {
      id: leadData.id || `LEAD-${Date.now().toString().slice(-3)}`,
      name: leadData.name || '',
      business: leadData.business || '',
      category: leadData.category || 'MSME',
      requestedAmount: leadData.requestedAmount || 1000000,
      phone: leadData.phone || '',
      email: leadData.email || '',
      source: leadData.source || 'Website',
      status: leadData.status || 'NEW',
      date: leadData.date || 'Today',
      assignedOfficer: leadData.assignedOfficer || 'Rajesh Patel',
      ...leadData
    };
    state.leads = [newLead, ...state.leads];
    saveToStorage(STORAGE_KEYS.LEADS, state.leads);
    publishStoreEvent('LEAD_ADDED', newLead);
    return newLead;
  },

  updateLeadStatus: (id: string, status: string): LeadItem | null => {
    let updated: LeadItem | null = null;
    state.leads = state.leads.map(l => {
      if (l.id === id) {
        updated = { ...l, status };
        return updated;
      }
      return l;
    });
    if (updated) {
      saveToStorage(STORAGE_KEYS.LEADS, state.leads);
      publishStoreEvent('LEAD_STATUS_CHANGED', updated);
    }
    return updated;
  },

  convertLeadToApplication: (leadId: string): LeadItem | null => {
    let updated: LeadItem | null = null;
    state.leads = state.leads.map(l => {
      if (l.id === leadId) {
        updated = { ...l, status: 'CONVERTED' };
        return updated;
      }
      return l;
    });
    if (updated) {
      saveToStorage(STORAGE_KEYS.LEADS, state.leads);
      publishStoreEvent('LEAD_CONVERTED', updated);
    }
    return updated;
  },

  getSanctions: (): SanctionItem[] => [...state.sanctions],

  addSanction: (sanctionData: Partial<SanctionItem>): SanctionItem => {
    const newSanction: SanctionItem = {
      sanctionId: sanctionData.sanctionId || `SANC-2026-${Date.now().toString().slice(-3)}`,
      appId: sanctionData.appId || '',
      borrower: sanctionData.borrower || '',
      loanType: sanctionData.loanType || 'Business Loan',
      sanctionedAmount: sanctionData.sanctionedAmount || 1000000,
      roi: sanctionData.roi || '10.0%',
      tenure: sanctionData.tenure || '36 Months',
      emi: sanctionData.emi || '₹30,000',
      processingFee: sanctionData.processingFee || '₹10,000',
      lender: sanctionData.lender || 'TaxEdge NBFC Partner',
      acceptanceStatus: sanctionData.acceptanceStatus || 'AWAITING_CUSTOMER_SIGNATURE',
      disbursementStatus: sanctionData.disbursementStatus || 'PENDING_DISBURSEMENT',
      utrNumber: sanctionData.utrNumber || 'PENDING',
      disbursedDate: sanctionData.disbursedDate || 'Scheduled',
      ...sanctionData
    };
    state.sanctions = [newSanction, ...state.sanctions];
    saveToStorage(STORAGE_KEYS.SANCTIONS, state.sanctions);
    publishStoreEvent('SANCTION_ADDED', newSanction);
    return newSanction;
  },

  updateSanctionStatus: (sanctionId: string, acceptanceStatus?: string, disbursementStatus?: string, utrNumber?: string): SanctionItem | null => {
    let updated: SanctionItem | null = null;
    state.sanctions = state.sanctions.map(s => {
      if (s.sanctionId === sanctionId) {
        updated = {
          ...s,
          acceptanceStatus: acceptanceStatus !== undefined ? acceptanceStatus : s.acceptanceStatus,
          disbursementStatus: disbursementStatus !== undefined ? disbursementStatus : s.disbursementStatus,
          utrNumber: utrNumber !== undefined ? utrNumber : s.utrNumber
        };
        return updated;
      }
      return s;
    });
    if (updated) {
      saveToStorage(STORAGE_KEYS.SANCTIONS, state.sanctions);
      publishStoreEvent('SANCTION_UPDATED', updated);
    }
    return updated;
  },

  getRepayments: (): RepaymentItem[] => [...state.repayments],

  updateRepaymentStatus: (appId: string, installment: number, status: string): RepaymentItem | null => {
    let updated: RepaymentItem | null = null;
    state.repayments = state.repayments.map(r => {
      if (r.appId === appId && r.installment === installment) {
        updated = { ...r, status };
        return updated;
      }
      return r;
    });
    if (updated) {
      saveToStorage(STORAGE_KEYS.REPAYMENTS, state.repayments);
      publishStoreEvent('REPAYMENT_UPDATED', updated);
    }
    return updated;
  },

  getTransactions: (): TransactionItem[] => [...state.transactions],

  addTransaction: (txnData: Partial<TransactionItem>): TransactionItem => {
    const newTxn: TransactionItem = {
      id: txnData.id || `TXN-${Date.now().toString().slice(-4)}`,
      applicationId: txnData.applicationId || '',
      customer: txnData.customer || '',
      service: txnData.service || '',
      amount: txnData.amount || '₹ 0',
      rawAmount: txnData.rawAmount || 0,
      mode: txnData.mode || 'UPI',
      status: txnData.status || 'PAID',
      date: txnData.date || new Date().toISOString().replace('T', ' ').slice(0, 16),
      ...txnData
    };
    state.transactions = [newTxn, ...state.transactions];
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, state.transactions);
    publishStoreEvent('TRANSACTION_ADDED', newTxn);
    return newTxn;
  }
});
