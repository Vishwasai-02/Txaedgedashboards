import React, { useState, useEffect } from 'react';
import { Plus, Download, FileSpreadsheet, FileText, CheckCircle2, Calendar, X } from 'lucide-react';
import ReportsList from '../components/ReportsList';
import Button from '../../../core/components/Button/Button';
import Modal from '../../../core/components/Modal/Modal';
import { reportsApi } from '../services/reportsApi';
import './ReportsPage.css';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDateFilter, setActiveDateFilter] = useState('ALL');
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: string } | null>(null);

  const [formData, setFormData] = useState({
    name: 'GST Monthly Reconciliation Report',
    category: 'Indirect Tax',
    format: 'EXCEL (.xlsx)',
    dateRange: 'This Month'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setLoading(true);
    reportsApi.getReports().then((data) => {
      setReports(data);
      setLoading(false);
    });
  }, []);

  const showToast = (message: string, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDownloadReport = (report: any) => {
    const fileHeader = `Report: ${report.name}\nCategory: ${report.category}\nFormat: ${report.format}\nRecords: ${report.records}\nGenerated: ${new Date().toISOString()}\n\nSample Data Dump\nRecord_ID,Filing_Type,Client,Status,Timestamp\n101,GST_3B,Acme Corp,CLEARED,2026-09-20\n102,ITR_BIZ,Zenith Infotech,PROCESSED,2026-09-21\n103,MSME_LOAN,Apex Builders,SANCTIONED,2026-09-22\n`;
    const extension = report.format.includes('PDF') ? 'txt' : report.format.includes('CSV') ? 'csv' : 'csv';
    const blob = new Blob([fileHeader], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}_${report.id}.${extension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded "${report.name}" (${report.format}) successfully.`, 'success');
  };

  const validateReportForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 4) {
      errs.name = 'Report title must be at least 4 characters long.';
    }
    if (!formData.category.trim()) {
      errs.category = 'Report classification category is required.';
    }
    if (!formData.format.trim()) {
      errs.format = 'Output file format is required.';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateReportForm()) return;

    const newReport = {
      id: `REP-${Math.floor(100 + Math.random() * 900)}`,
      name: formData.name.trim(),
      category: formData.category,
      records: Math.floor(250 + Math.random() * 2500),
      format: formData.format,
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      generatedDate: 'Just now'
    };

    setReports([newReport, ...reports]);
    setGenerateModalOpen(false);
    showToast(`Report "${newReport.name}" generated with ${newReport.records} rows!`, 'success');
  };

  const filteredReports = reports.filter((rep: any) => {
    if (activeDateFilter === 'ALL') return true;
    if (activeDateFilter === 'TAX') return rep.category.includes('Tax');
    if (activeDateFilter === 'LOAN') return rep.category.includes('Loan');
    if (activeDateFilter === 'SLA') return rep.category.includes('Operations') || rep.category.includes('Compliance');
    return true;
  });

  return (
    <div className="tx-reports-page">
      {feedback && (
        <div className={`tx-reports-feedback-toast ${feedback.type}`}>
          <CheckCircle2 size={16} />
          <span>{feedback.message}</span>
          <button type="button" className="tx-close-toast" onClick={() => setFeedback(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <div className="tx-reports-page-header">
        <div className="tx-reports-page-title">
          <h2>Operational &amp; Statutory Reports</h2>
          <p>
            Audit extracts, GST ledger reconciliations, loan sanction summaries, and SLA compliance
          </p>
        </div>
        <Button
          variant="orange"
          icon={<Plus size={18} />}
          onClick={() => {
            setFormErrors({});
            setGenerateModalOpen(true);
          }}
        >
          Generate Custom Report
        </Button>
      </div>

      <div className="tx-reports-filters">
        <button
          type="button"
          className={`tx-filter-btn ${activeDateFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveDateFilter('ALL')}
        >
          All Reports ({reports.length})
        </button>
        <button
          type="button"
          className={`tx-filter-btn ${activeDateFilter === 'TAX' ? 'active' : ''}`}
          onClick={() => setActiveDateFilter('TAX')}
        >
          Direct &amp; Indirect Tax
        </button>
        <button
          type="button"
          className={`tx-filter-btn ${activeDateFilter === 'LOAN' ? 'active' : ''}`}
          onClick={() => setActiveDateFilter('LOAN')}
        >
          Loan Portfolio &amp; FOIR
        </button>
        <button
          type="button"
          className={`tx-filter-btn ${activeDateFilter === 'SLA' ? 'active' : ''}`}
          onClick={() => setActiveDateFilter('SLA')}
        >
          Operations &amp; Turnaround SLA
        </button>
      </div>

      <ReportsList
        reports={filteredReports}
        loading={loading}
        onDownload={handleDownloadReport}
      />

      {/* Generate Custom Report Modal */}
      <Modal
        isOpen={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        title="Schedule & Generate Operational Extract"
      >
        <form onSubmit={handleCreateReport} className="tx-report-form">
          <div className="tx-report-form-group">
            <label>Report Extract Title *</label>
            <input
              type="text"
              className={`tx-input ${formErrors.name ? 'is-invalid' : ''}`}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Q2 GST Return Audit"
            />
            {formErrors.name && <span className="tx-error-text">{formErrors.name}</span>}
          </div>

          <div className="tx-report-form-row">
            <div className="tx-report-form-group">
              <label>Domain Category *</label>
              <select
                className="tx-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Indirect Tax">Indirect Tax (GST/Customs)</option>
                <option value="Direct Tax">Direct Tax (ITR/TDS)</option>
                <option value="Loan Portfolio">Loan Portfolio &amp; Credit</option>
                <option value="Operations & Compliance">Operations &amp; Turnaround SLA</option>
              </select>
            </div>

            <div className="tx-report-form-group">
              <label>Output Format *</label>
              <select
                className="tx-input"
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
              >
                <option value="EXCEL (.xlsx)">Microsoft Excel (.xlsx)</option>
                <option value="CSV (.csv)">Raw CSV (.csv)</option>
                <option value="PDF Audit (.pdf)">Formatted PDF Audit (.pdf)</option>
              </select>
            </div>
          </div>

          <div className="tx-report-form-group">
            <label>Data Date Range</label>
            <select
              className="tx-input"
              value={formData.dateRange}
              onChange={(e) => setFormData({ ...formData, dateRange: e.target.value })}
            >
              <option value="This Month">Current Calendar Month</option>
              <option value="Last Month">Previous Calendar Month</option>
              <option value="Current Quarter">Current Financial Quarter (Q2 FY27)</option>
              <option value="Year to Date">Full Financial Year (FY26-27)</option>
            </select>
          </div>

          <div className="tx-modal-form-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" onClick={() => setGenerateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit">
              Compile &amp; Generate Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
