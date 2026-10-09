import { apiClient } from '../../../core/services/apiClient';
import { sharedWorkflowStore } from '../../../core/store/sharedWorkflowStore';

export const overviewApi = {
  async getOverviewStats() {
    const apiRes = await apiClient.get('/dashboard/overview');
    if (apiRes) return apiRes;

    const customers = sharedWorkflowStore.getCustomers();
    const dynamicTotalCust = 1280 + (customers.length > 6 ? (customers.length - 6) : 0);
    const dynamicNewCust = 142 + (customers.length > 6 ? (customers.length - 6) : 0);

    return {
      summary: {
        totalCustomers: dynamicTotalCust.toLocaleString('en-IN'),
        newCustomers: dynamicNewCust.toLocaleString('en-IN'),
        totalApplications: '3,450',
        activeApplications: '48',
        completedApplications: '3,210',
        pendingApplications: '192',
        totalRevenue: '₹ 48.65 L',
        pendingPayments: '₹ 3.20 L',
        totalManagers: '8',
        totalAgents: '42',
        openSupportTickets: '15',
        amcCustomers: '310'
      },
      revenueTrends: [
        { month: 'Apr', revenue: 380000, target: 350000 },
        { month: 'May', revenue: 420000, target: 400000 },
        { month: 'Jun', revenue: 510000, target: 450000 },
        { month: 'Jul', revenue: 640000, target: 500000 },
        { month: 'Aug', revenue: 590000, target: 550000 },
        { month: 'Sep', revenue: 730000, target: 600000 }
      ],
      serviceDistribution: [
        { service: 'GST Registration & Filing', count: 1240, percentage: 36, color: '#083B75' },
        { service: 'ITR Filing (Salaried & Business)', count: 980, percentage: 28, color: '#0B5ED7' },
        { service: 'Business & MSME Loans', count: 560, percentage: 16, color: '#F97316' },
        { service: 'Company Incorporation / LLP', count: 390, percentage: 12, color: '#16A34A' },
        { service: 'Tax Audit & Insurance', count: 280, percentage: 8, color: '#052750' }
      ],
      recentActivity: [
        { id: 'ACT01', time: '10 mins ago', message: 'GST Application APP-1048 approved by Suresh Kumar' },
        { id: 'ACT02', time: '25 mins ago', message: 'Payment of ₹5,500 received for APP-1052 from Anil Sharma' },
        { id: 'ACT03', time: '1 hour ago', message: 'New ITR filing application created by Neha Patel (APP-1053)' },
        { id: 'ACT04', time: '2 hours ago', message: 'Manager Sanjay Verma assigned 4 new cases to Team Alpha' }
      ]
    };
  }
};
