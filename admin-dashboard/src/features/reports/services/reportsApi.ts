import { apiClient } from '../../../core/services/apiClient';

let mockReports = [
  {
    id: 'RPT-101',
    name: 'Quarterly GST Compliance & Filing Audit',
    category: 'Tax Compliance',
    generatedDate: '2026-09-20',
    records: 1240,
    format: 'XLSX / PDF',
    size: '3.4 MB'
  },
  {
    id: 'RPT-102',
    name: 'ITR Assessment Year 2026-27 Summary',
    category: 'Direct Tax',
    generatedDate: '2026-09-18',
    records: 980,
    format: 'XLSX / CSV',
    size: '2.1 MB'
  },
  {
    id: 'RPT-103',
    name: 'Agent Productivity & SLA Adherence Report',
    category: 'Operations',
    generatedDate: '2026-09-15',
    records: 42,
    format: 'PDF',
    size: '1.2 MB'
  },
  {
    id: 'RPT-104',
    name: 'Merchant Payment Settlements & Gateway Fee Analysis',
    category: 'Finance',
    generatedDate: '2026-09-10',
    records: 3450,
    format: 'CSV',
    size: '4.8 MB'
  }
];

export const reportsApi = {
  async getReports() {
    const apiRes = await apiClient.get('/reporting/reports');
    if (apiRes) return apiRes;
    return mockReports;
  },

  async generateReport(type: string, params?: any) {
    const apiRes = await apiClient.post('/reporting/generate', { type, params });
    if (apiRes) return apiRes;

    const newReport = {
      id: `RPT-${Math.floor(100 + Math.random() * 900)}`,
      name: `${type} Export`,
      category: 'Custom Query',
      generatedDate: new Date().toISOString().split('T')[0],
      records: Math.floor(50 + Math.random() * 500),
      format: 'XLSX',
      size: '1.5 MB'
    };
    mockReports.unshift(newReport);
    return newReport;
  }
};
