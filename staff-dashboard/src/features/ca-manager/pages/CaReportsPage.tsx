import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, CheckCircle2, TrendingUp, BarChart2, X } from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import SummaryCard from '../../../core/components/SummaryCard/SummaryCard';
import Button from '../../../core/components/Button/Button';
import './CaReportsPage.css';

const CA_REPORTS_LIST = [
  { id: 'CAR-01', title: 'Monthly GST Reconciliation (GSTR-2B vs Books)', period: 'Sep 2026', category: 'GST', records: '142 Client Records', format: 'EXCEL (.xlsx)', size: '2.4 MB', date: '02 Oct 2026' },
  { id: 'CAR-02', title: 'Advance Tax Assessment FY26-27 (Q2 Audit)', period: 'Q2 FY26', category: 'TAX', records: '68 Client Records', format: 'PDF (.pdf)', size: '1.8 MB', date: '28 Sep 2026' },
  { id: 'CAR-03', title: 'ROC Annual Statutory Compliance Report (AOC-4/MGT-7)', period: 'FY25-26', category: 'ROC', records: '34 Companies', format: 'EXCEL (.xlsx)', size: '3.1 MB', date: '25 Sep 2026' },
  { id: 'CAR-04', title: 'CA Operations SLA & Turnaround Time Audit', period: 'Sep 2026', category: 'SLA', records: '312 Cases Tracked', format: 'PDF (.pdf)', size: '1.1 MB', date: '01 Oct 2026' },
];

export default function CaReportsPage() {
  const [reports, setReports] = useState(CA_REPORTS_LIST);
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const showToast = (message: string, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDownload = (item: any) => {
    const reportData = `CA Compliance Extract\nTitle: ${item.title}\nPeriod: ${item.period}\nRecords: ${item.records}\nGenerated: ${new Date().toISOString()}\n\nClient_ID,Client_Name,Filing_Status,Ack_No,Date\nCUST-01,Apex Engineering,FILED,ARN-998822,2026-09-18\nCUST-02,Zenith Techworks,FILED,ARN-112233,2026-09-19\n`;
    const blob = new Blob([reportData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}_${item.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded "${item.title}" successfully.`, 'success');
  };

  const filteredReports = reports.filter((r: any) => {
    if (selectedCat === 'ALL') return true;
    return r.category === selectedCat;
  });

  return (
    <div className="tx-ca-reports-page">
      <PageHeader
        title="CA Compliance & Audit Reports"
        subtitle="Download statutory compliance ledgers, tax reconciliation reports, and operational SLA audits"
        breadcrumb={['CA Domain', 'Reports', 'Audits']}
      />

      {toast && (
        <div className={`tx-ca-feedback-toast ${toast.type}`}>
          <CheckCircle2 size={16} />
          <span>{toast.message}</span>
          <button type="button" className="tx-close-toast" onClick={() => setToast(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <div className="tx-ca-report-kpis">
        <div className="tx-rep-kpi-card">
          <span className="tx-rep-kpi-val">98.4%</span>
          <span className="tx-rep-kpi-lbl">Statutory SLA Compliance</span>
        </div>
        <div className="tx-rep-kpi-card">
          <span className="tx-rep-kpi-val">0.2%</span>
          <span className="tx-rep-kpi-lbl">Notice Rejection Rate</span>
        </div>
        <div className="tx-rep-kpi-card">
          <span className="tx-rep-kpi-val">2.8 Days</span>
          <span className="tx-rep-kpi-lbl">Average Resolution Turnaround</span>
        </div>
      </div>

      <div className="tx-ca-report-filter-bar" style={{ display: 'flex', gap: '8px', margin: '16px 0' }}>
        <button
          type="button"
          className={`tx-filter-pill ${selectedCat === 'ALL' ? 'active' : ''}`}
          onClick={() => setSelectedCat('ALL')}
        >
          All Reports ({reports.length})
        </button>
        <button
          type="button"
          className={`tx-filter-pill ${selectedCat === 'GST' ? 'active' : ''}`}
          onClick={() => setSelectedCat('GST')}
        >
          GST Reconciliations
        </button>
        <button
          type="button"
          className={`tx-filter-pill ${selectedCat === 'TAX' ? 'active' : ''}`}
          onClick={() => setSelectedCat('TAX')}
        >
          Direct Tax &amp; Advance Tax
        </button>
        <button
          type="button"
          className={`tx-filter-pill ${selectedCat === 'ROC' ? 'active' : ''}`}
          onClick={() => setSelectedCat('ROC')}
        >
          MCA &amp; ROC
        </button>
      </div>

      <div className="tx-ca-reports-table-card">
        <div className="tx-table-container">
          <table className="tx-ca-rep-table">
            <thead>
              <tr>
                <th>Report Ref</th>
                <th>Report Title &amp; Scope</th>
                <th>Target Period</th>
                <th>Record Count</th>
                <th>Format</th>
                <th>File Size</th>
                <th>Generated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((item: any) => (
                <tr key={item.id}>
                  <td><strong>{item.id}</strong></td>
                  <td>
                    <div className="tx-rep-title-cell">
                      <strong>{item.title}</strong>
                    </div>
                  </td>
                  <td>{item.period}</td>
                  <td>{item.records}</td>
                  <td><span className="tx-rep-format-badge">{item.format}</span></td>
                  <td>{item.size}</td>
                  <td>{item.date}</td>
                  <td>
                    <button
                      type="button"
                      className="tx-btn-rep-download"
                      onClick={() => handleDownload(item)}
                    >
                      <Download size={14} />
                      <span>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
