import { apiClient } from '../../../core/services/apiClient';
import { sharedWorkflowStore, STORAGE_KEYS } from '../../../core/store/sharedWorkflowStore';

export const revenueApi = {
  async getRevenueData() {
    const apiRes = await apiClient.get('/dashboard/revenue');
    if (apiRes) return apiRes;
    const transactions = sharedWorkflowStore.getTransactions().map((t: any) => ({
      id: t.id,
      applicationId: t.applicationId || 'APP001',
      customer: t.client || t.customerName || t.customer || 'Client',
      service: t.service || 'GST Return Filing',
      amount: typeof t.amount === 'number' ? `₹${t.amount.toLocaleString('en-IN')}` : (t.amount || '₹2,500'),
      mode: t.mode || t.paymentMethod || 'Razorpay UPI',
      status: t.status || 'COMPLETED',
      date: t.date || t.timestamp || 'Today'
    }));

    return {
      transactions,
      timeframes: {
        totalRevenue: '₹48,25,000',
        thisMonth: '₹12,40,000',
        growth: '+18.5%',
        pendingSettlement: '₹1,85,000'
      },
      breakdowns: [
        { category: 'GST & Direct Tax Filing', revenue: '₹28,50,000', percentage: 59 },
        { category: 'Loan Processing Fees', revenue: '₹14,20,000', percentage: 29 },
        { category: 'ROC & Corporate Filings', revenue: '₹5,55,000', percentage: 12 }
      ]
    };
  },

  async reconcileSettlements() {
    const apiRes = await apiClient.post('/dashboard/revenue/reconcile', {});
    if (apiRes) return apiRes;
    const transactions = sharedWorkflowStore.getTransactions();
    return { success: true, reconciledCount: transactions.length };
  },

  subscribe(listener: () => void) {
    return sharedWorkflowStore.subscribeStore(listener);
  }
};
